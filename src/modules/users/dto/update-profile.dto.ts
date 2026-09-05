import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^[0-9+\-\s().]*$/, {
    message: 'Số điện thoại chỉ nên gồm số và ký tự +, -, khoảng trắng.',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccountName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[0-9\s-]*$/, {
    message: 'Số tài khoản chỉ nên gồm số, khoảng trắng hoặc dấu gạch ngang.',
  })
  bankAccountNumber?: string;
}
