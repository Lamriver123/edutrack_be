import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
  ValidateIf,
} from 'class-validator';

export class ExamScoreEntryDto {
  @IsMongoId({ message: 'ID bài kiểm tra không hợp lệ.' })
  @IsNotEmpty({ message: 'ID bài kiểm tra không được để trống.' })
  examId: string;

  @IsMongoId({ message: 'ID học sinh không hợp lệ.' })
  @IsNotEmpty({ message: 'ID học sinh không được để trống.' })
  studentId: string;

  @IsOptional()
  @ValidateIf(
    (entry: ExamScoreEntryDto) =>
      entry.score !== null && entry.score !== undefined,
  )
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'Điểm số phải là một số.' },
  )
  @Min(0, { message: 'Điểm số không được nhỏ hơn 0.' })
  score?: number | null;

  @IsString()
  @IsOptional()
  @MaxLength(80, { message: 'Ghi chú điểm không được vượt quá 80 ký tự.' })
  note?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidenceImages?: string[];
}

export class TakeExamScoresBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamScoreEntryDto)
  scores: ExamScoreEntryDto[];
}
