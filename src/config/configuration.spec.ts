import configuration from './configuration';

const ENV_KEYS = [
  'NODE_ENV',
  'FRONTEND_URL',
  'JWT_REFRESH_COOKIE_SECURE',
  'JWT_REFRESH_COOKIE_SAME_SITE',
] as const;

describe('refresh cookie configuration', () => {
  const originalEnvironment = new Map(
    ENV_KEYS.map((key) => [key, process.env[key]]),
  );

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const originalValue = originalEnvironment.get(key);

      if (originalValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValue;
      }
    }
  });

  it('uses secure SameSite=None cookies by default in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_REFRESH_COOKIE_SECURE;
    delete process.env.JWT_REFRESH_COOKIE_SAME_SITE;

    const config = configuration();

    expect(config.jwt.refreshCookieSecure).toBe(true);
    expect(config.jwt.refreshCookieSameSite).toBe('none');
  });

  it('uses localhost-compatible cookie defaults in development', () => {
    process.env.NODE_ENV = 'development';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    delete process.env.JWT_REFRESH_COOKIE_SECURE;
    delete process.env.JWT_REFRESH_COOKIE_SAME_SITE;

    const config = configuration();

    expect(config.jwt.refreshCookieSecure).toBe(false);
    expect(config.jwt.refreshCookieSameSite).toBe('lax');
  });

  it('uses secure cookies for an HTTPS frontend without NODE_ENV', () => {
    delete process.env.NODE_ENV;
    process.env.FRONTEND_URL = 'https://edutrack-fe.vercel.app';
    delete process.env.JWT_REFRESH_COOKIE_SECURE;
    delete process.env.JWT_REFRESH_COOKIE_SAME_SITE;

    const config = configuration();

    expect(config.jwt.refreshCookieSecure).toBe(true);
    expect(config.jwt.refreshCookieSameSite).toBe('none');
  });

  it('accepts explicit cookie policy overrides', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_REFRESH_COOKIE_SECURE = 'false';
    process.env.JWT_REFRESH_COOKIE_SAME_SITE = 'strict';

    const config = configuration();

    expect(config.jwt.refreshCookieSecure).toBe(false);
    expect(config.jwt.refreshCookieSameSite).toBe('strict');
  });

  it('falls back safely when cookie settings are invalid', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_REFRESH_COOKIE_SECURE = 'invalid';
    process.env.JWT_REFRESH_COOKIE_SAME_SITE = 'invalid';

    const config = configuration();

    expect(config.jwt.refreshCookieSecure).toBe(true);
    expect(config.jwt.refreshCookieSameSite).toBe('none');
  });
});
