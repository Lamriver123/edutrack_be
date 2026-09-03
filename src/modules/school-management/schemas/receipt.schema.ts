import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { PaymentStatus, ReceiptReason, TuitionType } from '../enums';
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
export class ReceiptSessionSnapshot {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: TuitionEntry.name,
    required: true,
  })
  tuitionEntryId: mongoose.Types.ObjectId;

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

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ trim: true })
  startTime?: string;

  @Prop({ trim: true })
  endTime?: string;

  @Prop({ required: true, trim: true })
  className: string;

  @Prop({ trim: true })
  topic?: string;

  @Prop({ trim: true })
  content?: string;

  @Prop({ enum: TuitionType, required: true })
  tuitionType: TuitionType;

  @Prop({ required: true, validate: integerMoneyValidator })
  amount: number;
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

  @Prop({ required: true, trim: true })
  receiptNumber: string;

  @Prop({ type: Date, required: true, default: Date.now, index: true })
  issuedAt: Date;

  @Prop({
    enum: ReceiptReason,
    required: true,
  })
  reason: ReceiptReason;

  @Prop({ type: ReceiptStudentSnapshotSchema, required: true })
  studentSnapshot: ReceiptStudentSnapshot;

  @Prop({ type: [ReceiptSessionSnapshotSchema], default: [] })
  sessions: ReceiptSessionSnapshot[];

  @Prop({ type: [ReceiptExamSnapshotSchema], default: [] })
  exams: ReceiptExamSnapshot[];

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
}

export type ReceiptDocument = HydratedDocument<Receipt>;
export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

ReceiptSchema.index({ teacherId: 1, receiptNumber: 1 }, { unique: true });
ReceiptSchema.index({ teacherId: 1, studentId: 1, issuedAt: -1 });
ReceiptSchema.index({ teacherId: 1, issuedAt: -1 });
ReceiptSchema.index({ teacherId: 1, paymentStatus: 1, issuedAt: -1 });
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
