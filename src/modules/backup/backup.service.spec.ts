import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { gunzipSync } from 'node:zlib';
import { BackupService } from './backup.service';
import { GoogleDriveService } from './google-drive.service';

describe('BackupService scheduling and export', () => {
  let service: BackupService;
  const docs = [{ _id: 'test-student', fullName: 'Test Student' }];
  const db = {
    databaseName: 'test-only',
    listCollections: jest.fn(),
    collection: jest.fn(),
  };
  const drive = {
    isConfigured: jest.fn(),
    checkBackupFolder: jest.fn(),
    uploadFile: jest.fn(),
    pruneOldBackups: jest.fn(),
    listBackupFiles: jest.fn(),
  };
  const makeService = (maxBackups = 30) =>
    new BackupService(
      { db } as unknown as Connection,
      {
        get: (key: string) => (key === 'backup.maxBackups' ? maxBackups : true),
      } as ConfigService,
      drive as unknown as GoogleDriveService,
    );
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-10-05T03:00:00Z'));
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    db.listCollections.mockReturnValue({
      toArray: jest
        .fn()
        .mockResolvedValue([{ name: 'students' }, { name: 'system.views' }]),
    });
    db.collection.mockReturnValue({
      find: () => ({ toArray: jest.fn().mockResolvedValue(docs) }),
    });
    drive.isConfigured.mockReturnValue(true);
    drive.checkBackupFolder.mockResolvedValue({
      name: 'Backups',
      sharedDrive: true,
    });
    drive.uploadFile.mockResolvedValue({ fileId: 'file-id' });
    drive.pruneOldBackups.mockResolvedValue(0);
    drive.listBackupFiles.mockResolvedValue([]);
    service = makeService();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('compresses exported collections and prunes only after a successful upload', async () => {
    await service.handleScheduledBackup();
    expect(drive.checkBackupFolder).toHaveBeenCalled();
    const [name, buffer] = drive.uploadFile.mock.calls[0] as [string, Buffer];
    expect(name).toBe('edutrack_backup_2026-10-05_10-00-00.json.gz');
    const payload = JSON.parse(gunzipSync(buffer).toString()) as {
      collections: Record<string, unknown[]>;
      metadata: { totalDocuments: number };
    };
    expect(payload.collections).toEqual({ students: docs });
    expect(payload.metadata.totalDocuments).toBe(1);
    expect(drive.pruneOldBackups).toHaveBeenCalledWith(30);
  });
  it('checks folder readiness before reading any database collection', async () => {
    drive.checkBackupFolder.mockRejectedValue(
      new Error('Service accounts have no Drive storage quota'),
    );
    await service.handleScheduledBackup();
    expect(db.listCollections).not.toHaveBeenCalled();
    expect(drive.uploadFile).not.toHaveBeenCalled();
    expect(drive.pruneOldBackups).not.toHaveBeenCalled();
  });
  it('does not publish a partial backup when any collection export fails', async () => {
    db.collection.mockReturnValue({
      find: () => ({
        toArray: jest.fn().mockRejectedValue(new Error('DB unavailable')),
      }),
    });
    await service.handleScheduledBackup();
    expect(drive.uploadFile).not.toHaveBeenCalled();
    expect(drive.pruneOldBackups).not.toHaveBeenCalled();
  });
  it('keeps old backups when upload fails and allows the next run to retry', async () => {
    drive.uploadFile.mockRejectedValueOnce(new Error('Upload failed'));
    await service.handleScheduledBackup();
    expect(drive.pruneOldBackups).not.toHaveBeenCalled();
    await service.handleScheduledBackup();
    expect(drive.uploadFile).toHaveBeenCalledTimes(2);
    expect(drive.pruneOldBackups).toHaveBeenCalledTimes(1);
  });
  it('requires a successful file ID before deleting old backups', async () => {
    drive.uploadFile.mockResolvedValue(null);
    await service.handleScheduledBackup();
    expect(drive.pruneOldBackups).not.toHaveBeenCalled();
  });
  it('rejects invalid retention before exporting data', async () => {
    await makeService(0).handleScheduledBackup();
    expect(db.listCollections).not.toHaveBeenCalled();
  });
  it('does not overlap two scheduled backups', async () => {
    let release!: () => void;
    drive.checkBackupFolder.mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    const first = service.handleScheduledBackup();
    await service.handleScheduledBackup();
    release();
    await first;
    expect(drive.uploadFile).toHaveBeenCalledTimes(1);
  });
  it('catches up a missed 02:00 backup when Render restarts later that day', async () => {
    await service.catchUpAfterStartup();
    expect(drive.uploadFile).toHaveBeenCalledTimes(1);
  });
  it('does not create an early backup before 02:00 Vietnam time', async () => {
    jest.setSystemTime(new Date('2026-10-04T18:59:00Z'));
    await service.catchUpAfterStartup();
    expect(drive.listBackupFiles).not.toHaveBeenCalled();
    expect(drive.uploadFile).not.toHaveBeenCalled();
  });
  it('does not repeat a successful backup from the current backup day', async () => {
    drive.listBackupFiles.mockResolvedValue([
      { createdTime: '2026-10-04T19:01:00Z' },
    ]);
    await service.catchUpAfterStartup();
    expect(drive.uploadFile).not.toHaveBeenCalled();
  });
  it('ignores a backup created before the current 02:00 boundary', async () => {
    drive.listBackupFiles.mockResolvedValue([
      { createdTime: '2026-10-04T18:59:00Z' },
    ]);
    await service.catchUpAfterStartup();
    expect(drive.uploadFile).toHaveBeenCalledTimes(1);
  });
  it('does not assume there are no backups when the Drive history cannot be read', async () => {
    drive.listBackupFiles.mockRejectedValue(new Error('Drive unavailable'));
    await service.catchUpAfterStartup();
    expect(drive.uploadFile).not.toHaveBeenCalled();
  });
});
