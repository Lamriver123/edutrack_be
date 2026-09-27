import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  ClassSession,
  ClassSessionDocument,
} from '../school-management/schemas/class-session.schema';
import { SessionStatus } from '../school-management/enums/session-status.enum';
import {
  SchedulesService,
  TeacherScheduleEventResponse,
} from './schedules.service';
import { convertVietnamTimeToUtc } from '../../common/utils/vietnam-time';
import { PushReminderStore } from './push-reminder-store.service';

const MINUTE = 60_000;
const VIETNAM_OFFSET = 7 * 60 * MINUTE;

@Injectable()
export class SchedulesCronService {
  private readonly logger = new Logger(SchedulesCronService.name);
  private running = false;
  private lastStartedAt: string | null = null;
  private lastCompletedAt: string | null = null;
  private lastError: string | null = null;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(ClassSession.name)
    private readonly classSessionModel: Model<ClassSessionDocument>,
    private readonly eventEmitter: EventEmitter2,
    private readonly schedulesService: SchedulesService,
    private readonly reminders: PushReminderStore,
  ) {}

  getStatus() {
    return {
      running: this.running,
      lastStartedAt: this.lastStartedAt,
      lastCompletedAt: this.lastCompletedAt,
      lastError: this.lastError,
      serverTime: new Date().toISOString(),
    };
  }

  @Timeout('initial-push-reminders', 5_000)
  async scanAfterStartup() {
    await this.handleCron();
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'push-reminders',
    waitForCompletion: true,
  })
  async handleCron() {
    // Also protects startup and manually invoked scans from overlapping this process.
    if (this.running) return;
    this.running = true;
    const now = new Date();
    this.lastStartedAt = now.toISOString();
    this.lastError = null;
    let teacherCount = 0;
    let sentCount = 0;
    let failedCount = 0;
    this.logger.log(`Push reminder scan started at ${this.lastStartedAt}`);

    try {
      const teachers = await this.userModel
        .find({ 'pushSubscriptions.0': { $exists: true } })
        .select('_id')
        .exec();
      teacherCount = teachers.length;
      for (const teacher of teachers) {
        try {
          const events = await this.getNearbyEvents(
            teacher._id.toString(),
            new Date(),
          );
          for (const event of events) {
            if (event.type === 'cancel' || !event.startTime || !event.endTime)
              continue;
            const start = new Date(
              `${event.date}T${event.startTime}:00+07:00`,
            ).getTime();
            const end = new Date(
              `${event.date}T${event.endTime}:00+07:00`,
            ).getTime();
            const window = this.reminderWindow(start, end);
            if (!window) continue;
            const { kind } = window;
            if (
              kind === 'attendance' &&
              (await this.isSessionFinished(teacher._id, event))
            )
              continue;

            const key = `${teacher._id.toString()}:${event.classId}:${event.date}:${event.startTime}:${event.endTime}:${kind}`;
            const token = await this.reminders.claim(key, new Date());
            if (!token) continue;
            let sent = false;
            try {
              // Database/calendar lookups can span the boundary of a reminder window.
              const deliveryWindow = this.reminderWindow(start, end);
              if (deliveryWindow?.kind !== kind) continue;
              const { minutesUntilStart } = deliveryWindow;
              // No listener or all gateway failures must remain retryable.
              const results: unknown[] = await this.eventEmitter.emitAsync(
                'notification.push',
                {
                  userId: teacher._id.toString(),
                  payload: {
                    title:
                      kind === 'pre-class'
                        ? 'Chuẩn bị đến giờ dạy!'
                        : 'Nhắc nhở điểm danh',
                    body:
                      kind === 'pre-class'
                        ? `Lớp ${event.className} sẽ bắt đầu lúc ${event.startTime} (còn ${Math.ceil(minutesUntilStart)} phút).`
                        : `Lớp ${event.className} đã bắt đầu được ${Math.floor(-minutesUntilStart)} phút. Thầy/Cô nhớ điểm danh nhé!`,
                    url: `/classes/${event.classId}${kind === 'attendance' ? '?tab=attendance' : ''}`,
                    tag: key,
                  },
                },
              );
              sent = results.some(
                (result) =>
                  typeof result === 'object' &&
                  result !== null &&
                  'sent' in result &&
                  typeof result.sent === 'number' &&
                  result.sent > 0,
              );
              if (sent) sentCount++;
              else {
                failedCount++;
                this.lastError = 'push_delivery_failed';
                this.logger.warn(
                  `Push reminder not accepted; will retry while relevant: ${key}`,
                );
              }
            } finally {
              await this.reminders.finish(key, token, sent);
            }
          }
        } catch (error) {
          failedCount++;
          this.lastError = 'teacher_scan_failed';
          this.logger.error(
            `Push reminder scan failed for teacher ${teacher._id.toString()}`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      }
    } catch (error) {
      failedCount++;
      this.lastError = 'scan_failed';
      this.logger.error(
        'Push reminder scan failed',
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.lastCompletedAt = new Date().toISOString();
      this.running = false;
      this.logger.log(
        `Push reminder scan completed: teachers=${teacherCount}, sent=${sentCount}, failed=${failedCount}`,
      );
    }
  }

  private reminderWindow(start: number, end: number) {
    const now = Date.now();
    const minutesUntilStart = (start - now) / MINUTE;
    if (minutesUntilStart > 0 && minutesUntilStart <= 30) {
      return { kind: 'pre-class' as const, minutesUntilStart };
    }
    if (minutesUntilStart <= -10 && minutesUntilStart >= -30 && now < end) {
      return { kind: 'attendance' as const, minutesUntilStart };
    }
    return null;
  }

  private async getNearbyEvents(teacherId: string, now: Date) {
    // Include adjacent days/weeks around midnight; event times are Vietnam wall time.
    const dates = new Set([
      this.vietnamDate(now.getTime() - 30 * MINUTE),
      this.vietnamDate(now.getTime() + 30 * MINUTE),
    ]);
    const events = new Map<string, TeacherScheduleEventResponse>();
    const coveredDates = new Set<string>();
    for (const date of dates) {
      if (coveredDates.has(date)) continue;
      const schedule = await this.schedulesService.getTeacherWeekSchedule(
        teacherId,
        { weekStart: date },
      );
      for (const day of schedule.days) coveredDates.add(day.date);
      for (const event of schedule.events) {
        if (dates.has(event.date))
          events.set(
            `${event.classId}:${event.date}:${event.startTime}:${event.endTime}`,
            event,
          );
      }
    }
    return [...events.values()];
  }

  private async isSessionFinished(
    teacherId: Types.ObjectId,
    event: TeacherScheduleEventResponse,
  ) {
    const utcStart = convertVietnamTimeToUtc(event.startTime!);
    const utcEnd = convertVietnamTimeToUtc(event.endTime!);
    const dateStart = new Date(`${event.date}T00:00:00+07:00`);
    const session = await this.classSessionModel
      .findOne({
        teacherId,
        classId: new Types.ObjectId(event.classId),
        status: { $in: [SessionStatus.Completed, SessionStatus.Cancelled] },
        $or: [
          // ClassesService builds sourceKey before converting Vietnam input to stored UTC.
          {
            sourceKey: `${event.classId}:${event.date}:${event.startTime}:${event.endTime}`,
          },
          {
            date: {
              $gte: dateStart,
              $lt: new Date(dateStart.getTime() + 86_400_000),
            },
            $or: [
              { timeStorage: 'utc', startTime: utcStart, endTime: utcEnd },
              {
                timeStorage: { $ne: 'utc' },
                startTime: event.startTime,
                endTime: event.endTime,
              },
            ],
          },
        ],
      })
      .select('_id')
      .exec();
    return !!session;
  }

  private vietnamDate(timestamp: number) {
    return new Date(timestamp + VIETNAM_OFFSET).toISOString().slice(0, 10);
  }
}
