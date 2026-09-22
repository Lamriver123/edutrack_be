import { Logger } from '@nestjs/common';
import { UserRole } from './schemas/user.schema';
import { UsersService } from './users.service';

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));

const USER_ID = '68cf00000000000000000001';
const PAYMENT_FILE = {
  buffer: Buffer.from('payment-qr'),
  mimetype: 'image/png',
  originalname: 'payment-qr.png',
  size: 10,
};

type MockUser = {
  _id: { toString: () => string };
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBin?: string;
  bankCode?: string;
  bankLogoUrl?: string;
  bankName?: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  paymentQrImageData?: Buffer;
  recentMediaUrls?: string[];
  role: UserRole;
  save: jest.MockedFunction<() => Promise<void>>;
};

function createUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    _id: { toString: () => USER_ID },
    email: 'teacher@example.com',
    fullName: 'Nguyễn Thị Linh Chi',
    isEmailVerified: true,
    role: UserRole.Teacher,
    save: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createService(user: ReturnType<typeof createUser>) {
  const userModel = {
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    }),
  };
  const bankDirectoryService = {
    findBank: jest.fn().mockResolvedValue({
      bin: '970418',
      code: 'BIDV',
      id: 1,
      logo: 'https://cdn.vietqr.io/img/BIDV.png',
      name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
      shortName: 'BIDV',
    }),
    lookupAccount: jest.fn().mockResolvedValue({
      accountName: 'NGUYEN THI LINH CHI',
      accountNumber: '212025072004',
    }),
  };
  const cloudinaryService = {
    uploadTeacherMedia: jest.fn().mockResolvedValue({ url: 'https://res.cloudinary.com/test.jpg' }),
  };
  const service = new UsersService(
    userModel as never,
    { get: jest.fn() } as never,
    bankDirectoryService as never,
    cloudinaryService as never,
  );

  return { bankDirectoryService, cloudinaryService, service, userModel };
}

