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

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    index: true,
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

UserSchema.index({ email: 1 }, { unique: true });
