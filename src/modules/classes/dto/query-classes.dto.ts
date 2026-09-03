import { IsOptional, IsString } from 'class-validator';

export class QueryClassesDto {
  @IsOptional()
  @IsString()
  search?: string;
}
