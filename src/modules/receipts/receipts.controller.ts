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
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CloudinaryService,
  type UploadImageFile,
} from '../cloudinary/cloudinary.service';
import { IssueReceiptDto } from './dto/issue-receipt.dto';
import { QueryBillingDto } from './dto/query-billing.dto';
import { QueryReceiptsDto } from './dto/query-receipts.dto';
import { UpdateReceiptPaymentDto } from './dto/update-receipt-payment.dto';
import { ReceiptsService } from './receipts.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
  constructor(
    private readonly receiptsService: ReceiptsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('classes/:classId/billing/overview')
  getClassBillingOverview(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Query() query: QueryBillingDto,
  ) {
    return this.receiptsService.getClassBillingOverview(
      user.userId,
      classId,
      query,
    );
  }

  @Get('classes/:classId/students/:studentId/billing-candidates')
  getBillingCandidates(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @Query() query: QueryBillingDto,
  ) {
    return this.receiptsService.getBillingCandidates(
      user.userId,
      classId,
      studentId,
      query,
    );
  }

  @Get('students/:studentId/billing/overview')
  getStudentBillingOverview(
    @CurrentUser() user: JwtUser,
    @Param('studentId') studentId: string,
    @Query() query: QueryBillingDto,
  ) {
    return this.receiptsService.getStudentBillingOverview(
      user.userId,
      studentId,
      query,
    );
  }

  @Get('students/:studentId/billing-candidates')
  getStudentBillingCandidates(
    @CurrentUser() user: JwtUser,
    @Param('studentId') studentId: string,
    @Query() query: QueryBillingDto,
  ) {
    return this.receiptsService.getStudentBillingCandidates(
      user.userId,
      studentId,
      query,
    );
  }

  @Post('classes/:classId/students/:studentId/receipts/preview')
  previewReceipt(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @Body() dto: IssueReceiptDto,
  ) {
    return this.receiptsService.previewReceipt(
      user.userId,
      classId,
      studentId,
      dto,
    );
  }

  @Post('students/:studentId/receipts/preview')
  previewStudentReceipt(
    @CurrentUser() user: JwtUser,
    @Param('studentId') studentId: string,
    @Body() dto: IssueReceiptDto,
  ) {
    return this.receiptsService.previewStudentReceipt(
      user.userId,
      studentId,
      dto,
    );
  }

  @Post('classes/:classId/students/:studentId/receipts')
  issueReceipt(
    @CurrentUser() user: JwtUser,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
    @Body() dto: IssueReceiptDto,
  ) {
    return this.receiptsService.issueReceipt(
      user.userId,
      classId,
      studentId,
      dto,
    );
  }

  @Post('students/:studentId/receipts')
  issueStudentReceipt(
    @CurrentUser() user: JwtUser,
    @Param('studentId') studentId: string,
    @Body() dto: IssueReceiptDto,
  ) {
    return this.receiptsService.issueStudentReceipt(
      user.userId,
      studentId,
      dto,
    );
  }

  @Get('receipts')
  listReceipts(@CurrentUser() user: JwtUser, @Query() query: QueryReceiptsDto) {
    return this.receiptsService.listReceipts(user.userId, query);
  }

  @Get('receipts/:receiptId')
  findReceipt(
    @CurrentUser() user: JwtUser,
    @Param('receiptId') receiptId: string,
  ) {
    return this.receiptsService.findReceiptById(user.userId, receiptId);
  }

  @Get('receipts/:receiptId/download')
  downloadReceipt(
    @CurrentUser() user: JwtUser,
    @Param('receiptId') receiptId: string,
  ) {
    return this.receiptsService.getReceiptDownload(user.userId, receiptId);
  }

  @Post('receipts/:receiptId/render-pdf')
  retryRenderPdf(
    @CurrentUser() user: JwtUser,
    @Param('receiptId') receiptId: string,
  ) {
    return this.receiptsService.retryRenderPdf(user.userId, receiptId);
  }

  @Post('receipts/:receiptId/payment-proof')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadPaymentProof(
    @CurrentUser() user: JwtUser,
    @Param('receiptId') receiptId: string,
    @UploadedFile() file?: UploadImageFile,
  ) {
    await this.receiptsService.validateReceiptOwnership(user.userId, receiptId);

    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh minh chứng thanh toán.');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new UnsupportedMediaTypeException('File tải lên phải là hình ảnh.');
    }

    return this.cloudinaryService.uploadReceiptPaymentProof(file);
  }

  @Patch('receipts/:receiptId/payment')
  updatePayment(
    @CurrentUser() user: JwtUser,
    @Param('receiptId') receiptId: string,
    @Body() dto: UpdateReceiptPaymentDto,
  ) {
    return this.receiptsService.updatePayment(user.userId, receiptId, dto);
  }

  @Delete('receipts/:receiptId')
  cancelReceipt(
    @CurrentUser() user: JwtUser,
    @Param('receiptId') receiptId: string,
  ) {
    return this.receiptsService.cancelReceipt(user.userId, receiptId);
  }
}
