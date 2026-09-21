import { parseVietQrPaymentInfo } from './vietqr-parser';

function tlv(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

describe('parseVietQrPaymentInfo', () => {
  it('extracts the bank BIN and account number from a VietQR payload', () => {
    const beneficiary = tlv('00', '970422') + tlv('01', '0123456789');
    const merchantAccount =
      tlv('00', 'A000000727') + tlv('01', beneficiary) + tlv('02', 'QRIBFTTA');
    const payload = tlv('00', '01') + tlv('38', merchantAccount);

    expect(parseVietQrPaymentInfo(payload)).toEqual({
      accountNumber: '0123456789',
      bankBin: '970422',
      bankIdentifier: '970422',
    });
  });

  it('extracts bank information from a VietQR quick link', () => {
    expect(
      parseVietQrPaymentInfo(
        'https://img.vietqr.io/image/970436-123456789-compact2.png',
      ),
    ).toEqual({
      accountNumber: '123456789',
      bankBin: '970436',
      bankIdentifier: '970436',
    });
  });

  it('extracts an account holder name embedded in a VietQR payload', () => {
    const beneficiary = tlv('00', '970422') + tlv('01', '0123456789');
    const merchantAccount =
      tlv('00', 'A000000727') + tlv('01', beneficiary) + tlv('02', 'QRIBFTTA');
    const payload =
      tlv('00', '01') +
      tlv('38', merchantAccount) +
      tlv('59', 'NGUYEN THI LINH CHI');

    expect(parseVietQrPaymentInfo(payload)).toEqual({
      accountName: 'NGUYEN THI LINH CHI',
      accountNumber: '0123456789',
      bankBin: '970422',
      bankIdentifier: '970422',
    });
  });

  it('extracts an account holder name from a VietQR quick link', () => {
    expect(
      parseVietQrPaymentInfo(
        'https://img.vietqr.io/image/BIDV-212025072004-compact2.png?accountName=NGUYEN%20THI%20LINH%20CHI',
      ),
    ).toEqual({
      accountName: 'NGUYEN THI LINH CHI',
      accountNumber: '212025072004',
      bankIdentifier: 'BIDV',
    });
  });

  it('ignores QR values that are not VietQR payment data', () => {
    expect(parseVietQrPaymentInfo('https://example.com')).toBeNull();
  });
});
