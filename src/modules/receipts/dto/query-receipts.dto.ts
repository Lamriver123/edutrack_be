import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaymentStatus } from '../../school-management/enums';

export class QueryReceiptsDto {
  @IsOptional()
  @IsMongoId({ message: 'Mã lớp học không hợp lệ.' })
  classId?: string;

  @IsOptional()
  @IsMongoId({ message: 'Mã học sinh không hợp lệ.' })
  studentId?: string;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Trạng thái thanh toán không hợp lệ.' })
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ.' })
  fromDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ.' })
  toDate?: string;
}
