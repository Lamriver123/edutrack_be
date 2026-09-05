import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendPasswordResetOtpDto } from './dto/resend-password-reset-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthSession } from './types/auth-response.type';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = this.usersService.normalizeEmail(registerDto.email);
    const existingUser = await this.usersService.findByEmailWithSecrets(email);

    if (existingUser?.isEmailVerified) {
      throw new ConflictException('Email đã được sử dụng.');
    }

    const passwordHash = await bcrypt.hash(
      registerDto.password,
      this.getPasswordSaltRounds(),
    );
    const otpBundle = await this.createOtpBundle(email);

    const user =
      existingUser ??
      (await this.usersService.createTeacher({
        fullName: registerDto.fullName.trim(),
        email,
        passwordHash,
        ...otpBundle,
      }));

    if (existingUser) {
      existingUser.fullName = registerDto.fullName.trim();
      existingUser.passwordHash = passwordHash;
      existingUser.otpHash = otpBundle.otpHash;
      existingUser.otpExpiresAt = otpBundle.otpExpiresAt;
      existingUser.otpAttempts = 0;
      existingUser.otpResendAvailableAt = otpBundle.otpResendAvailableAt;
      await existingUser.save();
    }

    this.eventEmitter.emit('auth.user_registered', {
      email: user.email,
      otp: otpBundle.otp,
      fullName: user.fullName,
    });

    return {
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.',
      email: user.email,
      otpExpiresAt: otpBundle.otpExpiresAt,
      otpResendAvailableAt: otpBundle.otpResendAvailableAt,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthSession> {
    const email = this.usersService.normalizeEmail(verifyOtpDto.email);
    const user = await this.usersService.findByEmailWithSecrets(email);

    if (!user) {
      throw new BadRequestException('Email hoặc mã OTP không hợp lệ.');
    }

    if (user.isEmailVerified) {
      return this.createAuthSession(user);
    }

    this.assertOtpIsUsable(user);

    const isOtpValid = await bcrypt.compare(
      this.getOtpCompareValue(email, verifyOtpDto.otp),
      user.otpHash ?? '',
    );

    if (!isOtpValid) {
      user.otpAttempts = (user.otpAttempts ?? 0) + 1;
      await user.save();

      throw new BadRequestException('Email hoặc mã OTP không hợp lệ.');
    }

    user.isEmailVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpResendAvailableAt = undefined;

    return this.createAuthSession(user);
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const email = this.usersService.normalizeEmail(resendOtpDto.email);
    const user = await this.usersService.findByEmailWithSecrets(email);

    if (!user || user.isEmailVerified) {
      return {
        message: 'Nếu email tồn tại và chưa xác thực, mã OTP mới sẽ được gửi.',
      };
    }

    const now = new Date();
    if (user.otpResendAvailableAt && user.otpResendAvailableAt > now) {
      const seconds = Math.ceil(
        (user.otpResendAvailableAt.getTime() - now.getTime()) / 1000,
      );

      throw new HttpException(
        {
          message: `Vui lòng đợi ${seconds} giây trước khi gửi lại OTP.`,
          retryAfterSeconds: seconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otpBundle = await this.createOtpBundle(email);
    user.otpHash = otpBundle.otpHash;
    user.otpExpiresAt = otpBundle.otpExpiresAt;
    user.otpAttempts = 0;
    user.otpResendAvailableAt = otpBundle.otpResendAvailableAt;
    await user.save();

    this.eventEmitter.emit('auth.user_registered', {
      email: user.email,
      otp: otpBundle.otp,
      fullName: user.fullName,
    });

    return {
      message: 'Mã OTP mới đã được gửi đến email của bạn.',
      email: user.email,
      otpExpiresAt: otpBundle.otpExpiresAt,
      otpResendAvailableAt: otpBundle.otpResendAvailableAt,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = this.usersService.normalizeEmail(forgotPasswordDto.email);
    const user = await this.usersService.findByEmailWithSecrets(email);
    const genericMessage =
      'Nếu email tồn tại, mã OTP đổi mật khẩu sẽ được gửi.';

    if (!user || !user.isEmailVerified) {
      return {
        message: genericMessage,
      };
    }

    this.assertPasswordResetOtpCanBeSent(user);

    const pendingPasswordHash = await bcrypt.hash(
      forgotPasswordDto.newPassword,
      this.getPasswordSaltRounds(),
    );
    const otpBundle = await this.createPasswordResetOtpBundle(email);

    user.pendingPasswordHash = pendingPasswordHash;
    user.passwordResetOtpHash = otpBundle.otpHash;
    user.passwordResetOtpExpiresAt = otpBundle.otpExpiresAt;
    user.passwordResetOtpAttempts = 0;
    user.passwordResetOtpResendAvailableAt = otpBundle.otpResendAvailableAt;
    await user.save();

    this.eventEmitter.emit('auth.forgot_password_requested', {
      email: user.email,
      otp: otpBundle.otp,
      fullName: user.fullName,
    });

    return {
      message: 'Mã OTP đổi mật khẩu đã được gửi đến email của bạn.',
      email: user.email,
      otpExpiresAt: otpBundle.otpExpiresAt,
      otpResendAvailableAt: otpBundle.otpResendAvailableAt,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const email = this.usersService.normalizeEmail(resetPasswordDto.email);
    const user = await this.usersService.findByEmailWithSecrets(email);

    if (!user || !user.isEmailVerified) {
      throw new BadRequestException('Email hoặc mã OTP không hợp lệ.');
    }

    this.assertPasswordResetOtpIsUsable(user);

    const isOtpValid = await bcrypt.compare(
      this.getPasswordResetOtpCompareValue(email, resetPasswordDto.otp),
      user.passwordResetOtpHash ?? '',
    );

    if (!isOtpValid) {
      user.passwordResetOtpAttempts = (user.passwordResetOtpAttempts ?? 0) + 1;
      await user.save();

      throw new BadRequestException('Email hoặc mã OTP không hợp lệ.');
    }

    if (!user.pendingPasswordHash) {
      throw new BadRequestException(
        'Yêu cầu đổi mật khẩu không hợp lệ. Vui lòng thực hiện lại.',
      );
    }

    user.passwordHash = user.pendingPasswordHash;
    this.clearPasswordResetState(user);
    this.clearRefreshTokenState(user);
    await user.save();

    return {
      message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
    };
  }

  async resendPasswordResetOtp(
    resendPasswordResetOtpDto: ResendPasswordResetOtpDto,
  ) {
    const email = this.usersService.normalizeEmail(
      resendPasswordResetOtpDto.email,
    );
    const user = await this.usersService.findByEmailWithSecrets(email);
    const genericMessage =
      'Nếu email tồn tại và có yêu cầu đổi mật khẩu, OTP mới sẽ được gửi.';

    if (!user || !user.isEmailVerified || !user.pendingPasswordHash) {
      return {
        message: genericMessage,
      };
    }

    this.assertPasswordResetOtpCanBeSent(user);

    const otpBundle = await this.createPasswordResetOtpBundle(email);
    user.passwordResetOtpHash = otpBundle.otpHash;
    user.passwordResetOtpExpiresAt = otpBundle.otpExpiresAt;
    user.passwordResetOtpAttempts = 0;
    user.passwordResetOtpResendAvailableAt = otpBundle.otpResendAvailableAt;
    await user.save();

    this.eventEmitter.emit('auth.forgot_password_requested', {
      email: user.email,
      otp: otpBundle.otp,
      fullName: user.fullName,
    });

    return {
      message: 'Mã OTP đổi mật khẩu mới đã được gửi đến email của bạn.',
      email: user.email,
      otpExpiresAt: otpBundle.otpExpiresAt,
      otpResendAvailableAt: otpBundle.otpResendAvailableAt,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthSession> {
    const email = this.usersService.normalizeEmail(loginDto.email);
    const user = await this.usersService.findByEmailWithSecrets(email);

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    if (!user.isEmailVerified) {
      await this.ensurePendingOtp(user);

      throw new ForbiddenException({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Email chưa được xác thực. Vui lòng nhập mã OTP.',
        email: user.email,
      });
    }

    user.lastLoginAt = new Date();

    return this.createAuthSession(user);
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findByIdWithSecrets(payload.sub);

    if (!user || !user.isEmailVerified) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ.');
    }

    if (
      !user.refreshTokenHash ||
      !user.refreshTokenExpiresAt ||
      user.refreshTokenExpiresAt < new Date()
    ) {
      this.clearRefreshTokenState(user);
      await user.save();

      throw new UnauthorizedException(
        'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      );
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ.');
    }

    return this.createAuthSession(user);
  }

  async logout(refreshToken?: string) {
    const payload = await this.tryVerifyRefreshToken(refreshToken);

    if (payload) {
      const user = await this.usersService.findByIdWithSecrets(payload.sub);

      if (user) {
        this.clearRefreshTokenState(user);
        await user.save();
      }
    }

    return {
      message: 'Đăng xuất thành công.',
    };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ.');
    }

    return this.usersService.toSafeUser(user);
  }

  private async ensurePendingOtp(user: UserDocument) {
    const now = new Date();

    if (user.otpHash && user.otpExpiresAt && user.otpExpiresAt > now) {
      return;
    }

    const otpBundle = await this.createOtpBundle(user.email);
    user.otpHash = otpBundle.otpHash;
    user.otpExpiresAt = otpBundle.otpExpiresAt;
    user.otpAttempts = 0;
    user.otpResendAvailableAt = otpBundle.otpResendAvailableAt;
    await user.save();

    this.eventEmitter.emit('auth.user_registered', {
      email: user.email,
      otp: otpBundle.otp,
      fullName: user.fullName,
    });
  }

  private async createAuthSession(user: UserDocument): Promise<AuthSession> {
    const refreshTokenExpiresAt = this.getRefreshTokenExpiresAt();
    const refreshToken = await this.signRefreshToken(user);

    user.refreshTokenHash = await bcrypt.hash(
      refreshToken,
      this.getRefreshTokenSaltRounds(),
    );
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await user.save();

    return {
      accessToken: await this.signAccessToken(user),
      refreshToken,
      refreshTokenExpiresAt,
      user: this.usersService.toSafeUser(user),
    };
  }

  private async signAccessToken(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenType: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.getAccessTokenSecret(),
      expiresIn: this.getAccessTokenExpiresIn(),
    });
  }

  private async signRefreshToken(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenType: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.getRefreshTokenSecret(),
      expiresIn: this.getRefreshTokenExpiresIn(),
    });
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.getRefreshTokenSecret(),
        },
      );

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Refresh token không hợp lệ.');
      }

      return payload;
    } catch {
      throw new UnauthorizedException(
        'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      );
    }
  }

  private async tryVerifyRefreshToken(refreshToken?: string) {
    if (!refreshToken) {
      return null;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.getRefreshTokenSecret(),
          ignoreExpiration: true,
        },
      );

      return payload.tokenType === 'refresh' ? payload : null;
    } catch {
      return null;
    }
  }

  private async createOtpBundle(email: string) {
    const otp = this.generateOtp();
    const now = new Date();
    const expiresMinutes =
      this.configService.get<number>('otp.expiresMinutes') ?? 10;
    const resendCooldownSeconds =
      this.configService.get<number>('otp.resendCooldownSeconds') ?? 60;

    return {
      otp,
      otpHash: await bcrypt.hash(
        this.getOtpCompareValue(email, otp),
        this.getOtpSaltRounds(),
      ),
      otpExpiresAt: new Date(now.getTime() + expiresMinutes * 60 * 1000),
      otpResendAvailableAt: new Date(
        now.getTime() + resendCooldownSeconds * 1000,
      ),
    };
  }

  private async createPasswordResetOtpBundle(email: string) {
    const otp = this.generateOtp();
    const now = new Date();
    const expiresMinutes =
      this.configService.get<number>('otp.expiresMinutes') ?? 10;
    const resendCooldownSeconds =
      this.configService.get<number>('otp.resendCooldownSeconds') ?? 60;

    return {
      otp,
      otpHash: await bcrypt.hash(
        this.getPasswordResetOtpCompareValue(email, otp),
        this.getOtpSaltRounds(),
      ),
      otpExpiresAt: new Date(now.getTime() + expiresMinutes * 60 * 1000),
      otpResendAvailableAt: new Date(
        now.getTime() + resendCooldownSeconds * 1000,
      ),
    };
  }

  private assertOtpIsUsable(user: UserDocument) {
    const maxAttempts = this.configService.get<number>('otp.maxAttempts') ?? 5;

    if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException(
        'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.',
      );
    }

    if ((user.otpAttempts ?? 0) >= maxAttempts) {
      throw new HttpException(
        {
          message: 'Bạn đã nhập sai OTP quá số lần cho phép.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private assertPasswordResetOtpIsUsable(user: UserDocument) {
    const maxAttempts = this.configService.get<number>('otp.maxAttempts') ?? 5;

    if (
      !user.pendingPasswordHash ||
      !user.passwordResetOtpHash ||
      !user.passwordResetOtpExpiresAt ||
      user.passwordResetOtpExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.',
      );
    }

    if ((user.passwordResetOtpAttempts ?? 0) >= maxAttempts) {
      throw new HttpException(
        {
          message: 'Bạn đã nhập sai OTP quá số lần cho phép.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private assertPasswordResetOtpCanBeSent(user: UserDocument) {
    const now = new Date();

    if (
      user.passwordResetOtpResendAvailableAt &&
      user.passwordResetOtpResendAvailableAt > now
    ) {
      const seconds = Math.ceil(
        (user.passwordResetOtpResendAvailableAt.getTime() - now.getTime()) /
          1000,
      );

      throw new HttpException(
        {
          message: `Vui lòng đợi ${seconds} giây trước khi gửi lại OTP đổi mật khẩu.`,
          retryAfterSeconds: seconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private clearPasswordResetState(user: UserDocument) {
    user.pendingPasswordHash = undefined;
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetOtpAttempts = 0;
    user.passwordResetOtpResendAvailableAt = undefined;
  }

  private clearRefreshTokenState(user: UserDocument) {
    user.refreshTokenHash = undefined;
    user.refreshTokenExpiresAt = undefined;
  }

  private getOtpCompareValue(email: string, otp: string) {
    return `${email}:${otp}`;
  }

  private getPasswordResetOtpCompareValue(email: string, otp: string) {
    return `password-reset:${email}:${otp}`;
  }

  private generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getPasswordSaltRounds() {
    return this.configService.get<number>('security.passwordSaltRounds') ?? 12;
  }

  private getOtpSaltRounds() {
    return this.configService.get<number>('security.otpSaltRounds') ?? 10;
  }

  private getRefreshTokenSaltRounds() {
    return (
      this.configService.get<number>('security.refreshTokenSaltRounds') ?? 10
    );
  }

  private getDefaultRefreshTokenExpiresMs() {
    return (
      this.configService.get<number>('security.defaultRefreshTokenExpiresMs') ??
      7 * 24 * 60 * 60 * 1000
    );
  }

  private getAccessTokenSecret() {
    return this.configService.get<string>('jwt.secret') ?? 'change-me-in-env';
  }

  private getRefreshTokenSecret() {
    return (
      this.configService.get<string>('jwt.refreshSecret') ??
      `${this.getAccessTokenSecret()}:refresh`
    );
  }

  private getAccessTokenExpiresIn() {
    return (this.configService.get<string>('jwt.expiresIn') ??
      '1d') as JwtSignOptions['expiresIn'];
  }

  private getRefreshTokenExpiresIn() {
    return (this.configService.get<string>('jwt.refreshExpiresIn') ??
      '7d') as JwtSignOptions['expiresIn'];
  }

  private getRefreshTokenExpiresAt() {
    const expiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d';

    return new Date(
      Date.now() +
        this.parseDurationToMs(
          expiresIn,
          this.getDefaultRefreshTokenExpiresMs(),
        ),
    );
  }

  private parseDurationToMs(value: string | number, fallbackMs: number) {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value * 1000 : fallbackMs;
    }

    const normalizedValue = value.trim().toLowerCase();
    const match = normalizedValue.match(/^(\d+)(ms|s|m|h|d)?$/);

    if (!match) {
      return fallbackMs;
    }

    const amount = Number(match[1]);
    const unit = match[2] ?? 's';
    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
  }
}
