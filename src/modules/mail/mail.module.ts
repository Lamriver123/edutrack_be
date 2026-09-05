import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailListener } from './listeners/mail.listener';

@Module({
  providers: [MailService, MailListener],
  exports: [MailService],
})
export class MailModule {}
