import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  renameSync,
  existsSync,
} from 'node:fs';
import { resolve, join } from 'node:path';
import { google } from 'googleapis';
import type { CodeChallengeMethod } from 'google-auth-library';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  OAuthSetupError,
  parseDesktopOAuthClient,
  updateOAuthEnv,
  validateOAuthCallback,
} from './backup-oauth';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true })] })
class OAuthConfigModule {}

async function main() {
  const clientFlag = process.argv.indexOf('--client');
  // PowerShell/npm can strip --client while forwarding the file argument.
  const clientPath =
    clientFlag >= 0
      ? process.argv[clientFlag + 1]
      : process.argv[2]?.startsWith('-')
        ? undefined
        : process.argv[2];
  if (!clientPath)
    throw new OAuthSetupError(
      'Usage: npm run backup:connect -- --client .tmp/drive-oauth-client.json',
    );
  let clientJson: string;
  try {
    clientJson = readFileSync(resolve(clientPath), 'utf8');
  } catch {
    throw new OAuthSetupError(
      'Cannot read the OAuth client file. Download the Desktop app JSON and check the --client file path.',
    );
  }
  const credentials = parseDesktopOAuthClient(clientJson);
  const app = await NestFactory.createApplicationContext(OAuthConfigModule, {
    logger: ['error', 'warn'],
  });
  const projectRoot = resolve(__dirname, '../../..');
  const envPath = join(projectRoot, '.env');
  const originalEnv = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
  const folderId = app
    .get(ConfigService)
    .get<string>('GOOGLE_DRIVE_BACKUP_FOLDER_ID');
  const maxBackups = Number(
    app.get(ConfigService).get<string>('BACKUP_MAX_COUNT') ?? '30',
  );
  await app.close();
  if (!folderId || !/^[A-Za-z0-9_-]+$/.test(folderId))
    throw new OAuthSetupError(
      'Set GOOGLE_DRIVE_BACKUP_FOLDER_ID in backend .env first.',
    );
  if (!Number.isInteger(maxBackups) || maxBackups < 1)
    throw new OAuthSetupError('BACKUP_MAX_COUNT must be a positive integer.');

  const state = randomBytes(32).toString('base64url');
  let acceptCode!: (code: string) => void;
  let rejectCode!: (error: Error) => void;
  const codeReceived = new Promise<string>((accept, reject) => {
    acceptCode = accept;
    rejectCode = reject;
  });
  const server = createServer((request, response) => {
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    const callback = validateOAuthCallback(
      request.method,
      request.url ?? '/',
      state,
    );
    if (callback.kind === 'not_found' || callback.kind === 'invalid') {
      response.statusCode = callback.kind === 'not_found' ? 404 : 400;
      response.end(
        'Yêu cầu không hợp lệ. Hãy dùng đúng đường dẫn đăng nhập do công cụ cung cấp.',
      );
      return;
    }
    if (callback.kind === 'denied') {
      response.end(
        'Bạn đã hủy cấp quyền. Không có thông tin OAuth nào được lưu.',
      );
      rejectCode(
        new OAuthSetupError(
          'Google authorization was cancelled; OAuth settings were not saved.',
        ),
      );
      return;
    }
    response.end(
      'Đã nhận kết quả đăng nhập Google. Hãy quay lại cửa sổ lệnh để xem kết quả kiểm tra và lưu cấu hình.',
    );
    acceptCode(callback.code);
  });
  let timeout: NodeJS.Timeout | undefined;
  try {
    await new Promise<void>((accept, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', accept);
    });
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new OAuthSetupError('Cannot start the OAuth callback listener.');
    const redirectUri = `http://127.0.0.1:${address.port}/oauth2callback`;
    const auth = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      redirectUri,
    );
    const pkce = await auth.generateCodeVerifierAsync();
    if (!pkce.codeChallenge)
      throw new OAuthSetupError('Cannot generate the OAuth PKCE challenge.');
    const authUrl = auth.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/drive'],
      state,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: 'S256' as CodeChallengeMethod,
    });
    timeout = setTimeout(
      () =>
        rejectCode(
          new OAuthSetupError(
            'Google authorization timed out after 10 minutes.',
          ),
        ),
      10 * 60 * 1000,
    );
    console.log(
      'Mở đường dẫn dưới đây trên trình duyệt của máy này, đăng nhập tài khoản sở hữu thư mục EduTrack Backups và cấp quyền:',
    );
    console.log(authUrl);
    const code = await codeReceived;
    clearTimeout(timeout);
    const { tokens } = await auth.getToken({
      code,
      codeVerifier: pkce.codeVerifier,
      redirect_uri: redirectUri,
    });
    if (!tokens.refresh_token)
      throw new OAuthSetupError(
        'Google returned no refresh token. Repeat the connection and grant offline access.',
      );
    auth.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth });
    const { data: folder } = await drive.files.get({
      fileId: folderId,
      supportsAllDrives: true,
      fields: 'name,mimeType,trashed,capabilities(canAddChildren)',
    });
    if (
      folder.trashed ||
      folder.mimeType !== 'application/vnd.google-apps.folder' ||
      !folder.capabilities?.canAddChildren
    )
      throw new OAuthSetupError(
        'The chosen Google account cannot upload into the configured backup folder. No OAuth settings were saved.',
      );
    const values = {
      GOOGLE_DRIVE_OAUTH_CLIENT_ID: credentials.clientId,
      GOOGLE_DRIVE_OAUTH_CLIENT_SECRET: credentials.clientSecret,
      GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN: tokens.refresh_token,
    };
    const updatedEnv = updateOAuthEnv(originalEnv, values);
    if (
      (existsSync(envPath) ? readFileSync(envPath, 'utf8') : '') !== originalEnv
    )
      throw new OAuthSetupError(
        'Backend .env changed during authorization. Retry to avoid overwriting other changes.',
      );
    const privateDir = join(projectRoot, '.tmp');
    mkdirSync(privateDir, { recursive: true });
    const pendingPath = join(
      privateDir,
      `oauth-settings-${randomBytes(8).toString('hex')}.tmp`,
    );
    writeFileSync(pendingPath, updatedEnv, { mode: 0o600, flag: 'wx' });
    renameSync(pendingPath, envPath);
    writeFileSync(
      join(privateDir, 'google-drive-oauth.env'),
      updateOAuthEnv('', values) +
        `GOOGLE_DRIVE_BACKUP_FOLDER_ID=${folderId}\n` +
        `BACKUP_MAX_COUNT=${maxBackups}\n` +
        'BACKUP_CATCH_UP_ON_STARTUP=true\n',
      { mode: 0o600 },
    );
    console.log(
      `Đã kết nối thư mục "${folder.name ?? 'EduTrack Backups'}" và lưu OAuth vào backend .env.`,
    );
    console.log(
      'Các biến cần đưa lên Render nằm trong .tmp/google-drive-oauth.env. Token/secret không được in ra console.',
    );
    console.log(
      'Chạy npm run backup:check để kiểm tra kết nối. Công cụ này chưa upload dữ liệu database.',
    );
  } finally {
    if (timeout) clearTimeout(timeout);
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((accept) => server.close(() => accept()));
  }
}

void main().catch((error: unknown) => {
  // OAuth/Gaxios errors can contain request bodies with credentials. Keep
  // console output generic; never print authorization codes or raw errors.
  console.error(
    error instanceof OAuthSetupError
      ? error.message
      : 'Không thể hoàn tất kết nối. Kiểm tra file OAuth Desktop app, quyền truy cập thư mục, mạng và việc cấp quyền Google; cấu hình OAuth chưa được cập nhật nếu quá trình xác thực/kiểm tra thất bại.',
  );
  process.exitCode = 1;
});
