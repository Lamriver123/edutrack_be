import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CloudinaryService,
  type UploadImageFile,
} from '../cloudinary/cloudinary.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { DeleteStudentDto } from './dto/delete-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: JwtUser, @Query() query: QueryStudentsDto) {
    return this.studentsService.findAll(user.userId, query);
  }

  @Post()
  async create(@CurrentUser() user: JwtUser, @Body() dto: CreateStudentDto) {
    const student = await this.studentsService.create(user.userId, dto);

    return this.studentsService.toStudentResponse(student);
  }

  @Patch(':studentId')
  async update(
    @CurrentUser() user: JwtUser,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateStudentDto,
  ) {
    const student = await this.studentsService.update(
      user.userId,
      studentId,
      dto,
    );

    return this.studentsService.toStudentResponse(student);
  }

  @Delete(':studentId')
  delete(
    @CurrentUser() user: JwtUser,
    @Param('studentId') studentId: string,
    @Query() query: DeleteStudentDto,
  ) {
    return this.studentsService.delete(user.userId, studentId, query.mode);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadAvatar(@UploadedFile() file?: UploadImageFile) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh học sinh.');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new UnsupportedMediaTypeException('File tải lên phải là hình ảnh.');
    }

    return this.cloudinaryService.uploadStudentAvatar(file);
  }
}
