import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { PushService } from './push.service';
import { PushCronService } from './push-cron.service';
import { UsersModule } from '../users/users.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ClassSession, ClassSessionSchema } from '../school-management/schemas/class-session.schema';

@Module({
  imports: [
    UsersModule,
    SchedulesModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ClassSession.name, schema: ClassSessionSchema },
    ]),
  ],
  providers: [PushService, PushCronService],
  exports: [PushService],
})
export class PushModule {}
