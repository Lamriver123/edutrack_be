import { Module } from '@nestjs/common';
import { SchoolManagementModule } from '../school-management/school-management.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [SchoolManagementModule, SchedulesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
