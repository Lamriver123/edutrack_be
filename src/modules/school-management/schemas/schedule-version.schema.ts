import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { DAY_OF_WEEK_VALUES, DayOfWeek } from '../enums';
import { Class } from './class.schema';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

@Schema({
  _id: false,
  versionKey: false,
})
export class ScheduleSlot {
  @Prop({
    required: true,
    enum: DAY_OF_WEEK_VALUES,
  })
  dayOfWeek: DayOfWeek;

  @Prop({ required: true, match: timePattern })
  startTime: string;

  @Prop({ required: true, match: timePattern })
  endTime: string;
}

export const ScheduleSlotSchema = SchemaFactory.createForClass(ScheduleSlot);

@Schema({
  collection: 'schedule_versions',
  timestamps: true,
  versionKey: false,
})
export class ScheduleVersion {
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

  @Prop({ required: true, min: 1 })
  version: number;

  @Prop({ type: Date, required: true })
  effectiveFrom: Date;

  @Prop({ type: Date, default: null })
  effectiveTo?: Date | null;

  @Prop({ type: [ScheduleSlotSchema], default: [] })
  schedules: ScheduleSlot[];

  @Prop({ enum: ['utc', 'vietnam'], default: 'utc' })
  timeStorage: 'utc' | 'vietnam';
}

export type ScheduleVersionDocument = HydratedDocument<ScheduleVersion>;
export const ScheduleVersionSchema =
  SchemaFactory.createForClass(ScheduleVersion);

ScheduleVersionSchema.index(
  { teacherId: 1, classId: 1, version: 1 },
  { unique: true },
);
ScheduleVersionSchema.index({ teacherId: 1, classId: 1, effectiveFrom: -1 });
ScheduleVersionSchema.index(
  { teacherId: 1, classId: 1, effectiveTo: 1 },
  {
    unique: true,
    partialFilterExpression: { effectiveTo: null },
  },
);
