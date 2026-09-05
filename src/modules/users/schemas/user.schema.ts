import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  Teacher = 'teacher',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ trim: true })
  avatarUrl?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true, maxlength: 500 })
  bio?: string;

  @Prop({ trim: true, maxlength: 100 })
  bankAccountName?: string;

  @Prop({ trim: true, maxlength: 50 })
  bankAccountNumber?: string;

  @Prop({ type: Buffer, select: false })
  paymentQrImageData?: Buffer;

  @Prop({ trim: true })
  paymentQrImageContentType?: string;

  @Prop({ min: 0 })
  paymentQrImageSize?: number;

  @Prop({ type: Date })
  paymentQrImageUpdatedAt?: Date;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({
    enum: UserRole,
    default: UserRole.Teacher,
  })
  role: UserRole;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ select: false })
  otpHash?: string;

  @Prop({ type: Date, select: false })
  otpExpiresAt?: Date;

  @Prop({ default: 0, select: false })
  otpAttempts: number;

  @Prop({ type: Date, select: false })
  otpResendAvailableAt?: Date;

  @Prop({ select: false })
  pendingPasswordHash?: string;

  @Prop({ select: false })
  passwordResetOtpHash?: string;

  @Prop({ type: Date, select: false })
  passwordResetOtpExpiresAt?: Date;

  @Prop({ default: 0, select: false })
  passwordResetOtpAttempts: number;

  @Prop({ type: Date, select: false })
  passwordResetOtpResendAvailableAt?: Date;

  @Prop({ select: false })
  refreshTokenHash?: string;

  @Prop({ type: Date, select: false })
  refreshTokenExpiresAt?: Date;

  @Prop({ type: Date })
  lastLoginAt?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
