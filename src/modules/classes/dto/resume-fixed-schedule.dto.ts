import { IsDateString } from 'class-validator';

export class ResumeFixedScheduleDto {
  @IsDateString()
  resumeFrom: string;
}
