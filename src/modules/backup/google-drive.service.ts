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
  private authMode: 'service_account' | 'oauth' | null = null;

  constructor(private readonly configService: ConfigService) {
    this.folderId =
      this.configService.get<string>('backup.googleDriveFolderId')?.trim() ??
      '';
    this.initClient();
  }

  private initClient(): void {
    const clientId = this.configService.get<string>(
      'backup.googleOAuthClientId',
    );
    const clientSecret = this.configService.get<string>(
      'backup.googleOAuthClientSecret',
    );
    const refreshToken = this.configService.get<string>(
      'backup.googleOAuthRefreshToken',
    );
    if (clientId || clientSecret || refreshToken) {
      if (!clientId || !clientSecret || !refreshToken) {
        this.logger.error(
          'Google Drive OAuth requires GOOGLE_DRIVE_OAUTH_CLIENT_ID, GOOGLE_DRIVE_OAUTH_CLIENT_SECRET and GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN',
        );
        return;
      }
      const auth = new google.auth.OAuth2(clientId, clientSecret);
      auth.setCredentials({ refresh_token: refreshToken });
      this.drive = google.drive({ version: 'v3', auth });
      this.authMode = 'oauth';
      this.logger.log('Google Drive OAuth client initialized');
      return;
    }
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
      if (
        credentials.type !== 'service_account' ||
        !credentials.client_email ||
        !credentials.private_key
      ) {
        throw new Error('Invalid service account credentials');
      }

      const auth = new google.auth.GoogleAuth({
        credentials,
        // Backups target a folder created outside this app. drive.file cannot
        // discover that folder; access is still limited by the account's ACLs.
        scopes: ['https://www.googleapis.com/auth/drive'],
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.authMode = 'service_account';
      this.logger.log('Google Drive client initialized successfully');
    } catch {
      this.logger.error(
        'Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON or missing service account credentials',
      );
    }
  }

  isConfigured(): boolean {
    return this.drive !== null && /^[A-Za-z0-9_-]+$/.test(this.folderId);
  }

  getAuthMode() {
    return this.authMode;
  }

  async checkBackupFolder(): Promise<{ name: string; sharedDrive: boolean }> {
    if (!this.isConfigured() || !this.drive) {
      throw new Error(
        'Google Drive backup is not configured. Check credentials and GOOGLE_DRIVE_BACKUP_FOLDER_ID (use the folder ID, not its URL).',
      );
    }
    let folder: drive_v3.Schema$File;
    try {
      const response = await this.drive.files.get({
        fileId: this.folderId,
        supportsAllDrives: true,
        fields: 'name,mimeType,driveId,trashed,capabilities(canAddChildren)',
      });
      folder = response.data;
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      if (status === 404) {
        throw new Error(
          'Backup folder not found or inaccessible. Check GOOGLE_DRIVE_BACKUP_FOLDER_ID and share the folder with the configured Google account.',
        );
      }
      throw new Error(
        `Cannot access backup folder: ${this.errorMessage(error)}`,
      );
    }
    if (
      folder.trashed ||
      folder.mimeType !== 'application/vnd.google-apps.folder'
    ) {
      throw new Error(
        'GOOGLE_DRIVE_BACKUP_FOLDER_ID must refer to an existing, non-trashed folder.',
      );
    }
    if (!folder.capabilities?.canAddChildren) {
      throw new Error(
        'The configured Google account has no permission to upload into the backup folder.',
      );
    }
    if (this.authMode === 'service_account' && !folder.driveId) {
      throw new Error(
        'Service accounts have no Drive storage quota. This backup folder is in My Drive: configure Google OAuth for its owner, or use a Google Workspace Shared Drive.',
      );
    }
    return { name: folder.name ?? '', sharedDrive: !!folder.driveId };
  }

  private errorMessage(error: unknown): string {
    const apiError = error as {
      response?: { data?: { error?: { message?: string } } };
      message?: string;
    };
    return (
      apiError.response?.data?.error?.message ??
      apiError.message ??
      'Unknown Google Drive error'
    );
  }

  /**
   * Upload a file buffer to Google Drive
   */
  async uploadFile(
    fileName: string,
    buffer: Buffer,
    mimeType: string = 'application/gzip',
  ): Promise<{ fileId: string; webViewLink: string }> {
    if (!this.isConfigured() || !this.drive) {
      throw new Error('Google Drive backup is not configured');
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
        supportsAllDrives: true,
        requestBody: fileMetadata,
        media,
        fields: 'id, webViewLink, size',
      });
      if (!response.data.id)
        throw new Error('Google Drive upload returned no file ID');

      const fileSizeMb = response.data.size
        ? (Number(response.data.size) / (1024 * 1024)).toFixed(2)
        : 'unknown';

      this.logger.log(
        `Uploaded "${fileName}" to Google Drive (${fileSizeMb} MB) – ID: ${response.data.id}`,
      );

      return {
        fileId: response.data.id,
        webViewLink: response.data.webViewLink ?? '',
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload "${fileName}" to Google Drive`,
        this.errorMessage(error),
      );
      throw new Error(this.errorMessage(error));
    }
  }

  /**
   * List backup files in the configured folder, sorted by creation date
   */
  async listBackupFiles(): Promise<drive_v3.Schema$File[]> {
    if (!this.isConfigured() || !this.drive) {
      throw new Error('Google Drive backup is not configured');
    }

    try {
      const files: drive_v3.Schema$File[] = [];
      let pageToken: string | undefined;
      do {
        const response = await this.drive.files.list({
          q: `'${this.folderId}' in parents and trashed = false and name contains 'edutrack_backup_'`,
          fields: 'nextPageToken,files(id, name, createdTime, size)',
          orderBy: 'createdTime desc',
          pageSize: 100,
          pageToken,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });
        files.push(...(response.data.files ?? []));
        pageToken = response.data.nextPageToken ?? undefined;
      } while (pageToken);
      return files.filter((file) =>
        /^edutrack_backup_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.json\.gz$/.test(
          file.name ?? '',
        ),
      );
    } catch (error) {
      throw new Error(`Cannot list backup files: ${this.errorMessage(error)}`);
    }
  }

  /**
   * Delete a file by ID
   */
  async deleteFile(fileId: string): Promise<void> {
    if (!this.drive) {
      throw new Error('Google Drive backup is not configured');
    }

    try {
      await this.drive.files.delete({ fileId, supportsAllDrives: true });
      this.logger.log(`Deleted backup file from Google Drive – ID: ${fileId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file ${fileId} from Google Drive`,
        this.errorMessage(error),
      );
      throw new Error(this.errorMessage(error));
    }
  }

  /**
   * Remove old backups, keeping only the N most recent
   */
  async pruneOldBackups(keepCount: number): Promise<number> {
    if (!Number.isInteger(keepCount) || keepCount < 1) {
      throw new Error('BACKUP_MAX_COUNT must be a positive integer');
    }
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
