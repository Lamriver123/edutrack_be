import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import {
  AttendanceStatus,
  PaymentStatus,
  ReceiptPdfStatus,
  ReceiptReason,
  ReceiptScope,
  ScheduleType,
  TuitionType,
} from '../enums';
import { BillingCycle } from './billing-cycle.schema';
import { Class } from './class.schema';
import { ClassSession } from './class-session.schema';
import { Exam } from './exam.schema';
import { Student } from './student.schema';
import { TuitionEntry } from './tuition-entry.schema';

const integerMoneyValidator = {
  validator: Number.isInteger,
  message: 'Money amount must be stored as an integer VND value',
};

@Schema({
  _id: false,
  versionKey: false,
})
export class ReceiptStudentSnapshot {
  @Prop({ trim: true })
  studentCode?: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  parentName?: string;

  @Prop({ trim: true })
  parentPhone?: string;
}

export const ReceiptStudentSnapshotSchema = SchemaFactory.createForClass(
  ReceiptStudentSnapshot,
);

@Schema({
  _id: false,
  versionKey: false,
})
export class ReceiptTeacherSnapshot {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  email: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  avatarUrl?: string;

  @Prop({ trim: true })
  bankAccountName?: string;

  @Prop({ trim: true })
  bankAccountNumber?: string;

  @Prop({ default: false })
  hasPaymentQr: boolean;
}

export const ReceiptTeacherSnapshotSchema = SchemaFactory.createForClass(
  ReceiptTeacherSnapshot,
);

@Schema({
  _id: false,
  versionKey: false,
})
export class ReceiptClassSnapshot {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
  })
  classId?: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  className: string;

  @Prop({ trim: true })
  colorHex?: string;

  @Prop({ required: true, validate: integerMoneyValidator })
  regularPrice: number;

  @Prop({ required: true, validate: integerMoneyValidator })
  makeupPrice: number;
}

export const ReceiptClassSnapshotSchema =
  SchemaFactory.createForClass(ReceiptClassSnapshot);

@Schema({
  _id: false,
  versionKey: false,
})
export class ReceiptSessionSnapshot {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: TuitionEntry.name,
    required: true,
  })
  tuitionEntryId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
  })
  attendanceId?: mongoose.Types.ObjectId;

  @Prop({ required: true, min: 1 })
  sequence: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ClassSession.name,
  })
  sessionId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
  })
  classId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
  })
  attendedClassId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
  })
  billingClassId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
  })
  makeupForClassId?: mongoose.Types.ObjectId;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ trim: true })
  startTime?: string;

  @Prop({ trim: true })
  endTime?: string;

  @Prop({ required: true, trim: true })
  className: string;

  @Prop({ trim: true })
  attendedClassName?: string;

  @Prop({ trim: true })
  billingClassName?: string;

  @Prop({ trim: true })
  makeupForClassName?: string;

  @Prop({ trim: true })
  classColorHex?: string;

  @Prop({ trim: true })
  topic?: string;

  @Prop({ trim: true })
  content?: string;

  @Prop({
    enum: AttendanceStatus,
    required: true,
  })
  attendanceStatus: AttendanceStatus;

  @Prop({
    enum: ScheduleType,
  })
  scheduleType?: ScheduleType;

  @Prop({ enum: TuitionType, required: true })
  tuitionType: TuitionType;

  @Prop({ required: true, validate: integerMoneyValidator })
  unitPrice: number;

  @Prop({ required: true, validate: integerMoneyValidator })
  amount: number;

  @Prop({ trim: true })
  note?: string;
}

export const ReceiptSessionSnapshotSchema = SchemaFactory.createForClass(
  ReceiptSessionSnapshot,
);

@Schema({
  _id: false,
  versionKey: false,
})
export class ReceiptExamSnapshot {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Exam.name,
  })
  examId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamScore',
  })
  examScoreId?: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
  })
  classId?: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  className: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ required: true, min: 0 })
  score: number;

  @Prop({ required: true, min: 0 })
  maxScore: number;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  note?: string;

  @Prop({ type: [String], default: [] })
  evidenceImages?: string[];

  @Prop({ trim: true })
  teacherRemark?: string;
}

export const ReceiptExamSnapshotSchema =
  SchemaFactory.createForClass(ReceiptExamSnapshot);

