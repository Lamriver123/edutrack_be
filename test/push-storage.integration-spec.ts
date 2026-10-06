import { randomUUID } from 'node:crypto';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection, Model, Types } from 'mongoose';
import { CloudinaryService } from '../src/modules/cloudinary/cloudinary.service';
import { PushReminderStore } from '../src/modules/schedules/push-reminder-store.service';
import {
  PushReminder,
  PushReminderDocument,
  PushReminderSchema,
} from '../src/modules/schedules/schemas/push-reminder.schema';
import { BankDirectoryService } from '../src/modules/users/bank-directory.service';
import { PushSubscriptionDto } from '../src/modules/users/dto/push-subscription.dto';
import {
  User,
  UserDocument,
  UserSchema,
} from '../src/modules/users/schemas/user.schema';
import { UsersService } from '../src/modules/users/users.service';
import type { StoredPushSubscription } from '../src/modules/users/types/push-device.type';
import { describePushDevice } from '../src/modules/users/utils/push-device';

// Configuration is not part of these database-only tests. Avoid loading env
// and the ESM-only config package in this repository's CommonJS Jest runtime.
jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));

// Never read application env or connect to its database. This suite only owns
// the fresh localhost database below and never starts cron or sends a push.
const databaseName = `edutrack_push_test_${process.pid}_${randomUUID().replaceAll('-', '')}`;
const mongoUri = `mongodb://127.0.0.1:27017/${databaseName}`;

