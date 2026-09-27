import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
