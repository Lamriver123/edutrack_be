import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { BankDirectoryService } from './bank-directory.service';

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));

describe('BankDirectoryService', () => {
  const originalFetch = global.fetch;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  function createService(credentials?: { apiKey: string; clientId: string }) {
    const values: Record<string, string | undefined> = {
      'vietQr.accountLookupUrl': 'https://api.vietqr.io/v2/lookup',
      'vietQr.apiKey': credentials?.apiKey,
      'vietQr.clientId': credentials?.clientId,
    };
    const configService = {
      get: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;

    return new BankDirectoryService(configService);
  }

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('normalizes and sorts the VietQR bank directory', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          data: [
            {
              bin: '970436',
              code: 'VCB',
              id: 43,
              logo: 'https://cdn.vietqr.io/img/VCB.png',
              lookupSupported: 1,
              name: 'Ngân hàng Ngoại thương Việt Nam',
              shortName: 'Vietcombank',
            },
            {
              bin: '970416',
              code: 'ACB',
              id: 2,
              logo: 'https://cdn.vietqr.io/img/ACB.png',
              lookupSupported: 0,
              name: 'Ngân hàng Á Châu',
              shortName: 'ACB',
            },
          ],
        }),
      ok: true,
    });

    const service = createService();

    await expect(service.getBanks()).resolves.toEqual([
      expect.objectContaining({
        bin: '970416',
        lookupSupported: false,
        shortName: 'ACB',
      }),
      expect.objectContaining({
        bin: '970436',
        lookupSupported: true,
        shortName: 'Vietcombank',
      }),
    ]);
  });

  it('embeds a whitelisted VietQR CDN logo as a data URL', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(Uint8Array.from([1, 2, 3]).buffer),
      headers: new Headers({ 'content-type': 'image/png' }),
      ok: true,
    });

    const service = createService();

    await expect(
      service.getLogoDataUrl('https://cdn.vietqr.io/img/VCB.png'),
    ).resolves.toBe('data:image/png;base64,AQID');
  });

  it('looks up an account holder with server-side credentials', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          code: '00',
          data: { accountName: 'NGUYEN THI LINH CHI' },
        }),
      ok: true,
    });
    const service = createService({
      apiKey: 'test-api-key',
      clientId: 'test-client-id',
    });

    await expect(
      service.lookupAccount('970418', '212025072004'),
    ).resolves.toEqual({
      accountName: 'NGUYEN THI LINH CHI',
      accountNumber: '212025072004',
    });

    const [requestUrl, requestOptions] = (
      global.fetch as jest.MockedFunction<typeof fetch>
    ).mock.calls[0];

    expect(requestUrl).toBe('https://api.vietqr.io/v2/lookup');
    expect(requestOptions?.method).toBe('POST');
    expect(requestOptions?.body).toBe(
      JSON.stringify({
        accountNumber: '212025072004',
        bin: 970418,
      }),
    );
    expect(requestOptions?.headers).toMatchObject({
      'x-api-key': 'test-api-key',
      'x-client-id': 'test-client-id',
    });
  });

  it('rejects account lookup when credentials are not configured', async () => {
    global.fetch = jest.fn();
    const service = createService();

    await expect(
      service.lookupAccount('970418', '212025072004'),
    ).rejects.toMatchObject({
      response: {
        code: 'BANK_ACCOUNT_LOOKUP_NOT_CONFIGURED',
      },
      status: 503,
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('logs the provider code and description when lookup is rejected', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          code: '51',
          data: null,
          desc: 'Account not found',
        }),
      ok: true,
      status: 200,
    });
    const service = createService({
      apiKey: 'test-api-key',
      clientId: 'test-client-id',
    });

    await expect(
      service.lookupAccount('970418', '212025072004'),
    ).resolves.toBeNull();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'providerCode="51" providerDescription="Account not found"',
      ),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.not.stringContaining('212025072004'),
    );
  });

  it('reports an unavailable VietQR plan instead of an invalid account', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          code: '47',
          data: null,
          desc: 'The Free Plan will no longer support from August 20, 2024.',
        }),
      ok: true,
      status: 200,
    });
    const service = createService({
      apiKey: 'test-api-key',
      clientId: 'test-client-id',
    });

    await expect(
      service.lookupAccount('970418', '212025072004'),
    ).rejects.toMatchObject({
      response: {
        code: 'BANK_ACCOUNT_LOOKUP_PLAN_UNAVAILABLE',
      },
      status: 503,
    });
  });
});
