import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { CloudinaryService, type UploadImageFile } from '../cloudinary/cloudinary.service';
import {
  BankDirectoryService,
  type PaymentBank,
} from './bank-directory.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LookupBankAccountDto } from './dto/lookup-bank-account.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  PAYMENT_QR_INFO_NOT_FOUND_CODE,
  PAYMENT_QR_INFO_NOT_FOUND_MESSAGE,
} from './payment-qr.constants';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { SafeUser } from './types/safe-user.type';
import { parseVietQrPaymentInfo } from './utils/vietqr-parser';

type CreateTeacherInput = {
  fullName: string;
  email: string;
  passwordHash: string;
  otpHash: string;
  otpExpiresAt: Date;
  otpResendAvailableAt: Date;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly bankDirectoryService: BankDirectoryService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  createTeacher(input: CreateTeacherInput) {
    return this.userModel.create({
      ...input,
      email: this.normalizeEmail(input.email),
      role: UserRole.Teacher,
      isEmailVerified: false,
      otpAttempts: 0,
    });
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email: this.normalizeEmail(email) }).exec();
  }

  findByEmailWithSecrets(email: string) {
    return this.userModel
      .findOne({ email: this.normalizeEmail(email) })
      .select(
        '+passwordHash +otpHash +otpExpiresAt +otpAttempts +otpResendAvailableAt +pendingPasswordHash +passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts +passwordResetOtpResendAvailableAt +refreshTokenHash +refreshTokenExpiresAt',
      )
      .exec();
  }

  findByIdWithSecrets(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.userModel
      .findById(id)
      .select(
        '+passwordHash +otpHash +otpExpiresAt +otpAttempts +otpResendAvailableAt +pendingPasswordHash +passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts +passwordResetOtpResendAvailableAt +refreshTokenHash +refreshTokenExpiresAt',
      )
      .exec();
  }

  findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.userModel.findById(id).exec();
  }

  async getProfile(userId: string) {
    const user = await this.findByIdOrThrow(userId);

    return this.toSafeUser(user);
  }

  getBanks() {
    return this.bankDirectoryService.getBanks();
  }

  async lookupBankAccount(dto: LookupBankAccountDto) {
    const bank = await this.bankDirectoryService.findBank(dto.bankBin);

    if (!bank) {
      throw new BadRequestException({
        code: 'BANK_NOT_FOUND',
        message: 'Không tìm thấy ngân hàng đã chọn trong danh mục VietQR.',
      });
    }

    this.logger.log(
      `Bank account verification requested bank=${bank.bin}` +
        ` bankCode=${bank.code} lookupSupported=${bank.lookupSupported !== false}` +
        ` account=${maskAccountNumber(dto.accountNumber)}` +
        ` accountLength=${dto.accountNumber.length}`,
    );

    if (bank.lookupSupported === false) {
      this.logger.warn(
        `Bank account verification rejected reason=bank_lookup_unsupported` +
          ` bank=${bank.bin} bankCode=${bank.code}` +
          ` account=${maskAccountNumber(dto.accountNumber)}`,
      );
      throw new UnprocessableEntityException({
        code: 'BANK_ACCOUNT_LOOKUP_UNSUPPORTED',
        message: 'Ngân hàng đã chọn chưa hỗ trợ tra cứu tên chủ tài khoản.',
      });
    }

    const account = await this.bankDirectoryService.lookupAccount(
      bank.bin,
      dto.accountNumber,
    );

    if (!account) {
      this.logger.warn(
        `Bank account verification rejected reason=provider_not_found` +
          ` bank=${bank.bin} bankCode=${bank.code}` +
          ` account=${maskAccountNumber(dto.accountNumber)}`,
      );
      throw new UnprocessableEntityException({
        code: 'BANK_ACCOUNT_NOT_FOUND',
        message:
          'Không tìm thấy tên chủ tài khoản. Vui lòng kiểm tra lại ngân hàng và số tài khoản.',
      });
    }

    this.logger.log(
      `Bank account verified bank=${bank.bin} account=${maskAccountNumber(account.accountNumber)}`,
    );

    return {
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankBin: bank.bin,
      bankLogoUrl: bank.logo,
      bankName: bank.shortName,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findByIdOrThrow(userId);
    const assignOptionalText = (
      field:
        | 'avatarUrl'
        | 'phone'
        | 'address'
        | 'bio'
        | 'bankAccountName'
        | 'bankAccountNumber',
      value?: string,
    ) => {
      if (value === undefined) {
        return;
      }

      const trimmedValue = value.trim();
      user[field] = trimmedValue || undefined;
    };

    if (dto.fullName !== undefined) {
      const fullName = dto.fullName.trim();

      if (!fullName) {
        throw new BadRequestException('Vui lòng nhập họ tên giáo viên.');
      }

      user.fullName = fullName;
    }

    assignOptionalText('avatarUrl', dto.avatarUrl);
    assignOptionalText('phone', dto.phone);
    assignOptionalText('address', dto.address);
    assignOptionalText('bio', dto.bio);
    assignOptionalText('bankAccountName', dto.bankAccountName);
    assignOptionalText('bankAccountNumber', dto.bankAccountNumber);

    if (dto.bankBin !== undefined) {
      const bankBin = dto.bankBin.trim();

      if (!bankBin) {
        this.assignPaymentBank(user, null);
      } else if (bankBin !== user.bankBin) {
        const bank = await this.bankDirectoryService.findBank(bankBin);

        if (!bank) {
          throw new BadRequestException(
            'Không tìm thấy ngân hàng trong danh mục VietQR.',
          );
        }

        this.assignPaymentBank(user, bank);
      }
    }

    await user.save();

    return this.toSafeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.findByIdWithSecrets(userId);

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản giáo viên.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Mật khẩu mới cần khác mật khẩu hiện tại.');
    }

    user.passwordHash = await bcrypt.hash(
      dto.newPassword,
      this.getPasswordSaltRounds(),
    );
    await user.save();

    return {
      message: 'Đổi mật khẩu thành công.',
    };
  }

  async updatePaymentQr(
    userId: string,
    file: UploadImageFile,
    qrContent?: string,
    allowUnrecognized = false,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Không tìm thấy tài khoản giáo viên.');
    }

    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản giáo viên.');
    }

    const paymentInfo = parseVietQrPaymentInfo(qrContent);
    const accountNumber = paymentInfo?.accountNumber?.trim();
    const qrTrace = createPaymentQrTrace(qrContent);
    let failureReason = paymentInfo
      ? 'payment_information_incomplete'
      : qrContent?.trim()
        ? 'unrecognized_payload'
        : 'missing_qr_content';
    let resolvedBank: PaymentBank | null = null;

    this.logger.log(
      `Payment QR inspection started format=${qrTrace.format} length=${qrTrace.length} fingerprint=${qrTrace.fingerprint} parsed=${Boolean(paymentInfo)} bank=${paymentInfo?.bankIdentifier ?? 'missing'} account=${maskAccountNumber(accountNumber)}`,
    );

    if (!paymentInfo?.bankIdentifier) {
      failureReason = paymentInfo ? 'missing_bank_identifier' : failureReason;
    } else if (!isValidQrAccountIdentifier(accountNumber)) {
      failureReason = 'invalid_account_number';
    } else {
      try {
        resolvedBank = await this.bankDirectoryService.findBank(
          paymentInfo.bankIdentifier,
        );

        if (!resolvedBank) {
          failureReason = 'bank_not_found';
        }
      } catch (error) {
        failureReason = 'bank_directory_error';
        this.logger.warn(
          `Payment QR bank resolution failed fingerprint=${qrTrace.fingerprint} bank=${paymentInfo.bankIdentifier} account=${maskAccountNumber(accountNumber)} error=${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }

    if (!resolvedBank && !allowUnrecognized) {
      this.logger.warn(
        `Payment QR rejected reason=${failureReason} format=${qrTrace.format} fingerprint=${qrTrace.fingerprint} bank=${paymentInfo?.bankIdentifier ?? 'missing'} account=${maskAccountNumber(accountNumber)}`,
      );
      throw new UnprocessableEntityException({
        code: PAYMENT_QR_INFO_NOT_FOUND_CODE,
        message: PAYMENT_QR_INFO_NOT_FOUND_MESSAGE,
        reason: failureReason,
      });
    }

    if (resolvedBank) {
      this.assignPaymentBank(user, resolvedBank);
    } else {
      this.logger.warn(
        `Payment QR saved without detected bank reason=${failureReason} fingerprint=${qrTrace.fingerprint} action=preserve_existing_bank_profile`,
      );
    }

    user.paymentQrImageContentType = file.mimetype;
    user.paymentQrImageData = file.buffer;
    user.paymentQrImageSize = file.size;
    user.paymentQrImageUpdatedAt = new Date();

    await user.save();

    this.logger.log(
      `Payment QR saved fingerprint=${qrTrace.fingerprint} detectionSource=${resolvedBank ? 'bank_from_qr' : 'image_only'} bank=${resolvedBank?.shortName ?? user.bankName ?? 'unchanged'} manualAccountPreserved=true`,
    );

    return {
      ...this.toSafeUser(user),
      paymentQrBankDetection: resolvedBank
        ? {
            bankBin: resolvedBank.bin,
            bankLogoUrl: resolvedBank.logo,
            bankName: resolvedBank.shortName,
          }
        : undefined,
    };
  }

  async getPaymentQr(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Chưa có ảnh QR thanh toán.');
    }

    const user = await this.userModel
      .findById(userId)
      .select('+paymentQrImageData')
      .exec();

    if (
      !user?.paymentQrImageData ||
      !user.paymentQrImageContentType ||
      !user.paymentQrImageSize
    ) {
      throw new NotFoundException('Chưa có ảnh QR thanh toán.');
    }

    return {
      data: Buffer.from(user.paymentQrImageData),
      contentType: user.paymentQrImageContentType,
      size: user.paymentQrImageSize,
      updatedAt: user.paymentQrImageUpdatedAt,
    };
  }

  async removePaymentQr(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Không tìm thấy tài khoản giáo viên.');
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $unset: {
            paymentQrImageContentType: '',
            paymentQrImageData: '',
            paymentQrImageSize: '',
            paymentQrImageUpdatedAt: '',
          },
        },
        { returnDocument: 'after' },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản giáo viên.');
    }

    return this.toSafeUser(user);
  }

  async uploadMedia(userId: string, file: UploadImageFile) {
    const user = await this.findByIdOrThrow(userId);
    const result = await this.cloudinaryService.uploadTeacherMedia(file, userId);
    
    // Thêm URL mới vào đầu mảng và giữ tối đa 5 phần tử
    const currentUrls = user.recentMediaUrls || [];
    user.recentMediaUrls = [result.url, ...currentUrls.filter(u => u !== result.url)].slice(0, 5);
    
    await user.save();
    
    return {
      url: result.url,
      recentMediaUrls: user.recentMediaUrls
    };
  }

  async getMediaHistory(userId: string) {
    const user = await this.findByIdOrThrow(userId);
    return {
      recentMediaUrls: user.recentMediaUrls || []
    };
  }

  toSafeUser(user: UserDocument): SafeUser {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      bankAccountName: user.bankAccountName,
      bankAccountNumber: user.bankAccountNumber,
      bankName: user.bankName,
      bankCode: user.bankCode,
      bankBin: user.bankBin,
      bankLogoUrl: user.bankLogoUrl,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      hasPaymentQr: Boolean(
        user.paymentQrImageContentType && user.paymentQrImageSize,
      ),
      paymentQrImageContentType: user.paymentQrImageContentType,
      paymentQrImageSize: user.paymentQrImageSize,
      paymentQrImageUpdatedAt: user.paymentQrImageUpdatedAt?.toISOString(),
    };
  }

  private async findByIdOrThrow(userId: string) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản giáo viên.');
    }

    return user;
  }

  private assignPaymentBank(user: UserDocument, bank: PaymentBank | null) {
    user.bankName = bank?.shortName;
    user.bankCode = bank?.code;
    user.bankBin = bank?.bin;
    user.bankLogoUrl = bank?.logo;
  }

  private getPasswordSaltRounds() {
    return this.configService.get<number>('security.passwordSaltRounds') ?? 12;
  }
}

function isValidQrAccountIdentifier(value?: string) {
  return Boolean(value?.match(/^[a-z0-9]{3,19}$/i));
}

function createPaymentQrTrace(rawValue?: string) {
  const value = rawValue?.trim() ?? '';
  const format = !value
    ? 'missing'
    : value.startsWith('000201')
      ? 'vietqr_emv'
      : /^https?:\/\//i.test(value)
        ? 'url'
        : 'unknown';

  return {
    fingerprint: value
      ? createHash('sha256').update(value).digest('hex').slice(0, 12)
      : 'none',
    format,
    length: value.length,
  };
}

function maskAccountNumber(value?: string) {
  const normalized = value?.replace(/[\s-]/g, '') ?? '';

  if (!normalized) {
    return 'missing';
  }

  return normalized.length <= 4
    ? '*'.repeat(normalized.length)
    : `${'*'.repeat(Math.min(8, normalized.length - 4))}${normalized.slice(-4)}`;
}
