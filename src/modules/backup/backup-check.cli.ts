import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import configuration from '../../config/configuration';
import { GoogleDriveService } from './google-drive.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] })],
  providers: [GoogleDriveService],
})
class BackupCheckModule {}

// Read-only diagnostics: no Mongo connection, scheduler, upload or cleanup.
async function main() {
  const app = await NestFactory.createApplicationContext(BackupCheckModule, {
    logger: ['error', 'warn'],
  });
  try {
    const drive = app.get(GoogleDriveService);
    const folder = await drive.checkBackupFolder();
    const files = await drive.listBackupFiles();
    console.log(
      JSON.stringify(
        {
          ok: true,
          authMode: drive.getAuthMode(),
          folder,
          backupCount: files.length,
          latestBackup: files[0]
            ? {
                name: files[0].name,
                createdTime: files[0].createdTime,
                size: files[0].size,
              }
            : null,
          schedule: '02:00 Asia/Ho_Chi_Minh',
          catchUpOnStartup: app
            .get(ConfigService)
            .get<boolean>('backup.catchUpOnStartup'),
        },
        null,
        2,
      ),
    );
  } finally {
    await app.close();
  }
}

void main().catch((error: unknown) => {
  console.error(
    JSON.stringify({
      ok: false,
      error:
        error instanceof Error ? error.message : 'Backup diagnostics failed',
    }),
  );
  process.exitCode = 1;
});
