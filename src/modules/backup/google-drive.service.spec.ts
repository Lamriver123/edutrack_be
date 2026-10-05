import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { GoogleDriveService } from './google-drive.service';

jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn(),
      OAuth2: jest
        .fn()
        .mockImplementation(() => ({ setCredentials: jest.fn() })),
    },
    drive: jest.fn(),
  },
}));

describe('GoogleDriveService backup destination', () => {
  const files = {
    get: jest.fn(),
    create: jest.fn(),
    list: jest.fn(),
    delete: jest.fn(),
  };
  let values: Record<string, unknown>;
  const makeService = () =>
    new GoogleDriveService({
      get: (key: string) => values[key],
    } as ConfigService);
  const folder = (driveId: string | undefined = 'shared-drive') => ({
    data: {
      name: 'EduTrack Backups',
      mimeType: 'application/vnd.google-apps.folder',
      driveId,
      capabilities: { canAddChildren: true },
      trashed: false,
    },
  });
  const backup = (day: string) => ({
    id: day,
    name: `edutrack_backup_2026-10-${day}_02-00-00.json.gz`,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    values = {
      'backup.googleServiceAccountKey': JSON.stringify({
        type: 'service_account',
        client_email: 'backup@example.test',
        private_key: 'test-only',
      }),
      'backup.googleDriveFolderId': 'folder-id',
    };
    jest.mocked(google.drive).mockReturnValue({ files } as never);
    files.get.mockResolvedValue(folder());
    files.list.mockResolvedValue({ data: { files: [] } });
    files.create.mockResolvedValue({ data: { id: 'uploaded' } });
    files.delete.mockResolvedValue({});
  });
  afterEach(() => jest.restoreAllMocks());

  it('uses a scope that can access an externally created folder and supports Shared Drives', async () => {
    const service = makeService();
    expect(google.auth.GoogleAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        scopes: ['https://www.googleapis.com/auth/drive'],
      }),
    );
    await expect(service.checkBackupFolder()).resolves.toEqual({
      name: 'EduTrack Backups',
      sharedDrive: true,
    });
    expect(files.get).toHaveBeenCalledWith(
      expect.objectContaining({ fileId: 'folder-id', supportsAllDrives: true }),
    );
  });
  it('rejects My Drive for a service account even when it has Editor permissions', async () => {
    files.get.mockResolvedValue({
      data: { ...folder().data, driveId: undefined },
    });
    await expect(makeService().checkBackupFolder()).rejects.toThrow(
      'Service accounts have no Drive storage quota',
    );
    expect(files.create).not.toHaveBeenCalled();
  });
  it('reports inaccessible folders with actionable configuration information', async () => {
    files.get.mockRejectedValue({ response: { status: 404 } });
    await expect(makeService().checkBackupFolder()).rejects.toThrow(
      'share the folder',
    );
  });
  it('rejects a read-only destination', async () => {
    files.get.mockResolvedValue({
      data: { ...folder().data, capabilities: { canAddChildren: false } },
    });
    await expect(makeService().checkBackupFolder()).rejects.toThrow(
      'no permission to upload',
    );
  });
  it('does not treat a folder URL as a configured folder ID', () => {
    values['backup.googleDriveFolderId'] =
      'https://drive.google.com/drive/folders/folder-id';
    expect(makeService().isConfigured()).toBe(false);
  });
  it('does not silently fall back to a service account when OAuth configuration is incomplete', () => {
    values['backup.googleOAuthClientId'] = 'client-id';
    expect(makeService().isConfigured()).toBe(false);
    expect(google.auth.GoogleAuth).not.toHaveBeenCalled();
  });
  it('accepts My Drive when using the owner OAuth refresh token', async () => {
    Object.assign(values, {
      'backup.googleOAuthClientId': 'client-id',
      'backup.googleOAuthClientSecret': 'client-secret',
      'backup.googleOAuthRefreshToken': 'test-only-token',
    });
    files.get.mockResolvedValue({
      data: { ...folder().data, driveId: undefined },
    });
    const service = makeService();
    expect(service.getAuthMode()).toBe('oauth');
    expect(google.auth.GoogleAuth).not.toHaveBeenCalled();
    await expect(service.checkBackupFolder()).resolves.toMatchObject({
      sharedDrive: false,
    });
  });
  it('uploads to the configured Shared Drive folder and requires a confirmed file ID', async () => {
    const service = makeService();
    await expect(
      service.uploadFile('backup.json.gz', Buffer.from('test')),
    ).resolves.toMatchObject({ fileId: 'uploaded' });
    expect(files.create).toHaveBeenCalledWith(
      expect.objectContaining({
        supportsAllDrives: true,
        requestBody: { name: 'backup.json.gz', parents: ['folder-id'] },
      }),
    );
    files.create.mockResolvedValue({ data: {} });
    await expect(
      service.uploadFile('backup.json.gz', Buffer.from('test')),
    ).rejects.toThrow('no file ID');
  });
  it('paginates backups while excluding unrelated files from retention cleanup', async () => {
    files.list.mockResolvedValueOnce({
      data: {
        files: [
          backup('05'),
          { id: 'other', name: 'edutrack_backup_notes.txt' },
        ],
        nextPageToken: 'page-2',
      },
    });
    files.list.mockResolvedValueOnce({ data: { files: [backup('04')] } });
    await expect(makeService().listBackupFiles()).resolves.toEqual([
      backup('05'),
      backup('04'),
    ]);
    expect(files.list).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pageToken: 'page-2',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      }),
    );
  });
  it('propagates listing errors instead of reporting an empty backup history', async () => {
    files.list.mockRejectedValue(new Error('Access denied'));
    await expect(makeService().listBackupFiles()).rejects.toThrow(
      'Access denied',
    );
  });
  it.each([0, -1, 1.5, NaN])(
    'does not delete files with invalid retention %s',
    async (keepCount) => {
      await expect(makeService().pruneOldBackups(keepCount)).rejects.toThrow(
        'positive integer',
      );
      expect(files.delete).not.toHaveBeenCalled();
    },
  );
  it('keeps the latest backup and deletes only older backup files with Shared Drive support', async () => {
    files.list.mockResolvedValue({
      data: {
        files: [backup('05'), { id: 'photo', name: 'photo.jpg' }, backup('04')],
      },
    });
    await expect(makeService().pruneOldBackups(1)).resolves.toBe(1);
    expect(files.delete).toHaveBeenCalledTimes(1);
    expect(files.delete).toHaveBeenCalledWith({
      fileId: '04',
      supportsAllDrives: true,
    });
  });
  it('reports cleanup failures instead of counting unsuccessful deletions', async () => {
    files.list.mockResolvedValue({
      data: { files: [backup('05'), backup('04')] },
    });
    files.delete.mockRejectedValue(new Error('Cannot delete'));
    await expect(makeService().pruneOldBackups(1)).rejects.toThrow(
      'Cannot delete',
    );
  });
});
