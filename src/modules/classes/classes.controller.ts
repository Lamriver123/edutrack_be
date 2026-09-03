import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateStudentDto } from '../students/dto/create-student.dto';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateFixedScheduleDto } from './dto/create-fixed-schedule.dto';
import { CreateTemporaryScheduleDto } from './dto/create-temporary-schedule.dto';
import { EnrollExistingStudentDto } from './dto/enroll-existing-student.dto';
import { QueryClassesDto } from './dto/query-classes.dto';
import { SaveClassSessionContentDto } from './dto/save-class-session-content.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UpdateTemporaryScheduleDto } from './dto/update-temporary-schedule.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  findAll(@CurrentUser() user: JwtUser, @Query() query: QueryClassesDto) {
    return this.classesService.findAll(user.userId, query);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateClassDto) {
    return this.classesService.create(user.userId, dto);
  }

  @Get(':classId')
  findDetail(@CurrentUser() user: JwtUser, @Param('classId') classId: string) {
    return this.classesService.findDetail(user.userId, classId);
  }

  @Patch(':classId')
  updateClass(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classesService.updateClass(user.userId, classId, dto);
  }

  @Delete(':classId')
  archiveClass(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
  ) {
    return this.classesService.archiveClass(user.userId, classId);
  }

  @Get(':classId/schedules')
  getSchedules(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
  ) {
    return this.classesService.getSchedules(user.userId, classId);
  }

  @Post(':classId/schedules/fixed')
  saveFixedSchedule(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Body() dto: CreateFixedScheduleDto,
  ) {
    return this.classesService.saveFixedSchedule(user.userId, classId, dto);
  }

  @Post(':classId/schedules/temporary')
  createTemporarySchedule(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Body() dto: CreateTemporaryScheduleDto,
  ) {
    return this.classesService.createTemporarySchedule(
      user.userId,
      classId,
      dto,
    );
  }

  @Patch(':classId/schedules/temporary/:scheduleId')
  updateTemporarySchedule(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateTemporaryScheduleDto,
  ) {
    return this.classesService.updateTemporarySchedule(
      user.userId,
      classId,
      scheduleId,
      dto,
    );
  }

  @Delete(':classId/schedules/temporary/:scheduleId')
  revokeTemporarySchedule(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.classesService.revokeTemporarySchedule(
      user.userId,
      classId,
      scheduleId,
    );
  }

  @Post(':classId/schedules/session-content')
  saveSessionContent(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Body() dto: SaveClassSessionContentDto,
  ) {
    return this.classesService.saveSessionContent(user.userId, classId, dto);
  }

  @Post(':classId/students')
  enrollExistingStudent(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Body() dto: EnrollExistingStudentDto,
  ) {
    return this.classesService.enrollExistingStudent(
      user.userId,
      classId,
      dto.studentId,
    );
  }

  @Post(':classId/students/new')
  createStudentAndEnroll(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Body() dto: CreateStudentDto,
  ) {
    return this.classesService.createStudentAndEnroll(
      user.userId,
      classId,
      dto,
    );
  }

  @Delete(':classId/students/:studentId')
  removeStudentFromClass(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.classesService.removeStudentFromClass(
      user.userId,
      classId,
      studentId,
    );
  }
}
