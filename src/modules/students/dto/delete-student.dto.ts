import { IsEnum, IsOptional } from 'class-validator';

export enum DeleteStudentMode {
  Deactivate = 'deactivate',
  Delete = 'delete',
}

export class DeleteStudentDto {
  @IsOptional()
  @IsEnum(DeleteStudentMode)
  mode?: DeleteStudentMode;
}
