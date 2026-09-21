import { IsString, Matches } from 'class-validator';

export class LookupBankAccountDto {
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'Mã BIN ngân hàng không hợp lệ.',
  })
  bankBin!: string;

  @IsString()
  @Matches(/^\d{6,19}$/, {
    message: 'Số tài khoản phải gồm từ 6 đến 19 chữ số.',
  })
  accountNumber!: string;
}
