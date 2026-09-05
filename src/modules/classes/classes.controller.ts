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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateStudentDto } from '../students/dto/create-student.dto';
import { ClassesService } from './classes.service';
import {
  CloudinaryService,
  type UploadImageFile,
} from '../cloudinary/cloudinary.service';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateFixedScheduleDto } from './dto/create-fixed-schedule.dto';
import { CreateTemporaryScheduleDto } from './dto/create-temporary-schedule.dto';
import { EnrollExistingStudentDto } from './dto/enroll-existing-student.dto';
import { QueryClassesDto } from './dto/query-classes.dto';
import { SaveClassSessionContentDto } from './dto/save-class-session-content.dto';
import { TakeAttendanceBatchDto } from './dto/take-attendance-batch.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UpdateTemporaryScheduleDto } from './dto/update-temporary-schedule.dto';
import { TakeAttendanceDto } from './dto/take-attendance.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { TakeExamScoresBatchDto } from './dto/take-exam-scores-batch.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: JwtUser, @Query() query: QueryClassesDto) {
    return this.classesService.findAll(user.userId, query);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateClassDto) {
    return this.classesService.create(user.userId, dto);
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadClassImage(@UploadedFile() file?: UploadImageFile) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh lớp học.');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new UnsupportedMediaTypeException('File tải lên phải là hình ảnh.');
    }

    return this.cloudinaryService.uploadClassImage(file);
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

  @Get(':classId/attendance')
  getAttendance(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.classesService.getAttendance(
      user.userId,
      classId,
      date,
      startTime,
      endTime,
    );
  }

  @Get(':id/attendance-sheet')
  getAttendanceSheet(
    @CurrentUser() user: JwtUser,
    @Param('id') classId: string,
  ) {
    return this.classesService.getAttendanceSheet(user.userId, classId);
  }

  @Post(':id/attendance-batch')
  takeAttendanceBatch(
    @CurrentUser() user: JwtUser,
    @Param('id') classId: string,
    @Body() dto: TakeAttendanceBatchDto,
  ) {
    return this.classesService.takeAttendanceBatch(user.userId, classId, dto);
  }

  @Get(':classId/attendance-overview')
  getAttendanceOverview(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
  ) {
    return this.classesService.getAttendanceOverview(user.userId, classId);
  }

  @Post(':classId/attendance')
  takeAttendance(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Body() dto: TakeAttendanceDto,
  ) {
    return this.classesService.takeAttendance(user.userId, classId, dto);
  }

  // --- Exam Management ---

  @Get(':id/exam-sheet')
  getExamSheet(@CurrentUser() user: JwtUser, @Param('id') classId: string) {
    return this.classesService.getExamSheet(user.userId, classId);
  }

  @Post(':id/exams')
  createExam(
    @CurrentUser() user: JwtUser,
    @Param('id') classId: string,
    @Body() dto: CreateExamDto,
  ) {
    return this.classesService.createExam(user.userId, classId, dto);
  }

  @Patch(':id/exams/:examId')
  updateExam(
    @CurrentUser() user: JwtUser,
    @Param('id') classId: string,
    @Param('examId') examId: string,
    @Body() dto: UpdateExamDto,
  ) {
    return this.classesService.updateExam(user.userId, classId, examId, dto);
  }

  @Delete(':id/exams/:examId')
  deleteExam(
    @CurrentUser() user: JwtUser,
    @Param('id') classId: string,
    @Param('examId') examId: string,
  ) {
    return this.classesService.deleteExam(user.userId, classId, examId);
  }

  @Post(':id/exams/file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadExamFile(@UploadedFile() file?: UploadImageFile) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file đề kiểm tra.');
    }
    return this.cloudinaryService.uploadExamFile(file);
  }

  @Post(':id/exam-scores')
  takeExamScoresBatch(
    @CurrentUser() user: JwtUser,
    @Param('id') classId: string,
    @Body() dto: TakeExamScoresBatchDto,
  ) {
    return this.classesService.takeExamScoresBatch(user.userId, classId, dto);
  }

  @Post(':id/exam-scores/evidence')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadExamEvidenceImage(@UploadedFile() file?: UploadImageFile) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh minh chứng.');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new UnsupportedMediaTypeException('File tải lên phải là hình ảnh.');
    }
    return this.cloudinaryService.uploadExamEvidenceImage(file);
  }
}
