import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { TuitionStatus, TuitionType } from '../enums';
import { Attendance } from './attendance.schema';
import { BillingCycle } from './billing-cycle.schema';
import { Class } from './class.schema';
import { ClassSession } from './class-session.schema';
import { Student } from './student.schema';

const integerMoneyValidator = {
  validator: Number.isInteger,
  message: 'Money amount must be stored as an integer VND value',
};

@Schema({
  collection: 'tuition_entries',
  timestamps: true,
  versionKey: false,
})
export class TuitionEntry {
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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
    required: true,
    index: true,
  })
  classId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
    index: true,
  })
  attendedClassId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
    index: true,
  })
  billingClassId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
    index: true,
  })
  makeupForClassId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ClassSession.name,
    required: true,
    index: true,
  })
  sessionId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Attendance.name,
  })
  attendanceId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: BillingCycle.name,
  })
  billingCycleId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt',
  })
  receiptId?: mongoose.Types.ObjectId;

  @Prop({
    enum: TuitionType,
    required: true,
    index: true,
  })
  type: TuitionType;

  @Prop({ required: true, validate: integerMoneyValidator })
  amount: number;

  @Prop({ required: true, trim: true })
  classNameSnapshot: string;

  @Prop({ type: Date, required: true, index: true })
  sessionDate: Date;

  @Prop({ trim: true })
  sessionStartTime?: string;

  @Prop({ trim: true })
  sessionEndTime?: string;

  @Prop({ trim: true })
  topicSnapshot?: string;

  @Prop({ trim: true })
  contentSnapshot?: string;

  @Prop({
    enum: TuitionStatus,
    default: TuitionStatus.Unbilled,
    index: true,
  })
  status: TuitionStatus;

  @Prop({ trim: true })
  note?: string;
}

export type TuitionEntryDocument = HydratedDocument<TuitionEntry>;
export const TuitionEntrySchema = SchemaFactory.createForClass(TuitionEntry);

TuitionEntrySchema.index(
  { attendanceId: 1 },
  {
    unique: true,
    partialFilterExpression: { attendanceId: { $exists: true } },
  },
);
TuitionEntrySchema.index({
  teacherId: 1,
  studentId: 1,
  status: 1,
  createdAt: 1,
});
TuitionEntrySchema.index({ teacherId: 1, billingCycleId: 1 });
TuitionEntrySchema.index({ teacherId: 1, receiptId: 1 });
TuitionEntrySchema.index({ teacherId: 1, studentId: 1, sessionDate: 1 });
TuitionEntrySchema.index({ teacherId: 1, status: 1, sessionDate: 1 });
TuitionEntrySchema.index({
  teacherId: 1,
  studentId: 1,
  billingClassId: 1,
  status: 1,
  sessionDate: 1,
});
