import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolManagementModule } from '../school-management/school-management.module';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { ScheduleConflictsService } from './schedule-conflicts.service';
import { SchedulesCronService } from './schedules-cron.service';
import { PushReminderStore } from './push-reminder-store.service';
import {
  PushReminder,
  PushReminderSchema,
} from './schemas/push-reminder.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  ClassSession,
  ClassSessionSchema,
} from '../school-management/schemas/class-session.schema';

@Module({
  imports: [
    SchoolManagementModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ClassSession.name, schema: ClassSessionSchema },
      { name: PushReminder.name, schema: PushReminderSchema },
    ]),
  ],
  controllers: [SchedulesController],
  providers: [
    SchedulesService,
    ScheduleConflictsService,
    SchedulesCronService,
    PushReminderStore,
  ],
  exports: [SchedulesService, ScheduleConflictsService],
})
export class SchedulesModule {}
