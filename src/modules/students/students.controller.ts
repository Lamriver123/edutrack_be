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
  Res,
  StreamableFile,
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
import { BulkDeleteStudentsDto } from './dto/bulk-delete-students.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { DeleteStudentDto } from './dto/delete-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService, type StudentImportFile } from './students.service';
import type { Response } from 'express';

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

  @Get('import-template')
  downloadImportTemplate(
    @Res({ passthrough: true }) response: Response,
  ): StreamableFile {
    const template = this.studentsService.getImportTemplate();

    response.setHeader('Content-Type', template.contentType);
    response.setHeader('Content-Length', template.content.length.toString());
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${template.fileName}"`,
    );
    response.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Disposition, Content-Type',
    );

    return new StreamableFile(template.content);
  }

  @Post()
  async create(@CurrentUser() user: JwtUser, @Body() dto: CreateStudentDto) {
    const student = await this.studentsService.create(user.userId, dto);

    return this.studentsService.toStudentResponse(student);
  }

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  importStudents(
    @CurrentUser() user: JwtUser,
    @UploadedFile() file?: StudentImportFile,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file danh sách học sinh.');
    }

    return this.studentsService.importFromTemplate(user.userId, file);
  }

  @Post('bulk-delete')
  deleteMany(@CurrentUser() user: JwtUser, @Body() dto: BulkDeleteStudentsDto) {
    return this.studentsService.deleteMany(
      user.userId,
      dto.studentIds,
      dto.mode,
    );
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
