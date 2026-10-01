import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

/** Expected shape of a Google Service Account JSON key */
interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private drive: drive_v3.Drive | null = null;
  private folderId: string;

  constructor(private readonly configService: ConfigService) {
    this.folderId =
      this.configService.get<string>('backup.googleDriveFolderId') ?? '';
    this.initClient();
  }

  private initClient(): void {
    const credentialsJson =
      this.configService.get<string>('backup.googleServiceAccountKey') ?? '';

    if (!credentialsJson) {
      this.logger.warn(
        'GOOGLE_SERVICE_ACCOUNT_KEY not configured – Google Drive backup disabled',
      );
      return;
    }

    try {
      const credentials: ServiceAccountCredentials = JSON.parse(
        credentialsJson,
      ) as ServiceAccountCredentials;

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.logger.log('Google Drive client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google Drive client', error);
    }
  }

  isConfigured(): boolean {
    return this.drive !== null && !!this.folderId;
  }

  /**
   * Upload a file buffer to Google Drive
   */
  async uploadFile(
    fileName: string,
    buffer: Buffer,
    mimeType: string = 'application/gzip',
  ): Promise<{ fileId: string; webViewLink: string } | null> {
    if (!this.drive) {
      this.logger.warn('Google Drive not configured, skipping upload');
      return null;
    }

    try {
      const fileMetadata: drive_v3.Schema$File = {
        name: fileName,
        parents: this.folderId ? [this.folderId] : undefined,
      };

      const media = {
        mimeType,
        body: Readable.from(buffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, webViewLink, size',
      });

      const fileSizeMb = response.data.size
        ? (Number(response.data.size) / (1024 * 1024)).toFixed(2)
        : 'unknown';

      this.logger.log(
        `Uploaded "${fileName}" to Google Drive (${fileSizeMb} MB) – ID: ${response.data.id}`,
      );

      return {
        fileId: response.data.id ?? '',
        webViewLink: response.data.webViewLink ?? '',
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload "${fileName}" to Google Drive`,
        error,
      );
      throw error;
    }
  }

  /**
   * List backup files in the configured folder, sorted by creation date
   */
  async listBackupFiles(): Promise<drive_v3.Schema$File[]> {
    if (!this.drive || !this.folderId) {
      return [];
    }

    try {
      const response = await this.drive.files.list({
        q: `'${this.folderId}' in parents and trashed = false`,
        fields: 'files(id, name, createdTime, size)',
        orderBy: 'createdTime desc',
        pageSize: 100,
      });

      return response.data.files ?? [];
    } catch (error) {
      this.logger.error('Failed to list backup files from Google Drive', error);
      return [];
    }
  }

  /**
   * Delete a file by ID
   */
  async deleteFile(fileId: string): Promise<void> {
    if (!this.drive) {
      return;
    }

    try {
      await this.drive.files.delete({ fileId });
      this.logger.log(`Deleted backup file from Google Drive – ID: ${fileId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file ${fileId} from Google Drive`,
        error,
      );
    }
  }

  /**
   * Remove old backups, keeping only the N most recent
   */
  async pruneOldBackups(keepCount: number): Promise<number> {
    const files = await this.listBackupFiles();

    if (files.length <= keepCount) {
      this.logger.log(
        `${files.length} backup(s) found, within limit of ${keepCount} – no cleanup needed`,
      );
      return 0;
    }

    const toDelete = files.slice(keepCount);
    this.logger.log(
      `Pruning ${toDelete.length} old backup(s) (keeping ${keepCount} most recent)`,
    );

    let deleted = 0;
    for (const file of toDelete) {
      if (file.id) {
        await this.deleteFile(file.id);
        deleted++;
      }
    }

    return deleted;
  }
}
