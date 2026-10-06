import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { createECDH } from 'node:crypto';
import * as webpush from 'web-push';
import { isSupportedPushEndpoint } from '../users/dto/push-subscription.dto';
import { UsersService } from '../users/users.service';
import { summarizePushDevices } from '../users/utils/push-device';

export type PushDeliveryResult = {
  configured: boolean;
  attempted: number;
  sent: number;
  failed: number;
  removed: number;
};

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private configured = false;
  private publicKey: string | null = null;
  private configurationError?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const publicKey = this.configService
      .get<string>('VAPID_PUBLIC_KEY')
      ?.trim();
    const privateKey = this.configService
      .get<string>('VAPID_PRIVATE_KEY')
      ?.trim();
    const subject = this.configService.get<string>('VAPID_SUBJECT')?.trim();

    if (!publicKey || !privateKey || !subject) {
      this.configurationError =
        'Máy chủ chưa cấu hình đủ VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY và VAPID_SUBJECT.';
    } else {
      try {
        // web-push validates formats but does not check that both keys form a pair.
        const curve = createECDH('prime256v1');
        curve.setPrivateKey(Buffer.from(privateKey, 'base64url'));
        if (!curve.getPublicKey().equals(Buffer.from(publicKey, 'base64url'))) {
          throw new Error('VAPID key pair mismatch');
        }
        const subjectUrl = new URL(subject);
        if (
          subjectUrl.protocol === 'https:' &&
          subjectUrl.hostname === 'localhost'
        ) {
          throw new Error('VAPID subject must be publicly reachable');
        }
        webpush.setVapidDetails(subject, publicKey, privateKey);
        this.publicKey = publicKey;
        this.configured = true;
      } catch {
        this.configurationError =
          'Cấu hình VAPID không hợp lệ: kiểm tra cặp public/private key và VAPID_SUBJECT (mailto: hoặc HTTPS công khai).';
      }
    }
    if (this.configurationError) this.logger.warn(this.configurationError);
  }

  async getStatus(userId: string) {
    const subscriptions = await this.usersService.getPushSubscriptions(userId);
    const devices = summarizePushDevices(subscriptions);
    return {
      configured: this.configured,
      publicKey: this.publicKey,
      subscriptionCount: devices.length,
      devices,
      ...(this.configurationError
        ? { configurationError: this.configurationError }
        : {}),
    };
  }

  // Propagate database/listener failures so cron can retry instead of marking sent.
  @OnEvent('notification.push', { suppressErrors: false })
  handleNotificationEvent(data: {
    userId: string;
    payload: Record<string, unknown>;
  }): Promise<PushDeliveryResult> {
    return this.sendNotification(data.userId, data.payload);
  }

  async sendTestNotification(userId: string, endpoint: string) {
    const result = await this.sendNotification(
      userId,
      {
        title: 'Thông báo thử EduTrack',
        body: 'Thiết bị này đã nhận được thông báo thử từ EduTrack.',
        url: '/dashboard',
        tag: 'edutrack-push-test',
      },
      endpoint,
    );
    return {
      ...result,
      message: !result.configured
        ? this.configurationError
        : result.sent > 0
          ? 'Dịch vụ Web Push đã chấp nhận thông báo. Kiểm tra thông báo trên thiết bị này.'
          : result.removed > 0
            ? 'Đăng ký nhận thông báo đã hết hiệu lực. Vui lòng bật lại thông báo trên thiết bị này.'
            : 'Chưa gửi được thông báo. Kiểm tra log máy chủ và thử lại.',
    };
  }

  async sendNotification(
    userId: string,
    payload: Record<string, unknown>,
    endpoint?: string,
  ): Promise<PushDeliveryResult> {
    const subscriptions = await this.usersService.getPushSubscriptions(userId);
    const selected = endpoint
      ? subscriptions.filter((sub) => sub.endpoint === endpoint)
      : subscriptions;
    if (endpoint && selected.length === 0) {
      throw new BadRequestException(
        'Thiết bị này chưa đăng ký thông báo với tài khoản hiện tại. Vui lòng bật lại thông báo.',
      );
    }

    const result: PushDeliveryResult = {
      configured: this.configured,
      attempted: 0,
      sent: 0,
      failed: 0,
      removed: 0,
    };
    if (!this.configured || selected.length === 0) return result;

    // Dedupe legacy records, sending at most once to each browser subscription.
    const unique = [
      ...new Map(selected.map((sub) => [sub.endpoint, sub])).values(),
    ];
    const payloadJson = JSON.stringify(payload);
    await Promise.all(
      unique.map(async (subscription) => {
        result.attempted++;
        try {
          if (!isSupportedPushEndpoint(subscription.endpoint)) {
            throw new Error('Unsupported push gateway');
          }
          await webpush.sendNotification(
            subscription as webpush.PushSubscription,
            payloadJson,
            { TTL: 30 * 60, urgency: 'high', timeout: 10_000 },
          );
          result.sent++;
        } catch (error: unknown) {
          result.failed++;
          const statusCode = this.getStatusCode(error);
          if (statusCode === 404 || statusCode === 410) {
            try {
              await this.usersService.removePushSubscription(
                userId,
                subscription.endpoint,
              );
              result.removed++;
            } catch {
              this.logger.error(
                `Push subscription cleanup failed user=${userId}`,
              );
            }
          }
          // Error bodies/messages may contain endpoint tokens or authorization
          // details. Log the status and aggregate counts, never those secrets.
          this.logger.warn(
            `Push delivery failed user=${userId} status=${statusCode ?? 'transport_or_subscription_error'}`,
          );
        }
      }),
    );
    this.logger.log(
      `Push delivery user=${userId} attempted=${result.attempted} accepted=${result.sent} failed=${result.failed} removed=${result.removed}`,
    );
    return result;
  }

  private getStatusCode(error: unknown): number | undefined {
    if (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof error.statusCode === 'number'
    ) {
      return error.statusCode;
    }
    return undefined;
  }
}
