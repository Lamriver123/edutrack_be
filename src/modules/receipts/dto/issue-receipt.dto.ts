import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReceiptExamRemarkDto {
  @IsMongoId({ message: 'Mã điểm kiểm tra không hợp lệ.' })
  examScoreId: string;

  @IsString()
  @MaxLength(500)
  teacherRemark: string;
}

export class IssueReceiptDto {
  @IsOptional()
  @IsIn(['class', 'multi_class'], {
    message: 'Phạm vi hóa đơn không hợp lệ.',
  })
  scopeType?: 'class' | 'multi_class';

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @ArrayMaxSize(12)
  @IsMongoId({ each: true, message: 'Mã lớp học không hợp lệ.' })
  classIds?: string[];

  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ.' })
  fromDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ.' })
  toDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Hạn thanh toán không hợp lệ.' })
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(80)
  @IsMongoId({ each: true, message: 'Mã buổi học cần tính tiền không hợp lệ.' })
  tuitionEntryIds?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(80)
  targetSessionCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  adjustmentAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  teacherComment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  strengthsComment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  improvementsComment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  generalComment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(700)
  paymentNote?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptExamRemarkDto)
  examRemarks?: ReceiptExamRemarkDto[];
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return value;
}
