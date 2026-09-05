import { Module } from '@nestjs/common';
import { SchoolManagementModule } from '../school-management/school-management.module';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { ScheduleConflictsService } from './schedule-conflicts.service';

@Module({
  imports: [SchoolManagementModule],
  controllers: [SchedulesController],
  providers: [SchedulesService, ScheduleConflictsService],
  exports: [SchedulesService, ScheduleConflictsService],
})
export class SchedulesModule {}
