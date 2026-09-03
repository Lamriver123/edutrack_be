import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  toSafeUser(user: UserDocument): SafeUser {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
  }
}
