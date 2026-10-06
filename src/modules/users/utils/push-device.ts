import { createHash } from 'node:crypto';
import {
  PushDeviceType,
  type PushDeviceInfo,
  type PushDeviceSummary,
  type StoredPushSubscription,
} from '../types/push-device.type';

export const pushDeviceId = (endpoint: string) =>
  createHash('sha256').update(endpoint).digest('hex');

// Display metadata only. Push support and authorization never depend on UA.
// Do not persist the raw user-agent or guess a precise hardware model.
export function describePushDevice(
  userAgent: string,
  deviceType?: PushDeviceType,
): PushDeviceInfo {
  const ua = userAgent.slice(0, 1024);
  const ipad =
    /iPad/i.test(ua) ||
    (deviceType === PushDeviceType.Tablet && /Macintosh/i.test(ua));
  const type =
    deviceType ??
    (ipad || /Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))
      ? PushDeviceType.Tablet
      : /Mobi|iPhone|iPod/i.test(ua)
        ? PushDeviceType.Mobile
        : /Windows NT|Macintosh|X11|CrOS|Linux/i.test(ua)
          ? PushDeviceType.Desktop
          : PushDeviceType.Unknown);
  const os = ipad
    ? 'iPadOS'
    : /iPhone|iPod/i.test(ua)
      ? 'iOS'
      : /Android/i.test(ua)
        ? 'Android'
        : /Windows/i.test(ua)
          ? 'Windows'
          : /CrOS/i.test(ua)
            ? 'ChromeOS'
            : /Macintosh|Mac OS X/i.test(ua)
              ? 'macOS'
              : /Linux|X11/i.test(ua)
                ? 'Linux'
                : null;
  const browser = /Edg(?:e|A|iOS)?\//i.test(ua)
    ? 'Microsoft Edge'
    : /OPR|OPiOS|OPT\//i.test(ua)
      ? 'Opera'
      : /SamsungBrowser\//i.test(ua)
        ? 'Samsung Internet'
        : /Firefox|FxiOS/i.test(ua)
          ? 'Firefox'
          : /Chrome|CriOS/i.test(ua)
            ? 'Google Chrome'
            : /Safari/i.test(ua)
              ? 'Safari'
              : null;
  const name =
    os === 'iPadOS'
      ? 'iPad'
      : os === 'iOS' && type === PushDeviceType.Mobile
        ? 'iPhone'
        : os === 'Android'
          ? type === PushDeviceType.Tablet
            ? 'Máy tính bảng Android'
            : 'Điện thoại Android'
          : os === 'macOS'
            ? 'Mac'
            : os === 'Windows'
              ? 'Máy tính Windows'
              : os === 'ChromeOS'
                ? 'Chromebook'
                : os === 'Linux'
                  ? 'Máy tính Linux'
                  : type === PushDeviceType.Mobile
                    ? 'Điện thoại'
                    : type === PushDeviceType.Tablet
                      ? 'Máy tính bảng'
                      : type === PushDeviceType.Desktop
                        ? 'Máy tính'
                        : 'Thiết bị chưa xác định';
  return { type, name, browser, os };
}

function isoDate(value: unknown): string | null {
  if (!(value instanceof Date) && typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export function summarizePushDevices(
  subscriptions: StoredPushSubscription[],
): PushDeviceSummary[] {
  const devices = new Map<string, PushDeviceSummary>();
  for (const subscription of subscriptions) {
    const stored = subscription.device;
    const known = stored && Object.values(PushDeviceType).includes(stored.type);
    const device: PushDeviceSummary = {
      id: pushDeviceId(subscription.endpoint),
      type: known ? stored.type : PushDeviceType.Unknown,
      name: known ? stored.name : 'Thiết bị chưa xác định',
      browser: known ? stored.browser : null,
      os: known ? stored.os : null,
      registeredAt: isoDate(subscription.registeredAt),
      lastSeenAt: isoDate(subscription.lastSeenAt),
    };
    const previous = devices.get(device.id);
    if (
      !previous ||
      (device.lastSeenAt ?? '') > (previous.lastSeenAt ?? '') ||
      (!previous.browser && device.browser)
    )
      devices.set(device.id, device);
  }
  return [...devices.values()].sort(
    (a, b) =>
      (b.lastSeenAt ?? '').localeCompare(a.lastSeenAt ?? '') ||
      a.id.localeCompare(b.id),
  );
}
