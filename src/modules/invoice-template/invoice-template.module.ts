import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { InvoiceImagesController } from './invoice-images.controller';
import { InvoiceImagesService } from './invoice-images.service';
import {
  InvoiceImage,
  InvoiceImageSchema,
} from './schemas/invoice-image.schema';
import { ReceiptTemplateService } from '../receipts/receipt-template.service';
import { InvoiceTemplateController } from './invoice-template.controller';
import { InvoiceTemplateService } from './invoice-template.service';
import {
  InvoiceTemplate,
  InvoiceTemplateSchema,
} from './schemas/invoice-template.schema';

@Module({
  imports: [
    CloudinaryModule,
    MongooseModule.forFeature([
      { name: InvoiceTemplate.name, schema: InvoiceTemplateSchema },
      { name: InvoiceImage.name, schema: InvoiceImageSchema },
    ]),
  ],
  controllers: [InvoiceTemplateController, InvoiceImagesController],
  providers: [
    InvoiceTemplateService,
    InvoiceImagesService,
    ReceiptTemplateService,
  ],
  exports: [InvoiceTemplateService],
})
export class InvoiceTemplateModule {}
