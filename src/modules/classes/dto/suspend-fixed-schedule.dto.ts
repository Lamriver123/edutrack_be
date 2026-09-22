import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class SuspendFixedScheduleDto {
  @IsDateString()
  suspendFrom: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