@Schema({
  collection: 'receipts',
  timestamps: true,
  versionKey: false,
})
export class Receipt {
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
    ref: BillingCycle.name,
    required: true,
    index: true,
  })
  billingCycleId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
    required: true,
    index: true,
  })
  classId: mongoose.Types.ObjectId;

  @Prop({
    enum: ReceiptScope,
    default: ReceiptScope.Class,
    index: true,
  })
  scopeType: ReceiptScope;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Class.name }],
    default: [],
  })
  classIds: mongoose.Types.ObjectId[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Class.name,
  })
  primaryClassId?: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  receiptNumber: string;

  @Prop({ type: Date, required: true, default: Date.now, index: true })
  issuedAt: Date;

  @Prop({ type: Date, required: true, index: true })
  periodStart: Date;

  @Prop({ type: Date, required: true, index: true })
  periodEnd: Date;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({
    enum: ReceiptReason,
    required: true,
  })
  reason: ReceiptReason;

  @Prop({ type: ReceiptTeacherSnapshotSchema, required: true })
  teacherSnapshot: ReceiptTeacherSnapshot;

  @Prop({ type: ReceiptClassSnapshotSchema, required: true })
  classSnapshot: ReceiptClassSnapshot;

  @Prop({ type: [ReceiptClassSnapshotSchema], default: [] })
  classSnapshots: ReceiptClassSnapshot[];

  @Prop({ type: ReceiptStudentSnapshotSchema, required: true })
  studentSnapshot: ReceiptStudentSnapshot;

  @Prop({ type: [ReceiptSessionSnapshotSchema], default: [] })
  sessions: ReceiptSessionSnapshot[];

  @Prop({ type: [ReceiptExamSnapshotSchema], default: [] })
  exams: ReceiptExamSnapshot[];

  @Prop({ required: true, min: 0 })
  lessonCount: number;

  @Prop({ required: true, validate: integerMoneyValidator })
  subtotal: number;

  @Prop({ default: 0, validate: integerMoneyValidator })
  discountAmount?: number;

  @Prop({ default: 0, validate: integerMoneyValidator })
  adjustmentAmount?: number;

  @Prop({ required: true, validate: integerMoneyValidator })
  totalAmount: number;

  @Prop({
    enum: PaymentStatus,
    default: PaymentStatus.Unpaid,
    index: true,
  })
  paymentStatus: PaymentStatus;

  @Prop({ default: 0, validate: integerMoneyValidator })
  paidAmount?: number;

  @Prop({ type: Date })
  paidAt?: Date;

  @Prop({ trim: true })
  note?: string;

  @Prop({ trim: true })
  teacherComment?: string;

  @Prop({ trim: true })
  strengthsComment?: string;

  @Prop({ trim: true })
  improvementsComment?: string;

  @Prop({ trim: true })
  generalComment?: string;

  @Prop({ trim: true })
  paymentNote?: string;

  @Prop({ trim: true })
  paymentProofUrl?: string;

  @Prop({ trim: true })
  paymentProofPublicId?: string;

  @Prop({ type: Date })
  paymentProofUploadedAt?: Date;

  @Prop({ default: 'v1' })
  htmlTemplateVersion: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  renderSnapshot?: Record<string, unknown>;

  @Prop({
    enum: ReceiptPdfStatus,
    default: ReceiptPdfStatus.Pending,
    index: true,
  })
  pdfStatus: ReceiptPdfStatus;

  @Prop({ trim: true })
  pdfUrl?: string;

  @Prop({ trim: true })
  pdfPublicId?: string;

  @Prop({ type: Date })
  pdfGeneratedAt?: Date;

  @Prop({ trim: true })
  pdfFailedReason?: string;
}

export type ReceiptDocument = HydratedDocument<Receipt>;
export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

ReceiptSchema.index({ teacherId: 1, receiptNumber: 1 }, { unique: true });
ReceiptSchema.index({ teacherId: 1, classId: 1, issuedAt: -1 });
ReceiptSchema.index({ teacherId: 1, classIds: 1, issuedAt: -1 });
ReceiptSchema.index({ teacherId: 1, studentId: 1, issuedAt: -1 });
ReceiptSchema.index({ teacherId: 1, scopeType: 1, issuedAt: -1 });
ReceiptSchema.index({ teacherId: 1, issuedAt: -1 });
ReceiptSchema.index({ teacherId: 1, paymentStatus: 1, issuedAt: -1 });
ReceiptSchema.index({ teacherId: 1, pdfStatus: 1, issuedAt: -1 });
ReceiptSchema.index(
  { teacherId: 1, billingCycleId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      paymentStatus: {
        $ne: PaymentStatus.Cancelled,
      },
    },
  },
);
