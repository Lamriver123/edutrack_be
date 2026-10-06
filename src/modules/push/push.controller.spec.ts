import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { sign } from 'jsonwebtoken';
import type { Server } from 'node:http';
import request from 'supertest';
import * as webpush from 'web-push';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { UsersService } from '../users/users.service';
import { PushController } from './push.controller';
import { PushService } from './push.service';

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));
jest.mock('web-push', () => ({
  __esModule: true,
  ...jest.requireActual<typeof import('web-push')>('web-push'),
  sendNotification: jest.fn(),
}));

const USER_ID = '68cf00000000000000000001';
const OTHER_USER_ID = '68cf00000000000000000002';
const JWT_SECRET = 'local-push-controller-test-secret';
const subscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/test-device',
  keys: { p256dh: 'B'.repeat(87), auth: 'A'.repeat(22) },
};

describe('Push API with JWT, validation and real event wiring', () => {
  let app: INestApplication;
  let server: Server;
  const users = {
    getPushSubscriptions: jest.fn(),
    addPushSubscription: jest.fn(),
    removePushSubscription: jest.fn(),
  };
  const token = (userId = USER_ID) =>
    sign(
      {
        sub: userId,
        email: 'teacher@example.com',
        role: 'teacher',
        tokenType: 'access',
      },
      JWT_SECRET,
      { expiresIn: '5m' },
    );

  beforeAll(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const vapid = webpush.generateVAPIDKeys();
    const config: Record<string, string> = {
      'jwt.secret': JWT_SECRET,
      VAPID_PUBLIC_KEY: vapid.publicKey,
      VAPID_PRIVATE_KEY: vapid.privateKey,
      VAPID_SUBJECT: 'mailto:teacher@example.com',
    };
    const module = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      controllers: [PushController],
      providers: [
        PushService,
        JwtStrategy,
        { provide: UsersService, useValue: users },
        {
          provide: ConfigService,
          useValue: { get: (name: string) => config[name] },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    server = app.getHttpServer() as Server;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    users.getPushSubscriptions.mockImplementation((userId: string) =>
      Promise.resolve(userId === USER_ID ? [subscription] : []),
    );
    users.addPushSubscription.mockResolvedValue({ success: true });
    users.removePushSubscription.mockResolvedValue({ success: true });
    jest
      .mocked(webpush.sendNotification)
      .mockResolvedValue({ statusCode: 201, headers: {}, body: '' });
  });

  afterAll(async () => {
    await app?.close();
    jest.restoreAllMocks();
  });

  it('rejects unauthenticated status, subscription, test, and delete calls', async () => {
    await request(server)
      .get('/api/users/me/push-subscription/status')
      .expect(401);
    await request(server)
      .post('/api/users/me/push-subscription')
      .send(subscription)
      .expect(401);
    await request(server)
      .post('/api/users/me/push-subscription/test')
      .send({ endpoint: subscription.endpoint })
      .expect(401);
    await request(server)
      .delete('/api/users/me/push-subscription')
      .send({ endpoint: subscription.endpoint })
      .expect(401);
    expect(users.getPushSubscriptions).not.toHaveBeenCalled();
  });

  it('returns the runtime public key and own device count without private material', async () => {
    const response = await request(server)
      .get('/api/users/me/push-subscription/status')
      .auth(token(), { type: 'bearer' })
      .expect(200);
    const body = response.body as Awaited<ReturnType<PushService['getStatus']>>;
    expect(body.configured).toBe(true);
    expect(body.subscriptionCount).toBe(1);
    expect(typeof body.publicKey).toBe('string');
    expect(Object.keys(body).sort()).toEqual([
      'configured',
      'devices',
      'publicKey',
      'subscriptionCount',
    ]);
    expect(users.getPushSubscriptions).toHaveBeenCalledWith(USER_ID);
  });

  it('validates browser subscriptions and persists with identity taken from JWT', async () => {
    await request(server)
      .post('/api/users/me/push-subscription')
      .auth(token(), { type: 'bearer' })
      .send({ ...subscription, expirationTime: null })
      .expect(201);
    expect(users.addPushSubscription).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining(subscription),
      undefined,
    );
    await request(server)
      .post('/api/users/me/push-subscription')
      .auth(token(), { type: 'bearer' })
      .send({ ...subscription, teacherId: OTHER_USER_ID })
      .expect(400);
    await request(server)
      .post('/api/users/me/push-subscription')
      .auth(token(), { type: 'bearer' })
      .send({ endpoint: subscription.endpoint })
      .expect(400);
    expect(users.addPushSubscription).toHaveBeenCalledTimes(1);
  });

  it('captures safe browser metadata and uses the hint for an iPad in desktop mode', async () => {
    await request(server)
      .post('/api/users/me/push-subscription')
      .auth(token(), { type: 'bearer' })
      .set(
        'User-Agent',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Version/18.0 Safari/605.1.15',
      )
      .set('X-Push-Device-Type', 'tablet')
      .send(subscription)
      .expect(201);
    expect(users.addPushSubscription).toHaveBeenCalledWith(
      USER_ID,
      expect.objectContaining(subscription),
      {
        name: 'iPad',
        type: 'tablet',
        os: 'iPadOS',
        browser: 'Safari',
      },
    );
  });

  it('returns only the authenticated account devices and strips endpoints and push keys', async () => {
    const own = await request(server)
      .get('/api/users/me/push-subscription/status')
      .auth(token(), { type: 'bearer' })
      .expect(200);
    const ownStatus = own.body as Awaited<ReturnType<PushService['getStatus']>>;
    expect(ownStatus.devices).toHaveLength(1);
    expect(JSON.stringify(own.body)).not.toContain(subscription.endpoint);
    expect(JSON.stringify(own.body)).not.toContain(subscription.keys.auth);
    const other = await request(server)
      .get('/api/users/me/push-subscription/status')
      .auth(token(OTHER_USER_ID), { type: 'bearer' })
      .expect(200);
    const otherStatus = other.body as Awaited<
      ReturnType<PushService['getStatus']>
    >;
    expect(otherStatus.devices).toEqual([]);
    expect(otherStatus.subscriptionCount).toBe(0);
  });

  it('returns actual provider acceptance instead of fire-and-forget success', async () => {
    jest
      .mocked(webpush.sendNotification)
      .mockRejectedValueOnce({ statusCode: 503 });
    const response = await request(server)
      .post('/api/users/me/push-subscription/test')
      .auth(token(), { type: 'bearer' })
      .send({ endpoint: subscription.endpoint })
      .expect(201);
    expect(response.body).toMatchObject({
      configured: true,
      attempted: 1,
      sent: 0,
      failed: 1,
      removed: 0,
    });
    expect((response.body as { message: string }).message).toContain(
      'Chưa gửi được',
    );
  });

  it('does not let another teacher test this device endpoint', async () => {
    await request(server)
      .post('/api/users/me/push-subscription/test')
      .auth(token(OTHER_USER_ID), { type: 'bearer' })
      .send({ endpoint: subscription.endpoint })
      .expect(400);
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });

  it('scopes subscription deletion to JWT identity', async () => {
    await request(server)
      .delete('/api/users/me/push-subscription')
      .auth(token(), { type: 'bearer' })
      .send({ endpoint: subscription.endpoint })
      .expect(200);
    expect(users.removePushSubscription).toHaveBeenCalledWith(
      USER_ID,
      subscription.endpoint,
    );
  });

  it('resolves emitAsync with delivery counts for the scheduler', async () => {
    await expect(
      app.get(EventEmitter2).emitAsync('notification.push', {
        userId: USER_ID,
        payload: { title: 'Cron integration' },
      }),
    ).resolves.toEqual([
      { configured: true, attempted: 1, sent: 1, failed: 0, removed: 0 },
    ]);
  });

  it('propagates listener database failures back to emitAsync callers', async () => {
    users.getPushSubscriptions.mockRejectedValueOnce(
      new Error('DB unavailable'),
    );
    await expect(
      app.get(EventEmitter2).emitAsync('notification.push', {
        userId: USER_ID,
        payload: { title: 'Cron integration' },
      }),
    ).rejects.toThrow('DB unavailable');
  });
});
