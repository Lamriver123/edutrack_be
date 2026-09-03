import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { ScheduleType, SessionStatus } from '../enums';
import { Class } from './class.schema';
import { ScheduleOverride } from './schedule-override.schema';
import { ScheduleVersion } from './schedule-version.schema';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

@Schema({
  collection: 'class_sessions',
  timestamps: true,
  versionKey: false,
})
export class ClassSession {
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

  @Prop({ min: 1 })
  sessionNumber?: number;

  @Prop({ type: Date, required: true, index: true })
  date: Date;

  @Prop({ required: true, match: timePattern })
  startTime: string;

  @Prop({ required: true, match: timePattern })
  endTime: string;

  @Prop({ enum: ['utc', 'vietnam'], default: 'utc' })
  timeStorage: 'utc' | 'vietnam';

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ScheduleVersion.name,
  })
  scheduleVersionId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ScheduleOverride.name,
  })
  scheduleOverrideId?: mongoose.Types.ObjectId;

  @Prop({
    enum: ScheduleType,
    required: true,
    index: true,
  })
  scheduleType: ScheduleType;

  @Prop({ trim: true })
  topic?: string;

  @Prop({ trim: true })
  content?: string;

  @Prop({
    enum: SessionStatus,
    default: SessionStatus.Scheduled,
    index: true,
  })
  status: SessionStatus;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ trim: true })
  sourceKey?: string;
}

export type ClassSessionDocument = HydratedDocument<ClassSession>;
export const ClassSessionSchema = SchemaFactory.createForClass(ClassSession);

ClassSessionSchema.index({ teacherId: 1, classId: 1, date: 1 });
ClassSessionSchema.index({ teacherId: 1, date: 1, status: 1 });
ClassSessionSchema.index({ teacherId: 1, classId: 1, sessionNumber: 1 });
ClassSessionSchema.index(
  { teacherId: 1, classId: 1, sourceKey: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceKey: { $exists: true } },
  },
);
