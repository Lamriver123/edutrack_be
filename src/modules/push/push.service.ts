import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import * as webpush from 'web-push';
import { UsersService } from '../users/users.service';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.get<string>('VAPID_SUBJECT');

    if (publicKey && privateKey && subject) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
    } else {
      this.logger.warn('VAPID keys not configured, Web Push will not work.');
    }
  }

  @OnEvent('notification.push')
  async handleNotificationEvent(data: {
    userId: string;
    payload: Record<string, unknown>;
  }) {
    await this.sendNotification(data.userId, data.payload);
  }

  async sendNotification(userId: string, payload: Record<string, unknown>) {
    this.logger.log(`Handling notification.push event for userId: ${userId}`);
    const user = await this.usersService.findByIdWithSecrets(userId);
    if (
      !user ||
      !user.pushSubscriptions ||
      user.pushSubscriptions.length === 0
    ) {
      this.logger.debug(`User ${userId} has no push subscriptions. Skipping.`);
      return;
    }

    this.logger.log(
      `Sending push notification to ${user.pushSubscriptions.length} subscriptions for user ${userId}`,
    );
    const deadSubscriptions: string[] = [];

    const promises = user.pushSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          sub as webpush.PushSubscription,
          JSON.stringify(payload),
        );
        this.logger.log(`Successfully sent push to endpoint: ${sub.endpoint}`);
      } catch (error) {
        if (error instanceof webpush.WebPushError) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            this.logger.warn(
              `Subscription dead (410/404) for endpoint: ${sub.endpoint}`,
            );
            deadSubscriptions.push(sub.endpoint);
          } else {
            this.logger.error(
              `Failed to send push notification to ${userId}: ${error.message}`,
            );
          }
        } else if (error instanceof Error) {
          this.logger.error(
            `Failed to send push notification to ${userId}: ${error.message}`,
          );
        }
      }
    });

    await Promise.all(promises);

    // Clean up dead subscriptions
    for (const endpoint of deadSubscriptions) {
      await this.usersService.removePushSubscription(userId, endpoint);
    }
  }
}
