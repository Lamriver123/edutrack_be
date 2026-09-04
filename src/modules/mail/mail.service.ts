import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: Transporter;

  constructor(private readonly configService: ConfigService) {}

  async sendVerificationOtp(email: string, otp: string, fullName: string) {
    const transporter = this.getTransporter();
    const from = this.configService.get<string>('mail.from');
    const safeFullName = this.escapeHtml(fullName);

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Mã xác thực tài khoản EduTrack',
        text: [
          `Xin chào ${fullName},`,
          '',
          `Mã OTP xác thực tài khoản EduTrack của bạn là: ${otp}`,
          'Mã có hiệu lực trong thời gian ngắn. Nếu bạn không tạo tài khoản, hãy bỏ qua email này.',
        ].join('\n'),
        html: `
          <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
            <p>Xin chào <strong>${safeFullName}</strong>,</p>
            <p>Mã OTP xác thực tài khoản EduTrack của bạn là:</p>
            <p style="font-size: 28px; font-weight: 700; margin: 16px 0;">${otp}</p>
            <p>Mã có hiệu lực trong thời gian ngắn. Nếu bạn không tạo tài khoản, hãy bỏ qua email này.</p>
          </div>
        `,
      });
      this.logger.log(`Đã gửi OTP xác thực đến ${email}`);
    } catch (error: any) {
      this.logger.error(`Lỗi khi gửi email xác thực tới ${email}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Không thể gửi email OTP (Lỗi cấu hình SMTP hoặc mạng). Vui lòng báo cho quản trị viên.',
      );
    }
  }

  async sendPasswordResetOtp(email: string, otp: string, fullName: string) {
    const transporter = this.getTransporter();
    const from = this.configService.get<string>('mail.from');
    const safeFullName = this.escapeHtml(fullName);

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Mã OTP đổi mật khẩu EduTrack',
        text: [
          `Xin chào ${fullName},`,
          '',
          `Mã OTP đổi mật khẩu EduTrack của bạn là: ${otp}`,
          'Mã có hiệu lực trong thời gian ngắn. Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.',
        ].join('\n'),
        html: `
          <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
            <p>Xin chào <strong>${safeFullName}</strong>,</p>
            <p>Mã OTP đổi mật khẩu EduTrack của bạn là:</p>
            <p style="font-size: 28px; font-weight: 700; margin: 16px 0;">${otp}</p>
            <p>Mã có hiệu lực trong thời gian ngắn. Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.</p>
          </div>
        `,
      });
      this.logger.log(`Đã gửi OTP đổi mật khẩu đến ${email}`);
    } catch (error: any) {
      this.logger.error(`Lỗi khi gửi email đổi mật khẩu tới ${email}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Không thể gửi email OTP (Lỗi cấu hình SMTP hoặc mạng). Vui lòng báo cho quản trị viên.',
      );
    }
  }

  private getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port') ?? 587;
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');

    if (!host || !user || !pass) {
      throw new InternalServerErrorException(
        'Dịch vụ email chưa được cấu hình. Vui lòng kiểm tra biến môi trường MAIL_*.',
      );
    }

    this.transporter = createTransport({
      host,
      port,
      secure: this.configService.get<boolean>('mail.secure') ?? false,
      auth: {
        user,
        pass,
      },
    });

    return this.transporter;
  }

  private escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
