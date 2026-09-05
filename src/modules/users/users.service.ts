import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import type { UploadImageFile } from '../cloudinary/cloudinary.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { SafeUser } from './types/safe-user.type';

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
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
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

  async updatePaymentQr(userId: string, file: UploadImageFile) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Không tìm thấy tài khoản giáo viên.');
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            paymentQrImageContentType: file.mimetype,
            paymentQrImageData: file.buffer,
            paymentQrImageSize: file.size,
            paymentQrImageUpdatedAt: new Date(),
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

  private getPasswordSaltRounds() {
    return this.configService.get<number>('security.passwordSaltRounds') ?? 12;
  }
}
