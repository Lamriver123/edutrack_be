import { ValidationPipe } from '@nestjs/common';
import { PushEndpointDto, PushSubscriptionDto } from './push-subscription.dto';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
const subscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/device-token',
  keys: { p256dh: 'B'.repeat(87), auth: 'A'.repeat(22) },
  expirationTime: null,
};

describe('Push subscription DTOs', () => {
  const validate = (body: unknown) =>
    pipe.transform(body, { type: 'body', metatype: PushSubscriptionDto });

  it('accepts browser PushSubscription JSON including null expirationTime', async () => {
    await expect(validate(subscription)).resolves.toMatchObject(subscription);
  });

  it.each([
    { endpoint: subscription.endpoint },
    { ...subscription, keys: { auth: 'A'.repeat(22) } },
    { ...subscription, keys: { ...subscription.keys, auth: 'invalid' } },
    { ...subscription, keys: { ...subscription.keys, p256dh: '' } },
    { ...subscription, teacherId: 'another-user' },
    { ...subscription, keys: { ...subscription.keys, extra: 'invalid' } },
    { ...subscription, expirationTime: -1 },
  ])('rejects invalid or injected subscription fields %#', async (body) => {
    await expect(validate(body)).rejects.toMatchObject({ status: 400 });
  });

  it.each([
    'http://fcm.googleapis.com/endpoint',
    'https://127.0.0.1/admin',
    'https://localhost/admin',
    'https://10.0.0.1/admin',
    'https://fcm.googleapis.com.attacker.example/endpoint',
    'https://user:password@fcm.googleapis.com/endpoint',
    'https://fcm.googleapis.com:8080/endpoint',
  ])('rejects insecure or untrusted endpoint %s', async (endpoint) => {
    await expect(validate({ ...subscription, endpoint })).rejects.toMatchObject(
      { status: 400 },
    );
  });

  it.each([
    'https://updates.push.services.mozilla.com/wpush/v2/device',
    'https://web.push.apple.com/device',
    'https://wns2.notify.windows.com/w/device',
  ])('accepts browser gateway %s', async (endpoint) => {
    await expect(
      validate({ ...subscription, endpoint }),
    ).resolves.toMatchObject({ endpoint });
  });

  it('requires a device endpoint for a test request', async () => {
    await expect(
      pipe.transform({}, { type: 'body', metatype: PushEndpointDto }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
