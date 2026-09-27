import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  async sendNotification(userId: string, payload: Record<string, unknown>) {
    const user = await this.usersService.findByIdWithSecrets(userId);
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return;
    }

    const deadSubscriptions: string[] = [];

    const promises = user.pushSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as webpush.PushSubscription, JSON.stringify(payload));
      } catch (error) {
        if (error instanceof webpush.WebPushError) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            // Subscription has expired or is no longer valid
            deadSubscriptions.push(sub.endpoint);
          } else {
            this.logger.error(`Failed to send push notification to ${userId}: ${error.message}`);
          }
        } else if (error instanceof Error) {
          this.logger.error(`Failed to send push notification to ${userId}: ${error.message}`);
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
