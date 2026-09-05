import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentStatus } from '../../school-management/enums';

export class UpdateReceiptPaymentDto {
  @IsEnum(PaymentStatus, { message: 'Trạng thái thanh toán không hợp lệ.' })
  paymentStatus: PaymentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày thanh toán không hợp lệ.' })
  paidAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(700)
  paymentNote?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(700)
  paymentProofUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  paymentProofPublicId?: string;
}
