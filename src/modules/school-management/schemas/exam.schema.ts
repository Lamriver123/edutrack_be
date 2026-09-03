import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Class } from './class.schema';
import { ClassSession } from './class-session.schema';

@Schema({
  collection: 'exams',
  timestamps: true,
  versionKey: false,
})
export class Exam {
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
    ref: ClassSession.name,
  })
  sessionId?: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: Date, required: true, index: true })
  testDate: Date;

  @Prop({ required: true, min: 0 })
  maxScore: number;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export type ExamDocument = HydratedDocument<Exam>;
export const ExamSchema = SchemaFactory.createForClass(Exam);

ExamSchema.index({ teacherId: 1, classId: 1, testDate: -1 });
ExamSchema.index({ teacherId: 1, testDate: -1 });
ExamSchema.index({ teacherId: 1, deletedAt: 1, testDate: -1 });
