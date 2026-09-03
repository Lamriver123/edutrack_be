import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryTeacherWeekScheduleDto } from './dto/query-teacher-week-schedule.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('week')
  getTeacherWeekSchedule(
    @CurrentUser() user: JwtUser,
    @Query() query: QueryTeacherWeekScheduleDto,
  ) {
    return this.schedulesService.getTeacherWeekSchedule(user.userId, query);
  }
}
