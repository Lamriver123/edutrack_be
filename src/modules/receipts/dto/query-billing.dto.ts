import { IsDateString, IsOptional } from 'class-validator';

export class QueryBillingDto {
  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ.' })
  fromDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ.' })
  toDate?: string;
}
