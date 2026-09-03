import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ScheduleType } from '../../school-management/enums';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export class SaveClassSessionContentDto {
  @IsDateString()
  date: string;

  @Matches(timePattern)
  startTime: string;

  @Matches(timePattern)
  endTime: string;

  @IsOptional()
  @IsEnum(ScheduleType)
  scheduleType?: ScheduleType;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  topic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  content?: string;
}
