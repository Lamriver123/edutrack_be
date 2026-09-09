import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolManagementModule } from '../school-management/school-management.module';
import { AiController } from './ai.controller';
import { AiScheduleService } from './ai-schedule.service';
import { AiSession, AiSessionSchema } from './schemas/ai-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiSession.name, schema: AiSessionSchema },
    ]),
    SchoolManagementModule,
  ],
  controllers: [AiController],
  providers: [AiScheduleService],
})
export class AiModule {}
