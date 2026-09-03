import { IsEmail } from 'class-validator';

export class ResendPasswordResetOtpDto {
  @IsEmail()
  email: string;
}
