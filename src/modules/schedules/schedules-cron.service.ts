import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  ClassSession,
  ClassSessionDocument,
} from '../school-management/schemas/class-session.schema';
import { SessionStatus } from '../school-management/enums/session-status.enum';
import { SchedulesService } from './schedules.service';
import { convertVietnamTimeToUtc } from '../../common/utils/vietnam-time';

@Injectable()
export class SchedulesCronService {
  private readonly logger = new Logger(SchedulesCronService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(ClassSession.name)
    private readonly classSessionModel: Model<ClassSessionDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly schedulesService: SchedulesService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    // 1. Lấy tất cả giáo viên có đăng ký nhận thông báo
    const teachers = await this.userModel
      .find({ 'pushSubscriptions.0': { $exists: true } })
      .exec();
    if (teachers.length === 0) return;

    // Lấy giờ hiện tại theo giờ Việt Nam
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // UTC+7

    const year = vietnamTime.getUTCFullYear();
    const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, '0');
    const date = String(vietnamTime.getUTCDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${date}`;

    const hour = String(vietnamTime.getUTCHours()).padStart(2, '0');
    const minute = String(vietnamTime.getUTCMinutes()).padStart(2, '0');
    const currentMinutes = this.timeToMinutes(`${hour}:${minute}`);

    for (const teacher of teachers) {
      try {
        const schedule = await this.schedulesService.getTeacherWeekSchedule(
          teacher._id.toString(),
          {
            weekStart: todayStr,
          },
        );

        const todayEvents = schedule.events.filter(
          (e) => e.date === todayStr && e.type !== 'cancel' && !!e.startTime,
        );

        for (const event of todayEvents) {
          const eventMinutes = this.timeToMinutes(event.startTime!);
          const diffMins = eventMinutes - currentMinutes;

          // Báo trước 30 phút
          if (diffMins === 30) {
            this.eventEmitter.emit('notification.push', {
              userId: teacher._id.toString(),
              payload: {
                title: 'Chuẩn bị đến giờ dạy!',
                body: `Lớp ${event.className} sẽ bắt đầu lúc ${event.startTime} (30 phút nữa).`,
                url: `/dashboard/classes/${event.classId}`,
              },
            });
          }

          // Trễ 10 phút chưa điểm danh
          if (diffMins === -10) {
            const sourceKey = `${event.classId}:${event.date}:${convertVietnamTimeToUtc(event.startTime!)}:${convertVietnamTimeToUtc(event.endTime!)}`;
            const session = await this.classSessionModel
              .findOne({
                teacherId: teacher._id,
                sourceKey,
              })
              .exec();

            // Nếu session chưa được tạo hoặc trạng thái chưa hoàn thành -> Chưa điểm danh
            if (!session || session.status !== SessionStatus.Completed) {
              this.eventEmitter.emit('notification.push', {
                userId: teacher._id.toString(),
                payload: {
                  title: 'Nhắc nhở điểm danh',
                  body: `Lớp ${event.className} đã bắt đầu được 10 phút. Thầy/Cô nhớ điểm danh nhé!`,
                  url: `/dashboard/classes/${event.classId}?tab=attendance`,
                },
              });
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Error processing push cron for teacher ${teacher._id.toString()}: ${errorMessage}`,
        );
      }
    }
  }

  private timeToMinutes(time: string) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
