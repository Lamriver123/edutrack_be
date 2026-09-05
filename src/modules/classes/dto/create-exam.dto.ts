import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên bài kiểm tra không được để trống.' })
  title: string;

  @IsDateString({}, { message: 'Ngày kiểm tra không hợp lệ.' })
  @IsNotEmpty({ message: 'Ngày kiểm tra không được để trống.' })
  testDate: string;

  @IsNumber()
  @Min(0, { message: 'Điểm tối đa không được nhỏ hơn 0.' })
  maxScore: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileName?: string;
}
