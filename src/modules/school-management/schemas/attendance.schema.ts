import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { AttendanceStatus, AttendanceType } from '../enums';
import { Class } from './class.schema';
import { ClassSession } from './class-session.schema';
import { Student } from './student.schema';

@Schema({
  collection: 'attendances',
  timestamps: true,
  versionKey: false,
})
export class Attendance {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  teacherId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ClassSession.name,
    required: true,
    index: true,
  })
  sessionId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
    required: true,
    index: true,
  })
  classId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Student.name,
    required: true,
    index: true,
  })
  studentId: mongoose.Types.ObjectId;

  @Prop({
    enum: AttendanceStatus,
    required: true,
    index: true,
  })
  status: AttendanceStatus;

  @Prop({
    enum: AttendanceType,
    default: AttendanceType.Regular,
    index: true,
  })
  attendanceType: AttendanceType;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
  })
  homeClassId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ClassSession.name,
  })
  makeupForSessionId?: mongoose.Types.ObjectId;

  @Prop({ type: String, maxlength: 500, default: '' })
  note: string;

  @Prop({ type: Boolean, default: false })
  isBilled: boolean;
}

export type AttendanceDocument = HydratedDocument<Attendance>;
export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
AttendanceSchema.index({ teacherId: 1, sessionId: 1, status: 1 });
AttendanceSchema.index({ teacherId: 1, studentId: 1, createdAt: -1 });
AttendanceSchema.index(
  { teacherId: 1, studentId: 1, makeupForSessionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      attendanceType: AttendanceType.Makeup,
      makeupForSessionId: { $exists: true },
    },
  },
);
