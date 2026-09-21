const VIETQR_GUID = 'A000000727';
const BANK_BIN_PATTERN = /^\d{6}$/;

export type VietQrPaymentInfo = {
  accountName?: string;
  accountNumber?: string;
  bankBin?: string;
  bankIdentifier?: string;
};

type TlvField = {
  id: string;
  value: string;
};

export function parseVietQrPaymentInfo(
  rawValue?: string,
): VietQrPaymentInfo | null {
  const value = rawValue?.trim();

  if (!value) {
    return null;
  }

  const quickLink = parseVietQrQuickLink(value);

  if (quickLink) {
    return quickLink;
  }

  const fields = parseTlv(value);
  const accountName = normalizeAccountName(findField(fields, '59'));

  for (const field of fields) {
    const id = Number(field.id);

    if (!Number.isInteger(id) || id < 26 || id > 51) {
      continue;
    }

    const merchantAccount = parseTlv(field.value);
    const guid = findField(merchantAccount, '00');

    if (guid !== VIETQR_GUID) {
      continue;
    }

    const beneficiary = parseTlv(findField(merchantAccount, '01') ?? '');
    const bankBin = findField(beneficiary, '00')?.trim();
    const accountNumber = findField(beneficiary, '01')?.trim();

    if (!bankBin && !accountNumber) {
      return null;
    }

    return {
      ...(accountName ? { accountName } : {}),
      accountNumber: accountNumber || undefined,
      bankBin: bankBin && BANK_BIN_PATTERN.test(bankBin) ? bankBin : undefined,
      bankIdentifier: bankBin || undefined,
    };
  }

  return null;
}

function parseVietQrQuickLink(value: string): VietQrPaymentInfo | null {
  try {
    const url = new URL(value);

    if (url.hostname !== 'img.vietqr.io') {
      return null;
    }

    const match = url.pathname.match(
      /^\/image\/([a-z0-9]+)-([a-z0-9]+)-(?:[^/]+)\.(?:png|jpe?g|webp)$/i,
    );

    if (!match) {
      return null;
    }

    const bankIdentifier = match[1];
    const accountName = normalizeAccountName(
      url.searchParams.get('accountName') ?? undefined,
    );

    return {
      ...(accountName ? { accountName } : {}),
      accountNumber: match[2],
      bankBin: BANK_BIN_PATTERN.test(bankIdentifier)
        ? bankIdentifier
        : undefined,
      bankIdentifier,
    };
  } catch {
    return null;
  }
}

function normalizeAccountName(value?: string) {
  const normalized = value?.trim().replace(/\s+/g, ' ');

  return normalized && normalized.length <= 100 ? normalized : undefined;
}

function parseTlv(value: string) {
  const fields: TlvField[] = [];
  let offset = 0;

  while (offset + 4 <= value.length) {
    const id = value.slice(offset, offset + 2);
    const lengthText = value.slice(offset + 2, offset + 4);

    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(lengthText)) {
      break;
    }

    const length = Number(lengthText);
    const start = offset + 4;
    const end = start + length;

    if (end > value.length) {
      break;
    }

    fields.push({ id, value: value.slice(start, end) });
    offset = end;
  }

  return fields;
}

function findField(fields: TlvField[], id: string) {
  return fields.find((field) => field.id === id)?.value;
}
