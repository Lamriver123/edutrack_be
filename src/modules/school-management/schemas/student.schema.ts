import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Gender, StudentStatus } from '../enums';

@Schema({
  _id: false,
  versionKey: false,
})
export class StudentParent {
  @Prop({ trim: true })
  fullName?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  relation?: string;

  @Prop({ trim: true })
  note?: string;
}

export const StudentParentSchema = SchemaFactory.createForClass(StudentParent);

@Schema({
  collection: 'students',
  timestamps: true,
  versionKey: false,
})
export class Student {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  teacherId: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  studentCode: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ trim: true })
  avatarUrl?: string;

  @Prop({ required: true, trim: true, select: false })
  searchText: string;

  @Prop({ type: Date })
  dateOfBirth?: Date;

  @Prop({ enum: Gender })
  gender?: Gender;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ type: StudentParentSchema })
  parent?: StudentParent;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  note?: string;

  @Prop({
    enum: StudentStatus,
    default: StudentStatus.Active,
    index: true,
  })
  status: StudentStatus;
}

export type StudentDocument = HydratedDocument<Student>;
export const StudentSchema = SchemaFactory.createForClass(Student);

StudentSchema.index({ teacherId: 1, studentCode: 1 }, { unique: true });
StudentSchema.index({ teacherId: 1, status: 1 });
StudentSchema.index({ teacherId: 1, fullName: 1 });
StudentSchema.index({ teacherId: 1, searchText: 1 });
