import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassesModule } from './modules/classes/classes.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MailModule } from './modules/mail/mail.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { SchoolManagementModule } from './modules/school-management/school-management.module';
import { StudentsModule } from './modules/students/students.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    UsersModule,
    MailModule,
    AuthModule,
    SchoolManagementModule,
    StudentsModule,
    ClassesModule,
    SchedulesModule,
    ReceiptsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
