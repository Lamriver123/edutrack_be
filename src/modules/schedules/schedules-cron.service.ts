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
  private notifiedPreClass = new Set<string>();
  private notifiedAttendance = new Set<string>();
  private lastClearedDateStr: string = '';

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(ClassSession.name)
    private readonly classSessionModel: Model<ClassSessionDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly schedulesService: SchedulesService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Cron job triggered. Checking for teachers with push subscriptions...');
    
    // 1. Lấy tất cả giáo viên có đăng ký nhận thông báo
    const teachers = await this.userModel
      .find({ 'pushSubscriptions.0': { $exists: true } })
      .exec();
      
    if (teachers.length === 0) {
      this.logger.debug('No teachers found with push subscriptions. Exiting cron.');
      return;
    }

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

    if (this.lastClearedDateStr !== todayStr) {
      this.logger.debug(`New day detected (${todayStr}). Clearing in-memory notification sets.`);
      this.notifiedPreClass.clear();
      this.notifiedAttendance.clear();
      this.lastClearedDateStr = todayStr;
    }

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

        this.logger.debug(
          `Cron run at ${hour}:${minute} (${currentMinutes} mins). Teacher ${teacher._id.toString()}: Found ${todayEvents.length} events today.`,
        );

        for (const event of todayEvents) {
          const eventMinutes = this.timeToMinutes(event.startTime!);
          const diffMins = eventMinutes - currentMinutes;

          this.logger.debug(
            `Event: ${event.className} at ${event.startTime} (${eventMinutes} mins) -> Diff: ${diffMins} mins`,
          );

          // Báo trước 30 phút (quét trong khoảng 25-30 phút để bù trừ độ trễ server)
          const preClassKey = `${teacher._id.toString()}:${event.classId}:${todayStr}:${event.startTime}`;
          if (diffMins > 25 && diffMins <= 30 && !this.notifiedPreClass.has(preClassKey)) {
            this.notifiedPreClass.add(preClassKey);
            this.logger.log(`Firing 30m push for ${event.classId}`);
            this.eventEmitter.emit('notification.push', {
              userId: teacher._id.toString(),
              payload: {
                title: 'Chuẩn bị đến giờ dạy!',
                body: `Lớp ${event.className} sẽ bắt đầu lúc ${event.startTime} (tầm ${diffMins} phút nữa).`,
                url: `/dashboard/classes/${event.classId}`,
              },
            });
          }

          // Trễ 10 phút chưa điểm danh (quét trong khoảng trễ 10-15 phút)
          const attendanceKey = `${teacher._id.toString()}:${event.classId}:${todayStr}:${event.startTime}`;
          if (diffMins >= -15 && diffMins <= -10 && !this.notifiedAttendance.has(attendanceKey)) {
            const sourceKey = `${event.classId}:${event.date}:${convertVietnamTimeToUtc(event.startTime!)}:${convertVietnamTimeToUtc(event.endTime!)}`;
            const session = await this.classSessionModel
              .findOne({
                teacherId: teacher._id,
                sourceKey,
              })
              .exec();

            // Nếu session chưa được tạo hoặc trạng thái chưa hoàn thành -> Chưa điểm danh
            if (!session || session.status !== SessionStatus.Completed) {
              this.notifiedAttendance.add(attendanceKey);
              this.logger.log(
                `Firing -10m attendance push for ${event.classId}`,
              );
              this.eventEmitter.emit('notification.push', {
                userId: teacher._id.toString(),
                payload: {
                  title: 'Nhắc nhở điểm danh',
                  body: `Lớp ${event.className} đã bắt đầu được ${-diffMins} phút. Thầy/Cô nhớ điểm danh nhé!`,
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
