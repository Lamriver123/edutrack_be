import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsMongoId,
} from 'class-validator';

export class DownloadReceiptsDto {
  @IsArray({ message: 'Danh sách hóa đơn không hợp lệ.' })
  @ArrayMinSize(1, { message: 'Vui lòng chọn ít nhất một hóa đơn.' })
  @ArrayMaxSize(50, { message: 'Chỉ có thể tải tối đa 50 hóa đơn mỗi lần.' })
  @IsMongoId({ each: true, message: 'Mã hóa đơn không hợp lệ.' })
  receiptIds: string[];
}
