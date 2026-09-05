import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class QueryBillingDto {
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
