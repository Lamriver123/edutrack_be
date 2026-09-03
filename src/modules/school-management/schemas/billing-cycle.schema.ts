import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { BillingStatus } from '../enums';
import { Student } from './student.schema';

@Schema({
  collection: 'billing_cycles',
  timestamps: true,
  versionKey: false,
})
export class BillingCycle {
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
    required: true,
    index: true,
  })
  studentId: mongoose.Types.ObjectId;

  @Prop({ required: true, min: 1 })
  cycleNumber: number;

  @Prop({ required: true, default: 10, min: 1 })
  targetSessionCount: number;

  @Prop({ required: true, default: 0, min: 0 })
  sessionCount: number;

  @Prop({ required: true, default: 8, min: 1 })
  warningSessionCount: number;

  @Prop({
    enum: BillingStatus,
    default: BillingStatus.Open,
    index: true,
  })
  status: BillingStatus;

  @Prop({ type: Date, required: true, default: Date.now })
  startedAt: Date;

  @Prop({ type: Date })
  readyAt?: Date;

  @Prop({ type: Date })
  closedAt?: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt',
  })
  receiptId?: mongoose.Types.ObjectId;
}

export type BillingCycleDocument = HydratedDocument<BillingCycle>;
export const BillingCycleSchema = SchemaFactory.createForClass(BillingCycle);

BillingCycleSchema.index(
  { teacherId: 1, studentId: 1, cycleNumber: 1 },
  { unique: true },
);
BillingCycleSchema.index({ teacherId: 1, studentId: 1, status: 1 });
BillingCycleSchema.index({ teacherId: 1, status: 1, updatedAt: -1 });
