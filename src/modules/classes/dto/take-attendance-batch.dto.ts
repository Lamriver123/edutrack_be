import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { TakeAttendanceDto } from './take-attendance.dto';

export class TakeAttendanceBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TakeAttendanceDto)
  sessions: TakeAttendanceDto[];
}
