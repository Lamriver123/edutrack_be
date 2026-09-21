import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BANKS_API_URL = 'https://api.vietqr.io/v2/banks';
const DEFAULT_ACCOUNT_LOOKUP_API_URL = 'https://api.vietqr.io/v2/lookup';
const BANK_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const BANK_LOGO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const BANK_LOGO_MAX_BYTES = 512 * 1024;
const BANK_LOGO_HOSTS = new Set([
  'api.vietqr.io',
  'cdn.vietqr.io',
  'vietqr.net',
]);

export type PaymentBank = {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  lookupSupported?: boolean;
};

export type BankAccountLookup = {
  accountName: string;
  accountNumber: string;
};

type TimedCache<T> = {
  expiresAt: number;
  value: T;
};

@Injectable()
export class BankDirectoryService {
  private readonly logger = new Logger(BankDirectoryService.name);
  private bankCache?: TimedCache<PaymentBank[]>;
  private readonly logoCache = new Map<string, TimedCache<string>>();

  constructor(private readonly configService: ConfigService) {}

  async getBanks() {
    const cached = this.bankCache;

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    try {
      const response = await fetch(BANKS_API_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        throw new Error(`VietQR returned ${response.status}`);
      }

      const payload: unknown = await response.json();
      const records =
        isRecord(payload) && Array.isArray(payload.data) ? payload.data : [];
      const banks = records
        .map(normalizeBank)
        .filter((bank): bank is PaymentBank => Boolean(bank))
        .sort((first, second) =>
          first.shortName.localeCompare(second.shortName, 'vi'),
        );

      if (!banks.length) {
        throw new Error('VietQR returned an empty bank directory');
      }

      this.bankCache = {
        expiresAt: Date.now() + BANK_CACHE_TTL_MS,
        value: banks,
      };

      return banks;
    } catch {
      if (cached?.value.length) {
        return cached.value;
      }

      throw new ServiceUnavailableException(
        'Chưa thể tải danh sách ngân hàng. Vui lòng thử lại sau.',
      );
    }
  }

  async findBank(identifier?: string) {
    const normalized = identifier?.trim().toLowerCase();

    if (!normalized) {
      return null;
    }

    const banks = await this.getBanks();

    return (
      banks.find(
        (bank) =>
          bank.bin.toLowerCase() === normalized ||
          bank.code.toLowerCase() === normalized ||
          bank.shortName.toLowerCase() === normalized,
      ) ?? null
    );
  }

  async lookupAccount(
    bankBin: string,
    accountNumber: string,
  ): Promise<BankAccountLookup | null> {
    const clientId =
      this.configService.get<string>('vietQr.clientId')?.trim() ?? '';
    const apiKey =
      this.configService.get<string>('vietQr.apiKey')?.trim() ?? '';
    const lookupUrl =
      this.configService.get<string>('vietQr.accountLookupUrl')?.trim() ||
      DEFAULT_ACCOUNT_LOOKUP_API_URL;

    if (!clientId || !apiKey) {
      this.logger.warn(
        'Bank account lookup skipped reason=missing_credentials required=VIETQR_CLIENT_ID,VIETQR_API_KEY',
      );
      throw new ServiceUnavailableException({
        code: 'BANK_ACCOUNT_LOOKUP_NOT_CONFIGURED',
        message:
          'Dịch vụ xác minh tên chủ tài khoản chưa được cấu hình trên máy chủ.',
      });
    }

    const startedAt = Date.now();
    const lookupTrace =
      `provider=vietqr endpoint=${safeEndpoint(lookupUrl)}` +
      ` bank=${bankBin} account=${maskAccountNumber(accountNumber)}` +
      ` accountLength=${accountNumber.length}`;

    this.logger.log(`Bank account lookup started ${lookupTrace}`);

    try {
      const response = await fetch(lookupUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-client-id': clientId,
        },
        body: JSON.stringify({
          accountNumber,
          bin: Number(bankBin),
        }),
        signal: AbortSignal.timeout(8000),
      });
      const payload: unknown = await response.json().catch(() => null);
      const responseCode = isRecord(payload) ? stringValue(payload.code) : '';
      const providerDescription = isRecord(payload)
        ? stringValue(payload.desc || payload.message)
        : '';
      const data =
        isRecord(payload) && isRecord(payload.data) ? payload.data : null;
      const accountName = data
        ? stringValue(data.accountName || data.account_name)
        : '';
      const responseTrace =
        `${lookupTrace} httpStatus=${response.status}` +
        ` providerCode=${quotedLogValue(responseCode)}` +
        ` providerDescription=${quotedLogValue(providerDescription)}` +
        ` hasData=${Boolean(data)} hasAccountName=${Boolean(accountName)}` +
        ` durationMs=${Date.now() - startedAt}`;