describe('UsersService payment QR', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the verified account holder for a bank BIN and account number', async () => {
    const user = createUser();
    const { bankDirectoryService, service } = createService(user);

    await expect(
      service.lookupBankAccount({
        accountNumber: '212025072004',
        bankBin: '970418',
      }),
    ).resolves.toEqual({
      accountName: 'NGUYEN THI LINH CHI',
      accountNumber: '212025072004',
      bankBin: '970418',
      bankLogoUrl: 'https://cdn.vietqr.io/img/BIDV.png',
      bankName: 'BIDV',
    });
    expect(bankDirectoryService.lookupAccount).toHaveBeenCalledWith(
      '970418',
      '212025072004',
    );
  });

  it('rejects a bank account whose holder cannot be verified', async () => {
    const user = createUser();
    const { bankDirectoryService, service } = createService(user);
    bankDirectoryService.lookupAccount.mockResolvedValueOnce(null);

    await expect(
      service.lookupBankAccount({
        accountNumber: '212025072004',
        bankBin: '970418',
      }),
    ).rejects.toMatchObject({
      response: {
        code: 'BANK_ACCOUNT_NOT_FOUND',
      },
      status: 422,
    });
  });

  it('updates bank metadata without replacing manually entered account fields', async () => {
    const user = createUser({
      bankAccountName: 'OLD NAME',
      bankAccountNumber: '0000000000',
    });
    const { service } = createService(user);
    const qrContent =
      'https://img.vietqr.io/image/970418-212025072004-compact2.png?accountName=NGUYEN%20THI%20LINH%20CHI';

    const result = await service.updatePaymentQr(
      USER_ID,
      PAYMENT_FILE,
      qrContent,
    );

    expect(user.bankAccountName).toBe('OLD NAME');
    expect(user.bankAccountNumber).toBe('0000000000');
    expect(user.bankBin).toBe('970418');
    expect(user.bankCode).toBe('BIDV');
    expect(user.bankName).toBe('BIDV');
    expect(user.bankLogoUrl).toBe('https://cdn.vietqr.io/img/BIDV.png');
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(result.paymentQrBankDetection).toEqual({
      bankBin: '970418',
      bankLogoUrl: 'https://cdn.vietqr.io/img/BIDV.png',
      bankName: 'BIDV',
    });
  });

  it('saves a recognized QR without requiring an account holder name', async () => {
    const user = createUser({
      bankAccountName: 'NGUYEN THI LINH CHI',
      bankAccountNumber: '1111111111',
    });
    const { service } = createService(user);

    const result = await service.updatePaymentQr(
      USER_ID,
      PAYMENT_FILE,
      'https://img.vietqr.io/image/970418-212025072004-compact2.png',
    );

    expect(user.save).toHaveBeenCalledTimes(1);
    expect(user.bankAccountName).toBe('NGUYEN THI LINH CHI');
    expect(user.bankAccountNumber).toBe('1111111111');
    expect(result.paymentQrBankDetection).toEqual({
      bankBin: '970418',
      bankLogoUrl: 'https://cdn.vietqr.io/img/BIDV.png',
      bankName: 'BIDV',
    });
  });

  it('does not save before an unrecognized QR is confirmed', async () => {
    const user = createUser();
    const { service } = createService(user);

    await expect(
      service.updatePaymentQr(USER_ID, PAYMENT_FILE),
    ).rejects.toMatchObject({
      response: {
        code: 'PAYMENT_QR_INFO_NOT_FOUND',
        reason: 'missing_qr_content',
      },
      status: 422,
    });
    expect(user.save).not.toHaveBeenCalled();
    expect(user.paymentQrImageData).toBeUndefined();
  });

  it('saves only the image after an unrecognized QR is confirmed', async () => {
    const user = createUser({
      bankAccountName: 'NGUYEN THI LINH CHI',
      bankAccountNumber: '212025072004',
      bankBin: '970418',
      bankName: 'BIDV',
    });
    const { service } = createService(user);

    const result = await service.updatePaymentQr(
      USER_ID,
      PAYMENT_FILE,
      undefined,
      true,
    );

    expect(user.bankAccountName).toBe('NGUYEN THI LINH CHI');
    expect(user.bankAccountNumber).toBe('212025072004');
    expect(user.bankBin).toBe('970418');
    expect(user.paymentQrImageData).toEqual(PAYMENT_FILE.buffer);
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(result.paymentQrBankDetection).toBeUndefined();
  });

  it('updates decoded bank metadata without requiring confirmation', async () => {
    const user = createUser({
      bankAccountName: 'NGUYEN THI LINH CHI',
      bankAccountNumber: '212025072004',
    });
    const { service } = createService(user);

    const result = await service.updatePaymentQr(
      USER_ID,
      PAYMENT_FILE,
      'https://img.vietqr.io/image/970418-999999993519-compact2.png',
    );

    expect(user.bankName).toBe('BIDV');
    expect(user.bankCode).toBe('BIDV');
    expect(user.bankBin).toBe('970418');
    expect(user.bankLogoUrl).toBe('https://cdn.vietqr.io/img/BIDV.png');
    expect(result.paymentQrBankDetection).toEqual({
      bankBin: '970418',
      bankLogoUrl: 'https://cdn.vietqr.io/img/BIDV.png',
      bankName: 'BIDV',
    });
  });
});

describe('UsersService media upload', () => {
  it('uploads media and keeps up to 5 recent urls', async () => {
    const user = createUser({
      recentMediaUrls: ['url1', 'url2', 'url3', 'url4', 'url5'],
    });
    const { service, cloudinaryService } = createService(user);
    
    cloudinaryService.uploadTeacherMedia.mockResolvedValueOnce({
      url: 'new_url',
    });

    const result = await service.uploadMedia(USER_ID, {
      buffer: Buffer.from('file'),
      mimetype: 'image/jpeg',
      originalname: 'test.jpg',
      size: 1000,
    });

    expect(cloudinaryService.uploadTeacherMedia).toHaveBeenCalledWith(
      expect.anything(),
      USER_ID
    );
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(result.url).toBe('new_url');
    // It should add 'new_url' and drop the last one 'url5' to keep length 5
    expect(user.recentMediaUrls).toEqual(['new_url', 'url1', 'url2', 'url3', 'url4']);
  });
});
