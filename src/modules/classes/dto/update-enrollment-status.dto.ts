import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EnrollmentStatus } from '../../school-management/enums';

export class UpdateEnrollmentStatusDto {
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
