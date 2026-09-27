import type { CookieOptions, Response } from 'express';
import { UserRole } from '../users/schemas/user.schema';
import { AuthController } from './auth.controller';
import type { AuthSession } from './types/auth-response.type';

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));

const REFRESH_COOKIE_NAME = 'edutrack_refresh_token';
const REFRESH_TOKEN = 'refresh-token-value';
const REFRESH_TOKEN_EXPIRES_AT = new Date('2026-10-04T12:00:00.000Z');

function createSession(): AuthSession {
  return {
    accessToken: 'access-token-value',
    refreshToken: REFRESH_TOKEN,
    refreshTokenExpiresAt: REFRESH_TOKEN_EXPIRES_AT,
    user: {
      id: '68cf00000000000000000001',
      fullName: 'Nguyễn Thị Linh Chi',
      email: 'teacher@example.com',
      role: UserRole.Teacher,
      isEmailVerified: true,
      hasPaymentQr: false,
    },
  };
}

function createController(
  nodeEnv: 'development' | 'production' | undefined,
  frontendUrl = '',
) {
  const login = jest.fn().mockResolvedValue(createSession());
  const refresh = jest.fn().mockResolvedValue(createSession());
  const logout = jest
    .fn()
    .mockResolvedValue({ message: 'Đăng xuất thành công.' });
  const authService = {
    login,
    refresh,
    logout,
  };
  const config = new Map<string, string | undefined>([
    ['app.nodeEnv', nodeEnv],
    ['app.frontendUrl', frontendUrl],
    ['jwt.refreshCookieName', REFRESH_COOKIE_NAME],
  ]);
  const controller = new AuthController(
    authService as never,
    {
      get: <T>(key: string) => config.get(key) as T | undefined,
    } as never,
  );

  return { controller, login, logout, refresh };
}

function createResponse() {
  const cookie = jest.fn<
    void,
    [name: string, value: string, options: CookieOptions]
  >();
  const clearCookie = jest.fn<void, [name: string, options: CookieOptions]>();

  return {
    clearCookie,
    cookie,
    response: { clearCookie, cookie } as unknown as Response,
  };
}

describe('AuthController refresh cookie', () => {
  it('sets a persistent, host-only cross-site cookie in production', async () => {
    const { controller } = createController('production');
    const { cookie, response } = createResponse();

    const result = await controller.login(
      { email: 'teacher@example.com', password: 'password123' },
      response,
    );

    expect(result).toEqual({
      accessToken: 'access-token-value',
      user: createSession().user,
    });
    expect(result).not.toHaveProperty('refreshToken');
    expect(cookie).toHaveBeenCalledWith(REFRESH_COOKIE_NAME, REFRESH_TOKEN, {
      expires: REFRESH_TOKEN_EXPIRES_AT,
      httpOnly: true,
      path: '/api/auth',
      sameSite: 'none',
      secure: true,
    });
    const cookieOptions = cookie.mock.calls[0][2];
    expect(cookieOptions).not.toHaveProperty('domain');
  });

  it('reads the persistent cookie and replaces it after refresh rotation', async () => {
    const { controller, refresh } = createController('production');
    const { cookie, response } = createResponse();
    const encodedToken = encodeURIComponent('token.with=special/value');

    await controller.refresh(
      {
        headers: {
          cookie: `unrelated=value; ${REFRESH_COOKIE_NAME}=${encodedToken}`,
        },
      } as never,
      response,
    );

    expect(refresh).toHaveBeenCalledWith('token.with=special/value');
    expect(cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      REFRESH_TOKEN,
      expect.objectContaining({
        expires: REFRESH_TOKEN_EXPIRES_AT,
        path: '/api/auth',
      }),
    );
  });

  it('clears the same cookie path and attributes during logout', async () => {
    const { controller, logout } = createController('production');
    const { clearCookie, response } = createResponse();

    await controller.logout(
      {
        headers: { cookie: `${REFRESH_COOKIE_NAME}=${REFRESH_TOKEN}` },
      } as never,
      response,
    );

    expect(logout).toHaveBeenCalledWith(REFRESH_TOKEN);
    expect(clearCookie).toHaveBeenCalledWith(REFRESH_COOKIE_NAME, {
      expires: undefined,
      httpOnly: true,
      path: '/api/auth',
      sameSite: 'none',
      secure: true,
    });
  });

  it('uses a localhost-compatible cookie during development', async () => {
    const { controller } = createController('development');
    const { cookie, response } = createResponse();

    await controller.login(
      { email: 'teacher@example.com', password: 'password123' },
      response,
    );

    expect(cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      REFRESH_TOKEN,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      }),
    );
  });

  it('infers secure cookies from an HTTPS frontend without NODE_ENV', async () => {
    const { controller } = createController(
      undefined,
      'https://edutrack-fe.vercel.app',
    );
    const { cookie, response } = createResponse();

    await controller.login(
      { email: 'teacher@example.com', password: 'password123' },
      response,
    );

    expect(cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      REFRESH_TOKEN,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      }),
    );
  });
});
