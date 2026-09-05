import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../mail.service';

@Injectable()
export class MailListener {
  constructor(private readonly mailService: MailService) {}

  @OnEvent('auth.user_registered', { async: true })
  async handleUserRegisteredEvent(payload: {
    email: string;
    otp: string;
    fullName: string;
  }) {
    await this.mailService.sendVerificationOtp(
      payload.email,
      payload.otp,
      payload.fullName,
    );
  }

  @OnEvent('auth.forgot_password_requested', { async: true })
  async handleForgotPasswordRequestedEvent(payload: {
    email: string;
    otp: string;
    fullName: string;
  }) {
    await this.mailService.sendPasswordResetOtp(
      payload.email,
      payload.otp,
      payload.fullName,
    );
  }
}
