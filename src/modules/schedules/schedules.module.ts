import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolManagementModule } from '../school-management/school-management.module';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { ScheduleConflictsService } from './schedule-conflicts.service';
import { SchedulesCronService } from './schedules-cron.service';
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
    ]),
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService, ScheduleConflictsService, SchedulesCronService],
  exports: [SchedulesService, ScheduleConflictsService],
})
export class SchedulesModule {}
