import { IsMongoId, IsOptional } from 'class-validator';

export class QueryInvoiceImagesDto {
  @IsOptional()
  @IsMongoId()
  before?: string;
}
