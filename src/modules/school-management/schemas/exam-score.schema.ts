import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Class } from './class.schema';
import { Exam } from './exam.schema';
import { Student } from './student.schema';

@Schema({
  collection: 'exam_scores',
  timestamps: true,
  versionKey: false,
})
export class ExamScore {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  teacherId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Exam.name,
    required: true,
    index: true,
  })
  examId: mongoose.Types.ObjectId;

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

  @Prop({ required: true, min: 0 })
  score: number;

  @Prop({ trim: true })
  note?: string;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export type ExamScoreDocument = HydratedDocument<ExamScore>;
export const ExamScoreSchema = SchemaFactory.createForClass(ExamScore);

ExamScoreSchema.index({ examId: 1, studentId: 1 }, { unique: true });
ExamScoreSchema.index({ teacherId: 1, studentId: 1, createdAt: -1 });
ExamScoreSchema.index({ teacherId: 1, examId: 1 });
ExamScoreSchema.index({ teacherId: 1, classId: 1, studentId: 1 });
