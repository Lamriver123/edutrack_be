import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/types/authenticated-request.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInvoiceTemplateDto } from './dto/create-invoice-template.dto';
import { DuplicateInvoiceTemplateDto } from './dto/duplicate-invoice-template.dto';
import { UpdateInvoiceTemplateDto } from './dto/update-invoice-template.dto';
import { InvoiceTemplateService } from './invoice-template.service';
import {
  INVOICE_REGIONS,
  INVOICE_REGION_CSS,
  invoiceRegionPlaceholder,
} from './constants/invoice-regions';
import { ReceiptTemplateService } from '../receipts/receipt-template.service';
import { PreviewInvoiceTemplateDto } from './dto/preview-invoice-template.dto';
import { PREVIEW_RECEIPT } from './constants/preview-receipt';
import {
  buildMockInvoiceRenderContext,
  renderInvoiceTemplateHtml,
} from './utils/template-renderer';

@Controller('invoice-templates')
@UseGuards(JwtAuthGuard)
export class InvoiceTemplateController {
  constructor(
    private readonly invoiceTemplateService: InvoiceTemplateService,
    private readonly receiptTemplate: ReceiptTemplateService,
  ) {}

  @Get('default')
  getDefaultTemplate(@CurrentUser() user: JwtUser) {
    return this.invoiceTemplateService.getDefaultTemplate(user.userId);
  }

  @Get('regions')
  regions() {
    return {
      regions: INVOICE_REGIONS.map((region) => ({
        ...region,
        html: invoiceRegionPlaceholder(region.key),
      })),
      css: INVOICE_REGION_CSS,
    };
  }

  @Post('preview')
  preview(@Body() dto: PreviewInvoiceTemplateDto) {
    const html = renderInvoiceTemplateHtml(
      dto.html,
      buildMockInvoiceRenderContext(),
    );
    return {
      html: this.receiptTemplate.renderCustomTemplate(PREVIEW_RECEIPT, {
        ...dto,
        html,
      }),
    };
  }

  @Get()
  findAll(@CurrentUser() user: JwtUser) {
    return this.invoiceTemplateService.findAll(user.userId);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateInvoiceTemplateDto) {
    return this.invoiceTemplateService.create(user.userId, dto);
  }

  @Post('reset-default')
  resetDefaultTemplate(@CurrentUser() user: JwtUser) {
    return this.invoiceTemplateService.resetDefaultTemplate(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.invoiceTemplateService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceTemplateDto,
  ) {
    return this.invoiceTemplateService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.invoiceTemplateService.remove(user.userId, id);
  }

  @Post(':id/duplicate')
  duplicate(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: DuplicateInvoiceTemplateDto = {},
  ) {
    return this.invoiceTemplateService.duplicate(user.userId, id, dto);
  }
}
