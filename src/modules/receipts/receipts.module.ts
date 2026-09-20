import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SchoolManagementModule } from '../school-management/school-management.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ReceiptPdfService } from './receipt-pdf.service';
import { ReceiptTemplateService } from './receipt-template.service';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { InvoiceTemplateModule } from '../invoice-template/invoice-template.module';
import { ReceiptDesignService } from './receipt-design.service';

@Module({
  imports: [
    SchoolManagementModule,
    CloudinaryModule,
    InvoiceTemplateModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ReceiptsController],
  providers: [
    ReceiptsService,
    ReceiptTemplateService,
    ReceiptPdfService,
    ReceiptDesignService,
  ],
})
export class ReceiptsModule {}