      if (!response.ok) {
        this.logger.warn(`Bank account lookup HTTP error ${responseTrace}`);

        if (response.status === 401 || response.status === 403) {
          throw new ServiceUnavailableException({
            code: 'BANK_ACCOUNT_LOOKUP_UNAUTHORIZED',
            message:
              'Thông tin kết nối VietQR không hợp lệ hoặc chưa được cấp quyền tra cứu.',
          });
        }

        if (response.status === 429) {
          throw new ServiceUnavailableException({
            code: 'BANK_ACCOUNT_LOOKUP_RATE_LIMITED',
            message:
              'Dịch vụ xác minh tài khoản đang vượt giới hạn yêu cầu. Vui lòng thử lại sau.',
          });
        }

        throw new ServiceUnavailableException({
          code: 'BANK_ACCOUNT_LOOKUP_UNAVAILABLE',
          message:
            'Dịch vụ xác minh tài khoản ngân hàng đang tạm thời không khả dụng.',
        });
      }

      if (
        responseCode === '47' ||
        /free plan.+no longer support/i.test(providerDescription)
      ) {
        throw new ServiceUnavailableException({
          code: 'BANK_ACCOUNT_LOOKUP_PLAN_UNAVAILABLE',
          message:
            'Gói VietQR hiện tại không còn hỗ trợ tra cứu tên chủ tài khoản. Vui lòng cấu hình dịch vụ tra cứu có quyền truy cập.',
        });
      }

      if (!['0', '00'].includes(responseCode) || !accountName) {
        this.logger.warn(`Bank account lookup rejected ${responseTrace}`);
        return null;
      }

      this.logger.log(`Bank account lookup succeeded ${responseTrace}`);

      return {
        accountName,
        accountNumber,
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.warn(
        `Bank account lookup failed ${lookupTrace}` +
          ` durationMs=${Date.now() - startedAt}` +
          ` error=${quotedLogValue(error instanceof Error ? error.message : 'unknown')}`,
      );
      throw new ServiceUnavailableException({
        code: 'BANK_ACCOUNT_LOOKUP_UNAVAILABLE',
        message:
          'Dịch vụ xác minh tài khoản ngân hàng đang tạm thời không khả dụng.',
      });
    }
  }

  async getLogoDataUrl(logoUrl?: string) {
    if (!isAllowedBankLogoUrl(logoUrl)) {
      return undefined;
    }

    const cached = this.logoCache.get(logoUrl);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    try {
      const response = await fetch(logoUrl, {
        headers: { Accept: 'image/png,image/jpeg,image/webp' },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        return undefined;
      }

      const contentType = response.headers.get('content-type')?.split(';')[0];

      if (!contentType?.match(/^image\/(png|jpeg|webp)$/)) {
        return undefined;
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      if (!buffer.length || buffer.length > BANK_LOGO_MAX_BYTES) {
        return undefined;
      }

      const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;
      this.logoCache.set(logoUrl, {
        expiresAt: Date.now() + BANK_LOGO_CACHE_TTL_MS,
        value: dataUrl,
      });

      return dataUrl;
    } catch {
      return undefined;
    }
  }
}

function normalizeBank(value: unknown): PaymentBank | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = Number(value.id);
  const name = stringValue(value.name);
  const code = stringValue(value.code);
  const bin = stringValue(value.bin);
  const shortName = stringValue(value.shortName || value.short_name);
  const logo = stringValue(value.logo);
  const lookupSupported = Number(value.lookupSupported) === 1;

  if (
    !Number.isFinite(id) ||
    !name ||
    !code ||
    !/^\d{6}$/.test(bin) ||
    !shortName ||
    !isAllowedBankLogoUrl(logo)
  ) {
    return null;
  }

  return { id, name, code, bin, shortName, logo, lookupSupported };
}

function isAllowedBankLogoUrl(value?: string): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      BANK_LOGO_HOSTS.has(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.port
    );
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }

  return typeof value === 'number' ? String(value) : '';
}

function maskAccountNumber(value: string) {
  return value.length <= 4
    ? '*'.repeat(value.length)
    : `${'*'.repeat(value.length - 4)}${value.slice(-4)}`;
}

function quotedLogValue(value: string) {
  const normalized = value
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, 180);
  return JSON.stringify(normalized || 'missing');
}

function safeEndpoint(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return 'invalid_url';
  }
}
