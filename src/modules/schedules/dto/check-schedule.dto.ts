import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { CreateFixedScheduleDto } from '../../classes/dto/create-fixed-schedule.dto';
import { CreateTemporaryScheduleDto } from '../../classes/dto/create-temporary-schedule.dto';

export class CheckFixedScheduleDto extends CreateFixedScheduleDto {
  @IsMongoId()
  classId: string;
}
export class CheckTemporaryScheduleDto extends CreateTemporaryScheduleDto {
  @IsMongoId()
  classId: string;

  @IsOptional()
  @IsMongoId()
  ignoreOverrideId?: string;
}
export class ScheduleAvailabilityDto {
  @IsMongoId()
  classId: string;

  @IsIn(['fixed', 'temporary'])
  mode: 'fixed' | 'temporary';

  @IsString()
  date: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1439)
  duration: number;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime: string;

  @IsOptional()
  @IsMongoId()
  ignoreOverrideId?: string;

  @IsOptional()
  @IsString()
  originalDate?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  originalStartTime?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  originalEndTime?: string;
}
