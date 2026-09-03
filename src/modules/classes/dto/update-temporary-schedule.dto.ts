import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ScheduleOverrideAction } from '../../school-management/enums';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateTemporaryScheduleDto {
  @IsEnum(ScheduleOverrideAction)
  action: ScheduleOverrideAction;

  @IsOptional()
  @IsDateString()
  originalDate?: string;

  @IsOptional()
  @IsDateString()
  newDate?: string;

  @IsOptional()
  @Matches(timePattern)
  startTime?: string;

  @IsOptional()
  @Matches(timePattern)
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
