import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendPasswordResetOtpDto } from './dto/resend-password-reset-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthResponse, AuthSession } from './types/auth-response.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const session = await this.authService.verifyOtp(verifyOtpDto);
    this.setRefreshTokenCookie(response, session);

    return this.toAuthResponse(session);
  }

  @Post('resend-otp')
  resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('resend-password-reset-otp')
  resendPasswordResetOtp(
    @Body() resendPasswordResetOtpDto: ResendPasswordResetOtpDto,
  ) {
    return this.authService.resendPasswordResetOtp(resendPasswordResetOtpDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const session = await this.authService.login(loginDto);
    this.setRefreshTokenCookie(response, session);

    return this.toAuthResponse(session);
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const refreshToken = this.getRefreshTokenFromRequest(request);
    const session = await this.authService.refresh(refreshToken ?? '');
    this.setRefreshTokenCookie(response, session);

    return this.toAuthResponse(session);
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logout(
      this.getRefreshTokenFromRequest(request),
    );
    response.clearCookie(
      this.getRefreshTokenCookieName(),
      this.getRefreshTokenCookieOptions(),
    );

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return this.authService.me(user.userId);
  }

  private setRefreshTokenCookie(response: Response, session: AuthSession) {
    response.cookie(
      this.getRefreshTokenCookieName(),
      session.refreshToken,
      this.getRefreshTokenCookieOptions(session.refreshTokenExpiresAt),
    );
  }

  private toAuthResponse(session: AuthSession): AuthResponse {
    return {
      accessToken: session.accessToken,
      user: session.user,
    };
  }

  private getRefreshTokenFromRequest(request: Request) {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return undefined;
    }

    for (const cookie of cookieHeader.split(';')) {
      const [rawName, ...rawValueParts] = cookie.trim().split('=');

      if (rawName === this.getRefreshTokenCookieName()) {
        return decodeURIComponent(rawValueParts.join('='));
      }
    }

    return undefined;
  }

  private getRefreshTokenCookieName() {
    return (
      this.configService.get<string>('jwt.refreshCookieName') ??
      'edutrack_refresh_token'
    );
  }

  private getRefreshTokenCookieOptions(expires?: Date): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('app.nodeEnv') === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      expires,
    };
  }
}
