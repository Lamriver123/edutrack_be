import { IsString, MaxLength } from 'class-validator';

export class PreviewInvoiceTemplateDto {
  @IsString()
  @MaxLength(700000)
  html: string;

  @IsString()
  @MaxLength(300000)
  css: string;
}
