import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Deterministic _id also arbitrates concurrent workers through its unique index.
@Schema({ collection: 'push_reminders', versionKey: false })
export class PushReminder {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  leaseToken: string;

  @Prop({ type: Date, required: true })
  leaseUntil: Date;

  @Prop({ type: Date })
  sentAt?: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export type PushReminderDocument = HydratedDocument<PushReminder>;
export const PushReminderSchema = SchemaFactory.createForClass(PushReminder);
PushReminderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
