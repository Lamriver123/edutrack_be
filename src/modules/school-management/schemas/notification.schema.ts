import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { NotificationType } from '../enums';
import { BillingCycle } from './billing-cycle.schema';
import { Student } from './student.schema';

@Schema({
  collection: 'notifications',
  timestamps: true,
  versionKey: false,
})
export class Notification {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  teacherId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Student.name,
  })
  studentId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: BillingCycle.name,
  })
  billingCycleId?: mongoose.Types.ObjectId;

  @Prop({
    enum: NotificationType,
    required: true,
    index: true,
  })
  type: NotificationType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ required: true, trim: true })
  dedupKey: string;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ type: Date })
  readAt?: Date;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ teacherId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ teacherId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ teacherId: 1, dedupKey: 1 }, { unique: true });
