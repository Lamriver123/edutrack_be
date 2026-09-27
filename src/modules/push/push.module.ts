import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { UsersModule } from '../users/users.module';
import { PushController } from './push.controller';

@Module({
  imports: [UsersModule],
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
