import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Attendance,
  AttendanceSchema,
  BillingCycle,
  BillingCycleSchema,
  Class,
  ClassEnrollment,
  ClassEnrollmentSchema,
  ClassSchema,
  ClassSession,
  ClassSessionSchema,
  Exam,
  ExamSchema,
  ExamScore,
  ExamScoreSchema,
  Notification,
  NotificationSchema,
  Receipt,
  ReceiptSchema,
  ScheduleOverride,
  ScheduleOverrideSchema,
  ScheduleVersion,
  ScheduleVersionSchema,
  Student,
  StudentSchema,
  TuitionEntry,
  TuitionEntrySchema,
} from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Class.name, schema: ClassSchema },
      { name: ClassEnrollment.name, schema: ClassEnrollmentSchema },
      { name: ScheduleVersion.name, schema: ScheduleVersionSchema },
      { name: ScheduleOverride.name, schema: ScheduleOverrideSchema },
      { name: ClassSession.name, schema: ClassSessionSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: ExamScore.name, schema: ExamScoreSchema },
      { name: TuitionEntry.name, schema: TuitionEntrySchema },
      { name: BillingCycle.name, schema: BillingCycleSchema },
      { name: Receipt.name, schema: ReceiptSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SchoolManagementModule {}
