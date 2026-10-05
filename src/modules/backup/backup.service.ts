import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, Timeout } from '@nestjs/schedule';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { GoogleDriveService } from './google-drive.service';

const gzip = promisify(zlib.gzip);

/** Timezone for cron schedule */
const VIETNAM_TZ = 'Asia/Ho_Chi_Minh';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly maxBackups: number;
  private isRunning = false;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
    private readonly googleDriveService: GoogleDriveService,
  ) {
    this.maxBackups = this.configService.get<number>('backup.maxBackups') ?? 30;
  }

  // A sleeping web service can miss 02:00. On its next startup, create the
  // current day's backup only if no successful upload exists since 02:00 VN.
  @Timeout('backup-catch-up', 15_000)
  async catchUpAfterStartup(): Promise<void> {
    if (
      !this.configService.get<boolean>('backup.catchUpOnStartup') ||
      !this.googleDriveService.isConfigured() ||
      this.isRunning
    )
      return;
    const now = new Date();
    const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    if (vnNow.getUTCHours() < 2) return;
    const dueAt =
      Date.UTC(
        vnNow.getUTCFullYear(),
        vnNow.getUTCMonth(),
        vnNow.getUTCDate(),
        2,
      ) -
      7 * 60 * 60 * 1000;
    try {
      const files = await this.googleDriveService.listBackupFiles();
      if (
        files.some(
          (file) => file.createdTime && Date.parse(file.createdTime) >= dueAt,
        )
      )
        return;
      await this.handleScheduledBackup();
    } catch (error) {
      this.logger.error(
        'Backup catch-up check failed',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Cron job: runs at 02:00 AM Vietnam time every day
   */
  @Cron('0 2 * * *', {
    name: 'database-backup',
    timeZone: VIETNAM_TZ,
  })
  async handleScheduledBackup(): Promise<void> {
    if (!this.googleDriveService.isConfigured()) {
      this.logger.warn(
        'Google Drive not configured – skipping scheduled backup',
      );
      return;
    }

    if (this.isRunning) {
      this.logger.warn('Backup already in progress – skipping this run');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.logger.log('=== Starting scheduled database backup ===');
      if (!Number.isInteger(this.maxBackups) || this.maxBackups < 1) {
        throw new Error('BACKUP_MAX_COUNT must be a positive integer');
      }

      // Fail before exporting the DB if the destination cannot accept files.
      await this.googleDriveService.checkBackupFolder();

      // 1) Export all collections to JSON
      const backupData = await this.exportAllCollections();

      // 2) Compress with gzip
      const jsonString = JSON.stringify(backupData, null, 0);
      const compressed = await gzip(Buffer.from(jsonString, 'utf-8'));
      const compressedBuffer = Buffer.isBuffer(compressed)
        ? compressed
        : Buffer.from(compressed);

      const rawSizeMb = (Buffer.byteLength(jsonString) / (1024 * 1024)).toFixed(
        2,
      );
      const compressedSizeMb = (
        compressedBuffer.length /
        (1024 * 1024)
      ).toFixed(2);

      this.logger.log(
        `Backup data: ${rawSizeMb} MB raw → ${compressedSizeMb} MB compressed (${Object.keys(backupData.collections).length} collections, ${backupData.metadata.totalDocuments} documents)`,
      );

      // 3) Upload to Google Drive
      const timestamp = this.formatTimestamp(new Date());
      const fileName = `edutrack_backup_${timestamp}.json.gz`;

      const uploaded = await this.googleDriveService.uploadFile(
        fileName,
        compressedBuffer,
        'application/gzip',
      );
      if (!uploaded?.fileId)
        throw new Error('Backup upload did not create a file');

      // 4) Prune old backups
      const pruned = await this.googleDriveService.pruneOldBackups(
        this.maxBackups,
      );

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      this.logger.log(
        `=== Backup completed in ${elapsed}s – ${pruned} old backup(s) pruned ===`,
      );
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      this.logger.error(
        `Backup failed after ${elapsed}s`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Export all collections from MongoDB via Mongoose connection
   */
  private async exportAllCollections(): Promise<BackupPayload> {
    const db = this.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    // Get all collection names
    const collectionInfos = await db.listCollections().toArray();
    const collectionNames = collectionInfos
      .map((c) => c.name)
      .filter((name) => !name.startsWith('system.'))
      .sort();

    this.logger.log(
      `Found ${collectionNames.length} collections: ${collectionNames.join(', ')}`,
    );

    const collections: Record<string, unknown[]> = {};
    let totalDocuments = 0;

    for (const name of collectionNames) {
      try {
        const docs = await db.collection(name).find({}).toArray();
        collections[name] = docs;
        totalDocuments += docs.length;

        this.logger.debug(`  ✓ ${name}: ${docs.length} document(s)`);
      } catch (error) {
        throw new Error(
          `Failed to export collection "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return {
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        databaseName: db.databaseName,
        collectionCount: collectionNames.length,
        totalDocuments,
      },
      collections,
    };
  }

  /**
   * Format date as YYYY-MM-DD_HH-mm-ss for file naming
   */
  private formatTimestamp(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');

    // Convert to Vietnam time
    const vnDate = new Date(
      date.toLocaleString('en-US', { timeZone: VIETNAM_TZ }),
    );

    return (
      [
        vnDate.getFullYear(),
        pad(vnDate.getMonth() + 1),
        pad(vnDate.getDate()),
      ].join('-') +
      '_' +
      [
        pad(vnDate.getHours()),
        pad(vnDate.getMinutes()),
        pad(vnDate.getSeconds()),
      ].join('-')
    );
  }
}

/** Shape of the backup JSON payload */
interface BackupPayload {
  metadata: {
    version: string;
    createdAt: string;
    databaseName: string;
    collectionCount: number;
    totalDocuments: number;
  };
  collections: Record<string, unknown[]>;
}
