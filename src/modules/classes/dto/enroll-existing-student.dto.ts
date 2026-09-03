import { IsMongoId } from 'class-validator';

export class EnrollExistingStudentDto {
  @IsMongoId()
  studentId: string;
}
