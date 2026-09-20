import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { UploadImageFile } from '../cloudinary/cloudinary.service';
import { QueryInvoiceImagesDto } from './dto/query-invoice-images.dto';
import {
  INVOICE_IMAGE_MAX_SIZE,
  InvoiceImagesService,
} from './invoice-images.service';

@Controller('invoice-images')
@UseGuards(JwtAuthGuard)
export class InvoiceImagesController {
  constructor(private readonly images: InvoiceImagesService) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Query() query: QueryInvoiceImagesDto) {
    return this.images.list(user.userId, query.before);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: INVOICE_IMAGE_MAX_SIZE, files: 1 },
    }),
  )
  upload(@CurrentUser() user: JwtUser, @UploadedFile() file?: UploadImageFile) {
    return this.images.upload(user.userId, file);
  }

  @Delete(':imageId')
  archive(@CurrentUser() user: JwtUser, @Param('imageId') imageId: string) {
    return this.images.archive(user.userId, imageId);
  }
}
