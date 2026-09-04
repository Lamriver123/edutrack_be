import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getHealth() {
    let dbStatus = 'disconnected';
    try {
      if (this.connection.readyState === 1) {
        await this.connection.db?.command({ ping: 1 });
        dbStatus = 'connected';
      }
    } catch (error) {
      dbStatus = 'error';
    }

    return {
      name: 'EduTrack API',
      status: 'ok',
      db: dbStatus,
      version: '0.0.1',
    };
  }
}
