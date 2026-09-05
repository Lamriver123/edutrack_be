import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CloudinaryService,
  type UploadImageFile,
} from '../cloudinary/cloudinary.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

const PAYMENT_QR_MAX_SIZE_BYTES = 2 * 1024 * 1024;
const TEACHER_AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const PAYMENT_QR_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('me')
  getProfile(@CurrentUser() user: JwtUser) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Patch('me/password')
  changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.userId, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: TEACHER_AVATAR_MAX_SIZE_BYTES,
      },
    }),
  )
  uploadTeacherAvatar(@UploadedFile() file?: UploadImageFile) {
    this.assertImageFile(file, {
      maxSize: TEACHER_AVATAR_MAX_SIZE_BYTES,
      missingMessage: 'Vui lòng chọn ảnh đại diện giáo viên.',
      sizeMessage: 'Ảnh đại diện không được vượt quá 5MB.',
      typeMessage: 'File tải lên phải là hình ảnh.',
    });

    return this.cloudinaryService.uploadTeacherAvatar(file);
  }

  @Post('me/payment-qr')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: PAYMENT_QR_MAX_SIZE_BYTES,
      },
    }),
  )
  uploadPaymentQr(
    @CurrentUser() user: JwtUser,
    @UploadedFile() file?: UploadImageFile,
  ) {
    this.assertImageFile(file, {
      allowedMimeTypes: PAYMENT_QR_MIME_TYPES,
      maxSize: PAYMENT_QR_MAX_SIZE_BYTES,
      missingMessage: 'Vui lòng chọn ảnh QR thanh toán.',
      sizeMessage: 'Ảnh QR không được vượt quá 2MB.',
      typeMessage: 'Ảnh QR chỉ hỗ trợ PNG, JPG hoặc WEBP.',
    });

    return this.usersService.updatePaymentQr(user.userId, file);
  }

  @Get('me/payment-qr')
  async getPaymentQr(@CurrentUser() user: JwtUser, @Res() response: Response) {
    const paymentQr = await this.usersService.getPaymentQr(user.userId);

    response.setHeader('Content-Type', paymentQr.contentType);
    response.setHeader('Content-Length', String(paymentQr.size));
    response.setHeader('Cache-Control', 'private, max-age=300');
    response.send(paymentQr.data);
  }

  @Delete('me/payment-qr')
  removePaymentQr(@CurrentUser() user: JwtUser) {
    return this.usersService.removePaymentQr(user.userId);
  }

  private assertImageFile(
    file: UploadImageFile | undefined,
    options: {
      allowedMimeTypes?: Set<string>;
      maxSize: number;
      missingMessage: string;
      sizeMessage: string;
      typeMessage: string;
    },
  ): asserts file is UploadImageFile {
    if (!file) {
      throw new BadRequestException(options.missingMessage);
    }

    const isValidType = options.allowedMimeTypes
      ? options.allowedMimeTypes.has(file.mimetype)
      : file.mimetype.startsWith('image/');

    if (!isValidType) {
      throw new UnsupportedMediaTypeException(options.typeMessage);
    }

    if (file.size > options.maxSize) {
      throw new BadRequestException(options.sizeMessage);
    }
  }
}
