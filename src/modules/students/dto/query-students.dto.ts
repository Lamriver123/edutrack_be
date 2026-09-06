import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { StudentStatus } from '../../school-management/enums';

export const STUDENT_SORT_FIELDS = [
  'fullName',
  'gradeLevel',
  'createdAt',
  'updatedAt',
] as const;

export const SORT_ORDERS = ['asc', 'desc'] as const;

export type StudentSortField = (typeof STUDENT_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];

export class QueryStudentsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @IsOptional()
  @IsIn(STUDENT_SORT_FIELDS)
  sortBy?: StudentSortField = 'fullName';

  @IsOptional()
  @IsIn(SORT_ORDERS)
  sortOrder?: SortOrder = 'asc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 20;
}
