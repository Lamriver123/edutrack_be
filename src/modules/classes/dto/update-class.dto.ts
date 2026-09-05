import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ClassStatus } from '../../school-management/enums';

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(7)
  colorIndex?: number;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9a-fA-F]{6})$/, {
    message: 'Màu lớp học phải có dạng #RRGGBB.',
  })
  colorHex?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  regularPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  makeupPrice?: number;

  @IsOptional()
  @IsDateString()
  priceEffectiveFrom?: string;

  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;
}