describe('Push storage integration against isolated local MongoDB', () => {
  let connection: Connection;
  let userModel: Model<UserDocument>;
  let reminderModel: Model<PushReminderDocument>;
  let users: UsersService;
  let store: PushReminderStore;

  const subscription = (
    name: string,
    auth = 'a'.repeat(22),
  ): PushSubscriptionDto => ({
    endpoint: `https://fcm.googleapis.com/fcm/send/integration-${name}`,
    keys: { p256dh: 'B'.repeat(87), auth },
  });

  const createUser = (subscriptions: StoredPushSubscription[] = []) =>
    userModel.create({
      fullName: 'Push integration teacher',
      email: `${randomUUID()}@example.invalid`,
      passwordHash: 'test-only-never-used-for-auth',
      pushSubscriptions: subscriptions,
    });

  beforeAll(async () => {
    connection = await createConnection(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    }).asPromise();
    userModel = connection.model<UserDocument>(User.name, UserSchema);
    reminderModel = connection.model<PushReminderDocument>(
      PushReminder.name,
      PushReminderSchema,
    );
    await Promise.all([userModel.init(), reminderModel.init()]);
    users = new UsersService(
      userModel,
      new ConfigService(),
      {} as BankDirectoryService,
      {} as CloudinaryService,
    );
    store = new PushReminderStore(reminderModel);
  });

  afterAll(async () => {
    if (!connection) return;
    try {
      if (
        connection.name !== databaseName ||
        !databaseName.startsWith('edutrack_push_test_')
      ) {
        throw new Error('Refusing to drop a database not owned by this suite.');
      }
      await connection.dropDatabase();
    } finally {
      await connection.close();
    }
  });

  it('reads select:false subscriptions explicitly while profile and auth reads stay private', async () => {
    const device = subscription('private');
    const teacher = await createUser([device]);
    const teacherId = teacher._id.toString();

    const ordinary = await userModel.findById(teacherId).lean().exec();
    const auth = await users.findByIdWithSecrets(teacherId);
    expect(ordinary).not.toHaveProperty('pushSubscriptions');
    expect(auth?.pushSubscriptions).toBeUndefined();
    expect(auth?.passwordHash).toBeDefined();
    expect(await users.getPushSubscriptions(teacherId)).toEqual([device]);
    expect(await users.getProfile(teacherId)).not.toHaveProperty(
      'pushSubscriptions',
    );
  });

  it('preserves concurrent devices and replaces rotated keys without duplicate endpoints', async () => {
    const teacher = await createUser();
    const teacherId = teacher._id.toString();
    const devices = Array.from({ length: 12 }, (_, index) =>
      subscription(`device-${index}`),
    );

    await Promise.all(
      devices.flatMap((device) => [
        users.addPushSubscription(teacherId, device),
        users.addPushSubscription(teacherId, device),
      ]),
    );
    const registered = await users.getPushSubscriptions(teacherId);
    expect(registered).toHaveLength(devices.length);
    expect(new Set(registered.map((device) => device.endpoint)).size).toBe(
      devices.length,
    );

    const rotated = {
      ...devices[0],
      keys: { ...devices[0].keys, auth: 'z'.repeat(22) },
    };
    await users.addPushSubscription(teacherId, rotated);
    const afterRotation = await users.getPushSubscriptions(teacherId);
    expect(afterRotation).toHaveLength(devices.length);
    expect(
      afterRotation.find((device) => device.endpoint === rotated.endpoint),
    ).toMatchObject(rotated);
  });

  it('persists device metadata and preserves its registration date on key rotation', async () => {
    const originalDate = new Date('2026-09-10T01:00:00Z');
    const device = subscription('metadata');
    const teacher = await createUser([
      { ...device, registeredAt: originalDate },
    ]);
    const teacherId = teacher._id.toString();
    const metadata = describePushDevice(
      'Mozilla/5.0 (Windows NT 10.0) Chrome/143.0 Safari/537.36',
    );
    const registered = await users.addPushSubscription(
      teacherId,
      device,
      metadata,
    );
    const rotated = {
      ...device,
      keys: { ...device.keys, auth: 'z'.repeat(22) },
    };
    const renewed = await users.addPushSubscription(teacherId, rotated);
    expect(renewed.deviceId).toBe(registered.deviceId);
    const saved = await users.getPushSubscriptions(teacherId);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      ...rotated,
      device: metadata,
      registeredAt: originalDate,
    });
    expect(saved[0].lastSeenAt).toBeInstanceOf(Date);
    expect(await users.getProfile(teacherId)).not.toHaveProperty(
      'pushSubscriptions',
    );
  });

  it('deduplicates old records and removes only the requested endpoint amid another registration', async () => {
    const oldDevice = subscription('old');
    const retained = subscription('retained');
    const added = subscription('new');
    const teacher = await createUser([oldDevice, oldDevice, retained]);
    const teacherId = teacher._id.toString();
    await users.addPushSubscription(teacherId, oldDevice);
    expect(await users.getPushSubscriptions(teacherId)).toHaveLength(2);

    await Promise.all([
      users.removePushSubscription(teacherId, oldDevice.endpoint),
      users.addPushSubscription(teacherId, added),
    ]);
    expect(
      (await users.getPushSubscriptions(teacherId))
        .map((device) => device.endpoint)
        .sort(),
    ).toEqual([retained.endpoint, added.endpoint].sort());
  });

  it('scopes endpoint mutation to the selected user and rejects unknown users', async () => {
    const device = subscription('shared-browser');
    const teacherA = await createUser([device]);
    const teacherB = await createUser([device]);
    await users.removePushSubscription(
      teacherA._id.toString(),
      device.endpoint,
    );
    expect(await users.getPushSubscriptions(teacherA._id.toString())).toEqual(
      [],
    );
    expect(await users.getPushSubscriptions(teacherB._id.toString())).toEqual([
      device,
    ]);

    const missingId = new Types.ObjectId().toString();
    await expect(users.getPushSubscriptions(missingId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      users.addPushSubscription(missingId, device),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      users.removePushSubscription(missingId, device.endpoint),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('grants exactly one lease under concurrent duplicate-key upserts', async () => {
    const key = `concurrent:${randomUUID()}`;
    const now = new Date();
    const claims = await Promise.all(
      Array.from({ length: 20 }, () => store.claim(key, now)),
    );
    expect(claims.filter(Boolean)).toHaveLength(1);
    expect(await reminderModel.countDocuments({ _id: key })).toBe(1);
    const reminder = await reminderModel.findById(key).lean().exec();
    expect(reminder?.leaseUntil.getTime()).toBe(now.getTime() + 120000);
    expect(reminder?.expiresAt.getTime()).toBe(now.getTime() + 7 * 86400000);
    expect(reminder?.sentAt ?? null).toBeNull();
  });

  it('allows lease takeover after expiry and fences completion from the old worker', async () => {
    const key = `expired:${randomUUID()}`;
    const now = new Date();
    const oldToken = await store.claim(key, now);
    expect(oldToken).toBeTruthy();
    expect(await store.claim(key, new Date(now.getTime() + 119999))).toBeNull();
    const replacement = await store.claim(
      key,
      new Date(now.getTime() + 120000),
    );
    expect(replacement).toBeTruthy();
    expect(replacement).not.toBe(oldToken);

    await store.finish(key, oldToken!, true);
    await store.finish(key, oldToken!, false);
    const reminder = await reminderModel.findById(key).lean().exec();
    expect(reminder?.sentAt ?? null).toBeNull();
    expect(reminder?.leaseToken).toBe(replacement);
    expect(reminder?.leaseUntil.getTime()).toBe(now.getTime() + 240000);
  });

  it('releases failed delivery for retry and preserves accepted delivery across a fresh connection', async () => {
    const key = `restart:${randomUUID()}`;
    const now = new Date();
    const failedToken = await store.claim(key, now);
    await store.finish(key, failedToken!, false);
    const retryToken = await store.claim(key, now);
    expect(retryToken).toBeTruthy();
    expect(retryToken).not.toBe(failedToken);
    await store.finish(key, retryToken!, true);

    const restartedConnection = await createConnection(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    }).asPromise();
    try {
      const restartedModel = restartedConnection.model<PushReminderDocument>(
        PushReminder.name,
        PushReminderSchema,
      );
      const restartedStore = new PushReminderStore(restartedModel);
      expect(
        await restartedStore.claim(key, new Date(now.getTime() + 180000)),
      ).toBeNull();
      expect(
        (await restartedModel.findById(key).lean().exec())?.sentAt,
      ).toBeInstanceOf(Date);
    } finally {
      await restartedConnection.close();
    }
  });

  it('creates the MongoDB retention index for reminder markers', async () => {
    const indexes = await reminderModel.collection.indexes();
    expect(indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { expiresAt: 1 },
          expireAfterSeconds: 0,
        }),
        expect.objectContaining({ key: { _id: 1 } }),
      ]),
    );
  });
});
