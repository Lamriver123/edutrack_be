export enum PushDeviceType {
  Desktop = 'desktop',
  Mobile = 'mobile',
  Tablet = 'tablet',
  Unknown = 'unknown',
}

export type PushDeviceInfo = {
  type: PushDeviceType;
  name: string;
  browser: string | null;
  os: string | null;
};

export type StoredPushSubscription = {
  endpoint: string;
  keys?: { p256dh: string; auth: string };
  device?: PushDeviceInfo;
  registeredAt?: Date;
  lastSeenAt?: Date;
};

export type PushDeviceSummary = PushDeviceInfo & {
  id: string;
  registeredAt: string | null;
  lastSeenAt: string | null;
};
