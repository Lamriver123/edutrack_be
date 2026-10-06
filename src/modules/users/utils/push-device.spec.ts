import { PushDeviceType } from '../types/push-device.type';
import {
  describePushDevice,
  pushDeviceId,
  summarizePushDevices,
} from './push-device';

const desktop =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/143.0.0.0 Safari/537.36';
const iphone =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';

describe('Push device display metadata', () => {
  it.each([
    [
      desktop,
      'Máy tính Windows',
      'Google Chrome',
      'Windows',
      PushDeviceType.Desktop,
    ],
    [
      desktop + ' Edg/143.0',
      'Máy tính Windows',
      'Microsoft Edge',
      'Windows',
      PushDeviceType.Desktop,
    ],
    [
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/143.0 Mobile Safari/537.36',
      'Điện thoại Android',
      'Google Chrome',
      'Android',
      PushDeviceType.Mobile,
    ],
    [
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/143.0 Safari/537.36',
      'Máy tính bảng Android',
      'Google Chrome',
      'Android',
      PushDeviceType.Tablet,
    ],
    [iphone, 'iPhone', 'Safari', 'iOS', PushDeviceType.Mobile],
    [
      iphone.replace('Version/18.0', 'CriOS/143.0'),
      'iPhone',
      'Google Chrome',
      'iOS',
      PushDeviceType.Mobile,
    ],
    [
      'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0',
      'Máy tính Linux',
      'Firefox',
      'Linux',
      PushDeviceType.Desktop,
    ],
  ])(
    'describes %s without confusing compatible browser tokens',
    (ua, name, browser, os, type) => {
      expect(describePushDevice(ua)).toEqual({ name, browser, os, type });
    },
  );

  it('recognizes iPadOS desktop mode from the validated display hint', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';
    expect(describePushDevice(ua, PushDeviceType.Tablet)).toEqual({
      name: 'iPad',
      browser: 'Safari',
      os: 'iPadOS',
      type: PushDeviceType.Tablet,
    });
    expect(describePushDevice(ua).name).toBe('Mac');
  });

  it('shows legacy devices honestly and never exposes transport credentials', () => {
    const endpoint = 'https://fcm.googleapis.com/fcm/send/private-token';
    const devices = summarizePushDevices([
      { endpoint, keys: { p256dh: 'private-key', auth: 'private-auth' } },
    ]);
    expect(devices).toEqual([
      {
        id: pushDeviceId(endpoint),
        name: 'Thiết bị chưa xác định',
        type: PushDeviceType.Unknown,
        browser: null,
        os: null,
        registeredAt: null,
        lastSeenAt: null,
      },
    ]);
    const json = JSON.stringify(devices);
    for (const value of [
      endpoint,
      'private-token',
      'private-key',
      'private-auth',
    ])
      expect(json).not.toContain(value);
  });

  it('deduplicates legacy endpoints, keeps richer metadata, and sorts latest registrations first', () => {
    const endpoint = 'https://fcm.googleapis.com/fcm/send/first';
    const devices = summarizePushDevices([
      { endpoint },
      {
        endpoint,
        device: describePushDevice(desktop),
        registeredAt: new Date('2026-10-01'),
        lastSeenAt: new Date('2026-10-06'),
      },
      {
        endpoint: endpoint + '-new',
        device: describePushDevice(iphone),
        lastSeenAt: new Date('2026-10-07'),
      },
    ]);
    expect(devices).toHaveLength(2);
    expect(devices.map((device) => device.name)).toEqual([
      'iPhone',
      'Máy tính Windows',
    ]);
    expect(devices[1].registeredAt).toBe('2026-10-01T00:00:00.000Z');
    expect(
      summarizePushDevices([{ endpoint, lastSeenAt: new Date('invalid') }])[0]
        .lastSeenAt,
    ).toBeNull();
  });
});
