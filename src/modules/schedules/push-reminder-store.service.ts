import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { Model } from 'mongoose';
import {
  PushReminder,
  PushReminderDocument,
} from './schemas/push-reminder.schema';

@Injectable()
export class PushReminderStore {
  constructor(
    @InjectModel(PushReminder.name)
    private readonly reminderModel: Model<PushReminderDocument>,
  ) {}

  async claim(key: string, now: Date): Promise<string | null> {
    const token = randomUUID();
    try {
      const reminder = await this.reminderModel
        .findOneAndUpdate(
          { _id: key, sentAt: null, leaseUntil: { $lte: now } },
          {
            $set: {
              leaseToken: token,
              leaseUntil: new Date(now.getTime() + 120_000),
            },
            $setOnInsert: {
              expiresAt: new Date(now.getTime() + 7 * 86_400_000),
            },
          },
          { upsert: true, returnDocument: 'after' },
        )
        .exec();
      return reminder?.leaseToken === token ? token : null;
    } catch (error: unknown) {
      // A sent/leased _id cannot match the filter or be inserted again.
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        return null;
      }
      throw error;
    }
  }

  async finish(key: string, token: string, sent: boolean) {
    await this.reminderModel
      .updateOne(
        { _id: key, leaseToken: token, sentAt: null },
        {
          $set: sent
            ? { sentAt: new Date(), leaseUntil: new Date(0) }
            : { leaseUntil: new Date(0) },
        },
      )
      .exec();
  }
}
