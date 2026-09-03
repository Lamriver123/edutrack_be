import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { ScheduleOverrideAction } from '../enums';
import { Class } from './class.schema';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

@Schema({
  collection: 'schedule_overrides',
  timestamps: true,
  versionKey: false,
})
export class ScheduleOverride {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  teacherId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
    required: true,
    index: true,
  })
  classId: mongoose.Types.ObjectId;

  @Prop({ type: Date })
  originalDate?: Date;

  @Prop({
    enum: ScheduleOverrideAction,
    required: true,
    index: true,
  })
  action: ScheduleOverrideAction;

  @Prop({ type: Date })
  newDate?: Date;

  @Prop({ match: timePattern })
  startTime?: string;

  @Prop({ match: timePattern })
  endTime?: string;

  @Prop({ trim: true })
  reason?: string;

  @Prop({ enum: ['utc', 'vietnam'], default: 'utc' })
  timeStorage: 'utc' | 'vietnam';
}

export type ScheduleOverrideDocument = HydratedDocument<ScheduleOverride>;
export const ScheduleOverrideSchema =
  SchemaFactory.createForClass(ScheduleOverride);

ScheduleOverrideSchema.index({ teacherId: 1, classId: 1, originalDate: 1 });
ScheduleOverrideSchema.index({ teacherId: 1, classId: 1, newDate: 1 });
ScheduleOverrideSchema.index({ teacherId: 1, action: 1, createdAt: -1 });
