import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryTeacherWeekScheduleDto } from './dto/query-teacher-week-schedule.dto';
import { SchedulesService } from './schedules.service';
import { ScheduleConflictsService } from './schedule-conflicts.service';
import {
  CheckFixedScheduleDto,
  CheckTemporaryScheduleDto,
  ScheduleAvailabilityDto,
} from './dto/check-schedule.dto';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly conflicts: ScheduleConflictsService,
  ) {}

  @Post('conflicts/check-fixed')
  checkFixed(@CurrentUser() user: JwtUser, @Body() dto: CheckFixedScheduleDto) {
    return this.conflicts.checkFixed(user.userId, dto.classId, dto);
  }

  @Post('conflicts/check-temporary')
  checkTemporary(
    @CurrentUser() user: JwtUser,
    @Body() dto: CheckTemporaryScheduleDto,
  ) {
    return this.conflicts.checkTemporary(
      user.userId,
      dto.classId,
      dto,
      dto.ignoreOverrideId,
    );
  }

  @Post('availability')
  availability(
    @CurrentUser() user: JwtUser,
    @Body() dto: ScheduleAvailabilityDto,
  ) {
    return this.conflicts.availability(user.userId, dto);
  }

  @Get('source-slots')
  sourceSlots(
    @CurrentUser() user: JwtUser,
    @Query('classId') classId: string,
    @Query('date') date: string,
    @Query('ignoreOverrideId') ignoreId?: string,
  ) {
    return this.conflicts.sourceSlots(user.userId, classId, date, ignoreId);
  }

  @Get('week')
  getTeacherWeekSchedule(
    @CurrentUser() user: JwtUser,
    @Query() query: QueryTeacherWeekScheduleDto,
  ) {
    return this.schedulesService.getTeacherWeekSchedule(user.userId, query);
  }
}
