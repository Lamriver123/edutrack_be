import { Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { PushService } from './push.service';

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));
jest.mock('@nestjs/event-emitter', () => ({ OnEvent: () => () => undefined }));
jest.mock('web-push', () => ({
  __esModule: true,
  ...jest.requireActual<typeof import('web-push')>('web-push'),
  sendNotification: jest.fn(),
}));

const USER_ID = '68cf00000000000000000001';
const endpoint = 'https://fcm.googleapis.com/fcm/send/secret-device-token';
const subscription = {
  endpoint,
  keys: { p256dh: 'test-public-key', auth: 'test-auth-secret' },
};
const keys = webpush.generateVAPIDKeys();

function createService(env: Record<string, string | undefined> = {}) {
  const config: Record<string, string | undefined> = {
    VAPID_PUBLIC_KEY: keys.publicKey,
    VAPID_PRIVATE_KEY: keys.privateKey,
    VAPID_SUBJECT: 'mailto:teacher@example.com',
    ...env,
  };
  const users = {
    getPushSubscriptions: jest.fn().mockResolvedValue([subscription]),
    removePushSubscription: jest.fn().mockResolvedValue({ success: true }),
  };
  const service = new PushService(
    { get: (name: string) => config[name] } as never,
    users as never,
  );
  return { service, users };
}

describe('PushService', () => {
  let warnSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.mocked(webpush.sendNotification).mockResolvedValue({
      statusCode: 201,
      headers: {},
      body: '',
    });
  });
  afterEach(() => jest.restoreAllMocks());

  it('reads explicitly selected subscriptions and awaits provider acceptance', async () => {
    const { service, users } = createService();
    const payload = { title: 'Class reminder', tag: 'unique-class-event' };
    await expect(
      service.handleNotificationEvent({ userId: USER_ID, payload }),
    ).resolves.toEqual({
      configured: true,
      attempted: 1,
      sent: 1,
      failed: 0,
      removed: 0,
    });
    expect(users.getPushSubscriptions).toHaveBeenCalledWith(USER_ID);
    expect(webpush.sendNotification).toHaveBeenCalledWith(
      subscription,
      JSON.stringify(payload),
      { TTL: 1800, urgency: 'high', timeout: 10000 },
    );
  });

  it.each([404, 410])(
    'removes only expired subscriptions for status %s',
    async (statusCode) => {
      const { service, users } = createService();
      jest.mocked(webpush.sendNotification).mockRejectedValue({ statusCode });
      await expect(
        service.sendNotification(USER_ID, {}),
      ).resolves.toMatchObject({
        attempted: 1,
        sent: 0,
        failed: 1,
        removed: 1,
      });
      expect(users.removePushSubscription).toHaveBeenCalledWith(
        USER_ID,
        endpoint,
      );
    },
  );

  it.each([401, 403, 429, 500, 503])(
    'retains subscriptions and reports retryable/diagnostic failure %s',
    async (statusCode) => {
      const { service, users } = createService();
      jest
        .mocked(webpush.sendNotification)
        .mockRejectedValue({ statusCode, message: endpoint });
      await expect(
        service.sendNotification(USER_ID, {}),
      ).resolves.toMatchObject({ sent: 0, failed: 1, removed: 0 });
      expect(users.removePushSubscription).not.toHaveBeenCalled();
      expect(JSON.stringify(warnSpy.mock.calls)).not.toContain(endpoint);
    },
  );

  it('reports partial success without losing the accepted delivery on cleanup failure', async () => {
    const { service, users } = createService();
    users.getPushSubscriptions.mockResolvedValue([
      subscription,
      { ...subscription, endpoint: `${endpoint}-second` },
    ]);
    users.removePushSubscription.mockRejectedValue(new Error('DB failure'));
    jest
      .mocked(webpush.sendNotification)
      .mockRejectedValueOnce({ statusCode: 410 });
    await expect(service.sendNotification(USER_ID, {})).resolves.toMatchObject({
      attempted: 2,
      sent: 1,
      failed: 1,
      removed: 0,
    });
  });

  it('propagates database failures to the cron caller', async () => {
    const { service, users } = createService();
    users.getPushSubscriptions.mockRejectedValue(new Error('DB unavailable'));
    await expect(
      service.handleNotificationEvent({ userId: USER_ID, payload: {} }),
    ).rejects.toThrow('DB unavailable');
  });

  it('returns zero accepted deliveries when no device is registered', async () => {
    const { service, users } = createService();
    users.getPushSubscriptions.mockResolvedValue([]);
    await expect(service.sendNotification(USER_ID, {})).resolves.toMatchObject({
      attempted: 0,
      sent: 0,
    });
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });

  it('deduplicates legacy subscriptions by endpoint', async () => {
    const { service, users } = createService();
    users.getPushSubscriptions.mockResolvedValue([subscription, subscription]);
    await expect(service.sendNotification(USER_ID, {})).resolves.toMatchObject({
      attempted: 1,
      sent: 1,
    });
    expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
  });

  it('tests only the selected device owned by the authenticated user', async () => {
    const { service, users } = createService();
    const second = { ...subscription, endpoint: `${endpoint}-second` };
    users.getPushSubscriptions.mockResolvedValue([subscription, second]);
    await expect(
      service.sendTestNotification(USER_ID, second.endpoint),
    ).resolves.toMatchObject({ sent: 1, attempted: 1 });
    expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
    expect(jest.mocked(webpush.sendNotification).mock.calls[0][0]).toEqual(
      second,
    );
    await expect(
      service.sendTestNotification(USER_ID, `${endpoint}-someone-else`),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('disables delivery and exposes a safe diagnostic for missing keys', async () => {
    const { service } = createService({ VAPID_PRIVATE_KEY: undefined });
    await expect(service.getStatus(USER_ID)).resolves.toMatchObject({
      configured: false,
      publicKey: null,
      subscriptionCount: 1,
    });
    await expect(
      service.sendTestNotification(USER_ID, endpoint),
    ).resolves.toMatchObject({ configured: false, attempted: 0, sent: 0 });
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });

  it('detects a mismatched VAPID pair without crashing startup or exposing private keys', async () => {
    const { service } = createService({
      VAPID_PRIVATE_KEY: webpush.generateVAPIDKeys().privateKey,
    });
    const status = await service.getStatus(USER_ID);
    expect(status.configured).toBe(false);
    expect(status.configurationError).toBeDefined();
    expect(JSON.stringify(status)).not.toContain(keys.privateKey);
    expect(JSON.stringify(warnSpy.mock.calls)).not.toContain(keys.privateKey);
  });

  it('rejects malformed subjects and strips surrounding whitespace from valid settings', async () => {
    await expect(
      createService({ VAPID_SUBJECT: 'http://localhost' }).service.getStatus(
        USER_ID,
      ),
    ).resolves.toMatchObject({ configured: false });
    await expect(
      createService({
        VAPID_PUBLIC_KEY: ` ${keys.publicKey}\n`,
      }).service.getStatus(USER_ID),
    ).resolves.toMatchObject({ configured: true, publicKey: keys.publicKey });
  });

  it('does not send to arbitrary URLs persisted before DTO validation', async () => {
    const { service, users } = createService();
    users.getPushSubscriptions.mockResolvedValue([
      { ...subscription, endpoint: 'https://127.0.0.1/admin' },
    ]);
    await expect(service.sendNotification(USER_ID, {})).resolves.toMatchObject({
      sent: 0,
      failed: 1,
    });
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });
});
