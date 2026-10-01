import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { GoogleDriveService } from './google-drive.service';

@Module({
  providers: [BackupService, GoogleDriveService],
  exports: [BackupService],
})
export class BackupModule {}
