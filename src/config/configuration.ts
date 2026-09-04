const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default () => ({
  app: {
    port: toNumber(process.env.PORT, 3000),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  database: {
    uri: process.env.MONGO_URI ?? process.env.MONGODB_URI ?? '',
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ??
      process.env.JWT_ACCESS_SECRET ??
      'change-me-in-env',
    expiresIn:
      process.env.JWT_EXPIRATION ?? process.env.JWT_ACCESS_EXPIRES_IN ?? '1d',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ??
      `${process.env.JWT_SECRET ?? process.env.JWT_ACCESS_SECRET ?? 'change-me-in-env'}:refresh`,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
    refreshCookieName:
      process.env.JWT_REFRESH_COOKIE_NAME ?? 'edutrack_refresh_token',
  },
  mail: {
    host: process.env.MAIL_HOST ?? process.env.SMTP_HOST ?? '',
    port: toNumber(process.env.MAIL_PORT ?? process.env.SMTP_PORT, 587),
    secure:
      (process.env.MAIL_SECURE ?? process.env.SMTP_SECURE) === 'true' ||
      (process.env.MAIL_PORT ?? process.env.SMTP_PORT) === '465',
    user: process.env.MAIL_USER ?? process.env.SMTP_USER ?? '',
    pass: process.env.MAIL_PASS ?? process.env.SMTP_PASS ?? '',
    from:
      process.env.MAIL_FROM ??
      process.env.SMTP_FROM ??
      'Edutrack <no-reply@edutrack.local>',
    apiUrl: process.env.MAIL_API_URL ?? '',
  },
  otp: {
    expiresMinutes: toNumber(process.env.OTP_EXPIRES_MINUTES, 10),
    resendCooldownSeconds: toNumber(
      process.env.OTP_RESEND_COOLDOWN_SECONDS,
      60,
    ),
    maxAttempts: toNumber(process.env.OTP_MAX_ATTEMPTS, 5),
  },
  security: {
    passwordSaltRounds: toNumber(process.env.PASSWORD_SALT_ROUNDS, 12),
    otpSaltRounds: toNumber(process.env.OTP_SALT_ROUNDS, 10),
    refreshTokenSaltRounds: toNumber(process.env.REFRESH_TOKEN_SALT_ROUNDS, 10),
    defaultRefreshTokenExpiresMs: toNumber(
      process.env.DEFAULT_REFRESH_TOKEN_EXPIRES_MS,
      7 * 24 * 60 * 60 * 1000,
    ),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    studentAvatarFolder:
      process.env.CLOUDINARY_STUDENT_AVATAR_FOLDER ??
      'edutrack/student-avatars',
  },
});
