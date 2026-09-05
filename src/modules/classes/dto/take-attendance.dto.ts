import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AttendanceStatus } from '../../school-management/enums';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
export type AttendanceScheduleEventType =
  'fixed' | 'extra' | 'reschedule' | 'manual';

export class TakeAttendanceRecordDto {
  @IsMongoId()
  studentId: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class TakeAttendanceDto {
  @IsDateString()
  date: string;

  @Matches(timePattern)
  startTime: string;

  @Matches(timePattern)
  endTime: string;

  @IsOptional()
  @IsIn(['fixed', 'extra', 'reschedule', 'manual'])
  scheduleEventType?: AttendanceScheduleEventType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TakeAttendanceRecordDto)
  records: TakeAttendanceRecordDto[];
}
