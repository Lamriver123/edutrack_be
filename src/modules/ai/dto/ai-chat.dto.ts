import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AiChatDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng cung cấp sessionId.' })
  sessionId: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập nội dung tin nhắn.' })
  @MaxLength(2000, { message: 'Tin nhắn không được quá 2000 ký tự.' })
  message: string;
}
