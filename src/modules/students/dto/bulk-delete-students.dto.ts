import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { DeleteStudentMode } from './delete-student.dto';

export class BulkDeleteStudentsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsMongoId({ each: true })
  studentIds: string[];

  @IsEnum(DeleteStudentMode)
  mode: DeleteStudentMode;
}
