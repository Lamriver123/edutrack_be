import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { EnrollmentStatus } from '../enums';
import { Class } from './class.schema';
import { Student } from './student.schema';

@Schema({
  collection: 'class_enrollments',
  timestamps: true,
  versionKey: false,
})
export class ClassEnrollment {
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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Student.name,
    required: true,
    index: true,
  })
  studentId: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  joinedAt: Date;

  @Prop({ type: Date, default: null })
  leftAt?: Date | null;

  @Prop({
    enum: EnrollmentStatus,
    default: EnrollmentStatus.Active,
    index: true,
  })
  status: EnrollmentStatus;

  @Prop({ trim: true })
  note?: string;
}

export type ClassEnrollmentDocument = HydratedDocument<ClassEnrollment>;
export const ClassEnrollmentSchema =
  SchemaFactory.createForClass(ClassEnrollment);

ClassEnrollmentSchema.index({ teacherId: 1, classId: 1, status: 1 });
ClassEnrollmentSchema.index({ teacherId: 1, studentId: 1, status: 1 });
ClassEnrollmentSchema.index({ teacherId: 1, classId: 1, studentId: 1 });
ClassEnrollmentSchema.index(
  { teacherId: 1, classId: 1, studentId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: EnrollmentStatus.Active },
  },
);
