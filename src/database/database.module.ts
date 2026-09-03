import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');

        if (!uri) {
          throw new Error('MONGO_URI is required to start EduTrack API');
        }

        return { uri };
      },
    }),
  ],
})
export class DatabaseModule {}
