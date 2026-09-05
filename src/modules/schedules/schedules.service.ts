import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  convertUtcTimeToVietnam,
  convertUtcWeeklyTimeToVietnam,
} from '../../common/utils/vietnam-time';
import {
  ClassStatus,
  ScheduleOverrideAction,
} from '../school-management/enums';
import {
  Class,
  ClassDocument,
} from '../school-management/schemas/class.schema';
import {
  ClassSession,
  ClassSessionDocument,
} from '../school-management/schemas/class-session.schema';
import {
  ScheduleOverride,
  ScheduleOverrideDocument,
} from '../school-management/schemas/schedule-override.schema';
import {
  ScheduleVersion,
  ScheduleVersionDocument,
} from '../school-management/schemas/schedule-version.schema';
import { QueryTeacherWeekScheduleDto } from './dto/query-teacher-week-schedule.dto';

const DEFAULT_CLASS_IMAGE_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR-qRE8Ud2H3MA_umzUwRTCefEIGGjOmnsi5hsMnPdrg&s=10';
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const VIETNAM_TIMEZONE_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type TeacherScheduleClassResponse = {
  id: string;
  name: string;
  imageUrl: string;
  colorIndex: number;
  colorHex?: string;
};

export type TeacherScheduleDayResponse = {
  date: string;
  dayOfWeek: number;
};

export type TeacherScheduleEventType =
  'fixed' | 'extra' | 'reschedule' | 'cancel';

export type TeacherScheduleEventResponse = {
  id: string;
  classId: string;
  className: string;
  classImageUrl: string;
  colorIndex: number;
  colorHex?: string;
  date: string;
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  type: TeacherScheduleEventType;
  reason?: string;
  originalDate?: string;
  topic?: string;
  content?: string;
};

export type TeacherWeekScheduleResponse = {
  weekStart: string;
  weekEnd: string;
  days: TeacherScheduleDayResponse[];
  classes: TeacherScheduleClassResponse[];
  events: TeacherScheduleEventResponse[];
};

type LeanClass = {
  _id: Types.ObjectId;
  name: string;
  imageUrl?: string;
  colorIndex?: number;
  colorHex?: string;
};

type LeanScheduleVersion = {
  _id: Types.ObjectId;
  classId: Types.ObjectId;
  version: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  timeStorage?: 'utc' | 'vietnam';
  schedules?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
};

type LeanScheduleOverride = {
  _id: Types.ObjectId;
  classId: Types.ObjectId;
  action: ScheduleOverrideAction;
  originalDate?: Date;
  newDate?: Date;
  startTime?: string;
  endTime?: string;
  reason?: string;
  timeStorage?: 'utc' | 'vietnam';
};

type LeanClassSession = {
  _id: Types.ObjectId;
  classId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  timeStorage?: 'utc' | 'vietnam';
  topic?: string;
  content?: string;
};

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(Class.name)
    private readonly classModel: Model<ClassDocument>,
    @InjectModel(ScheduleVersion.name)
    private readonly scheduleVersionModel: Model<ScheduleVersionDocument>,
    @InjectModel(ScheduleOverride.name)
    private readonly scheduleOverrideModel: Model<ScheduleOverrideDocument>,
    @InjectModel(ClassSession.name)
    private readonly classSessionModel: Model<ClassSessionDocument>,
  ) {}

  async getTeacherWeekSchedule(
    teacherId: string,
    query: QueryTeacherWeekScheduleDto = {},
  ): Promise<TeacherWeekScheduleResponse> {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const requestedDate = query.weekStart
      ? this.parseVietnamDateOnly(query.weekStart, 'Ngày bắt đầu tuần')
      : this.getCurrentVietnamDate();
    const weekStart = this.getVietnamWeekStart(requestedDate);
    const weekEndExclusive = this.addDays(weekStart, 7);
    const days = this.buildWeekDays(weekStart);
    const classes = await this.classModel
      .find({
        teacherId: teacherObjectId,
        status: { $ne: ClassStatus.Archived },
      })
      .sort({ createdAt: -1 })
      .lean<LeanClass[]>()
      .exec();
    const classIds = classes.map((classroom) => classroom._id);
    const classMap = this.buildClassMap(classes);
    const colorMap = this.buildColorMap(classes);

    if (!classIds.length) {
      return this.buildEmptyWeekResponse(weekStart, days);
    }

    const [fixedSchedules, temporarySchedules, classSessions] =
      await Promise.all([
        this.scheduleVersionModel
          .find({
            teacherId: teacherObjectId,
            classId: { $in: classIds },
            effectiveFrom: { $lt: weekEndExclusive },
            $or: [{ effectiveTo: null }, { effectiveTo: { $gte: weekStart } }],
          })
          .sort({ effectiveFrom: -1, version: -1 })
          .lean<LeanScheduleVersion[]>()
          .exec(),
        this.scheduleOverrideModel
          .find({
            teacherId: teacherObjectId,
            classId: { $in: classIds },
            $or: [
              {
                originalDate: {
                  $gte: weekStart,
                  $lt: weekEndExclusive,
                },
              },
              {
                newDate: {
                  $gte: weekStart,
                  $lt: weekEndExclusive,
                },
              },
            ],
          })
          .sort({ createdAt: 1 })
          .lean<LeanScheduleOverride[]>()
          .exec(),
        this.classSessionModel
          .find({
            teacherId: teacherObjectId,
            classId: { $in: classIds },
            date: {
              $gte: weekStart,
              $lt: weekEndExclusive,
            },
          })
          .sort({ date: 1, startTime: 1 })
          .lean<LeanClassSession[]>()
          .exec(),
      ]);

    const events = this.attachSessionContent(
      this.applyTemporarySchedules(
        this.buildFixedEvents(days, fixedSchedules, classMap, colorMap),
        temporarySchedules,
        classMap,
        colorMap,
        weekStart,
        weekEndExclusive,
      ),
      classSessions,
    );

    return {
      weekStart: this.toVietnamDateKey(weekStart),
      weekEnd: this.toVietnamDateKey(this.addDays(weekStart, 6)),
      days,
      classes: classes.map((classroom) => ({
        id: classroom._id.toString(),
        name: classroom.name,
        imageUrl: classroom.imageUrl || DEFAULT_CLASS_IMAGE_URL,
        colorIndex: colorMap.get(classroom._id.toString()) ?? 0,
        colorHex: classroom.colorHex,
      })),
      events: this.sortEvents(events),
    };
  }

  async getClassScheduleHistory(
    teacherId: string,
    classId: string,
  ): Promise<TeacherScheduleEventResponse[]> {
    const teacherObjectId = this.toObjectId(teacherId, 'teacherId');
    const classObjectId = this.toObjectId(classId, 'classId');

    const firstVersion = await this.scheduleVersionModel
      .findOne({ teacherId: teacherObjectId, classId: classObjectId })
      .sort({ effectiveFrom: 1 })
      .lean<LeanScheduleVersion>()
      .exec();

    if (!firstVersion) {
      return [];
    }

    const startDate = firstVersion.effectiveFrom;
    const endDateExclusive = this.addDays(this.getCurrentVietnamDate(), 1);

    if (startDate >= endDateExclusive) {
      return [];
    }

    const classroom = await this.classModel
      .findOne({
        _id: classObjectId,
        teacherId: teacherObjectId,
        status: { $ne: ClassStatus.Archived },
      })
      .lean<LeanClass>()
      .exec();

    if (!classroom) {
      return [];
    }

    const classMap = new Map([[classId, classroom]]);
    const colorMap = new Map([[classId, classroom.colorIndex ?? 0]]);

    const [fixedSchedules, temporarySchedules, classSessions] =
      await Promise.all([
        this.scheduleVersionModel
          .find({
            teacherId: teacherObjectId,
            classId: classObjectId,
            effectiveFrom: { $lt: endDateExclusive },
            $or: [{ effectiveTo: null }, { effectiveTo: { $gte: startDate } }],
          })
          .lean<LeanScheduleVersion[]>()
          .exec(),
        this.scheduleOverrideModel
          .find({
            teacherId: teacherObjectId,
            classId: classObjectId,
            $or: [
              {
                originalDate: {
                  $gte: startDate,
                  $lt: endDateExclusive,
                },
              },
              {
                newDate: {
                  $gte: startDate,
                  $lt: endDateExclusive,
                },
              },
            ],
          })
          .lean<LeanScheduleOverride[]>()
          .exec(),
        this.classSessionModel
          .find({
            teacherId: teacherObjectId,
            classId: classObjectId,
            date: {
              $gte: startDate,
              $lt: endDateExclusive,
            },
          })
          .lean<LeanClassSession[]>()
          .exec(),
      ]);

    const days = this.buildDays(startDate, endDateExclusive);
    const fixedEvents = this.buildFixedEvents(
      days,
      fixedSchedules,
      classMap,
      colorMap,
    );
    const eventsWithOverrides = this.applyTemporarySchedules(
      fixedEvents,
      temporarySchedules,
      classMap,
      colorMap,
      startDate,
      endDateExclusive,
    );

    const finalEvents = this.attachSessionContent(
      eventsWithOverrides,
      classSessions,
    );
    const activeEvents = finalEvents.filter((e) => e.type !== 'cancel');

    return this.sortEvents(activeEvents);
  }

  private buildFixedEvents(
    days: TeacherScheduleDayResponse[],
    fixedSchedules: LeanScheduleVersion[],
    classMap: Map<string, LeanClass>,
    colorMap: Map<string, number>,
  ) {
    const events: TeacherScheduleEventResponse[] = [];

    for (const day of days) {
      const dayStart = this.parseVietnamDateOnly(day.date, 'Ngày trong tuần');
      const dayEnd = this.addDays(dayStart, 1);
      const classScheduleMap = this.findActiveSchedulesForDate(
        fixedSchedules,
        dayStart,
        dayEnd,
      );

      for (const [classId, schedule] of classScheduleMap.entries()) {
        const classroom = classMap.get(classId);

        if (!classroom) {
          continue;
        }

        for (const slot of schedule.schedules ?? []) {
          const vietnamStart =
            schedule.timeStorage === 'utc'
              ? convertUtcWeeklyTimeToVietnam(slot.dayOfWeek, slot.startTime)
              : {
                  dayOfWeek: slot.dayOfWeek,
                  time: slot.startTime,
                };

          if (vietnamStart.dayOfWeek !== day.dayOfWeek) {
            continue;
          }

          events.push({
            id: `fixed:${schedule._id.toString()}:${day.date}:${slot.startTime}:${slot.endTime}`,
            classId,
            className: classroom.name,
            classImageUrl: classroom.imageUrl || DEFAULT_CLASS_IMAGE_URL,
            colorIndex: colorMap.get(classId) ?? 0,
            colorHex: classroom.colorHex,
            date: day.date,
            dayOfWeek: day.dayOfWeek,
            startTime: vietnamStart.time,
            endTime:
              schedule.timeStorage === 'utc'
                ? convertUtcTimeToVietnam(slot.endTime)
                : slot.endTime,
            type: 'fixed',
          });
        }
      }
    }

    return events;
  }

  private attachSessionContent(
    events: TeacherScheduleEventResponse[],
    sessions: LeanClassSession[],
  ) {
    const sessionMap = new Map<string, LeanClassSession>();
    const fallbackSessionMap = new Map<string, LeanClassSession>();

    for (const session of sessions) {
      const classId = session.classId.toString();
      const dateKey = this.toVietnamDateKey(session.date);
      const startTime =
        this.toVietnamTime(session.startTime, session.timeStorage) ??
        session.startTime;
      const endTime =
        this.toVietnamTime(session.endTime, session.timeStorage) ??
        session.endTime;
      const exactKey = this.buildSessionKey(
        classId,
        dateKey,
        startTime,
        endTime,
      );

      sessionMap.set(exactKey, session);
      fallbackSessionMap.set(`${classId}:${dateKey}`, session);
    }

    return events.map((event) => {
      const session =
        event.startTime && event.endTime
          ? sessionMap.get(
              this.buildSessionKey(
                event.classId,
                event.date,
                event.startTime,
                event.endTime,
              ),
            )
          : undefined;
      const fallbackSession =
        session ?? fallbackSessionMap.get(`${event.classId}:${event.date}`);

      if (!fallbackSession) {
        return event;
      }

      return {
        ...event,
        content: fallbackSession.content,
        topic: fallbackSession.topic,
      };
    });
  }

  private applyTemporarySchedules(
    fixedEvents: TeacherScheduleEventResponse[],
    temporarySchedules: LeanScheduleOverride[],
    classMap: Map<string, LeanClass>,
    colorMap: Map<string, number>,
    weekStart: Date,
    weekEndExclusive: Date,
  ) {
    const events = [...fixedEvents];

    for (const schedule of temporarySchedules) {
      const classId = schedule.classId.toString();
      const classroom = classMap.get(classId);

      if (!classroom) {
        continue;
      }

      if (schedule.action === ScheduleOverrideAction.Cancel) {
        const originalDateKey = schedule.originalDate
          ? this.toVietnamDateKey(schedule.originalDate)
          : undefined;

        if (
          !originalDateKey ||
          !this.isDateKeyInWeek(originalDateKey, weekStart, weekEndExclusive)
        ) {
          continue;
        }

        const removedEvents = this.removeFixedEvents(
          events,
          classId,
          originalDateKey,
          this.toVietnamTime(schedule.startTime, schedule.timeStorage),
          this.toVietnamTime(schedule.endTime, schedule.timeStorage),
        );

        if (removedEvents.length) {
          for (const event of removedEvents) {
            events.push({
              ...event,
              id: `cancel:${schedule._id.toString()}:${event.id}`,
              type: 'cancel',
              reason: schedule.reason,
            });
          }
        } else {
          events.push(
            this.buildTemporaryEvent({
              schedule,
              classroom,
              colorIndex: colorMap.get(classId) ?? 0,
              date: originalDateKey,
              type: 'cancel',
            }),
          );
        }

        continue;
      }

      if (schedule.action === ScheduleOverrideAction.Reschedule) {
        const originalDateKey = schedule.originalDate
          ? this.toVietnamDateKey(schedule.originalDate)
          : undefined;
        const newDateKey = schedule.newDate
          ? this.toVietnamDateKey(schedule.newDate)
          : undefined;

        if (originalDateKey) {
          this.removeFixedEvents(events, classId, originalDateKey);
        }

        if (
          !newDateKey ||
          !this.isDateKeyInWeek(newDateKey, weekStart, weekEndExclusive)
        ) {
          continue;
        }

        events.push(
          this.buildTemporaryEvent({
            schedule,
            classroom,
            colorIndex: colorMap.get(classId) ?? 0,
            date: newDateKey,
            originalDate: originalDateKey,
            type: 'reschedule',
          }),
        );

        continue;
      }

      const newDateKey = schedule.newDate
        ? this.toVietnamDateKey(schedule.newDate)
        : undefined;

      if (
        !newDateKey ||
        !this.isDateKeyInWeek(newDateKey, weekStart, weekEndExclusive)
      ) {
        continue;
      }

      events.push(
        this.buildTemporaryEvent({
          schedule,
          classroom,
          colorIndex: colorMap.get(classId) ?? 0,
          date: newDateKey,
          type: 'extra',
        }),
      );
    }

    return events;
  }

  private buildTemporaryEvent({
    schedule,
    classroom,
    colorIndex,
    date,
    originalDate,
    type,
  }: {
    schedule: LeanScheduleOverride;
    classroom: LeanClass;
    colorIndex: number;
    date: string;
    originalDate?: string;
    type: TeacherScheduleEventType;
  }): TeacherScheduleEventResponse {
    return {
      id: `${type}:${schedule._id.toString()}:${date}`,
      classId: classroom._id.toString(),
      className: classroom.name,
      classImageUrl: classroom.imageUrl || DEFAULT_CLASS_IMAGE_URL,
      colorIndex,
      colorHex: classroom.colorHex,
      date,
      dayOfWeek: this.getVietnamDayOfWeek(
        this.parseVietnamDateOnly(date, 'Ngày lịch tạm'),
      ),
      startTime: this.toVietnamTime(schedule.startTime, schedule.timeStorage),
      endTime: this.toVietnamTime(schedule.endTime, schedule.timeStorage),
      type,
      reason: schedule.reason,
      originalDate,
    };
  }

  private findActiveSchedulesForDate(
    schedules: LeanScheduleVersion[],
    dayStart: Date,
    dayEnd: Date,
  ) {
    const activeMap = new Map<string, LeanScheduleVersion>();

    for (const schedule of schedules) {
      if (
        schedule.effectiveFrom >= dayEnd ||
        (schedule.effectiveTo && schedule.effectiveTo < dayStart)
      ) {
        continue;
      }

      const classId = schedule.classId.toString();
      const current = activeMap.get(classId);

      if (!current || schedule.version > current.version) {
        activeMap.set(classId, schedule);
      }
    }

    return activeMap;
  }

  private removeFixedEvents(
    events: TeacherScheduleEventResponse[],
    classId: string,
    date: string,
    startTime?: string,
    endTime?: string,
  ) {
    const removedEvents: TeacherScheduleEventResponse[] = [];

    for (let index = events.length - 1; index >= 0; index -= 1) {
      const event = events[index];
      const isSameTime =
        !startTime ||
        !endTime ||
        (event.startTime === startTime && event.endTime === endTime);

      if (
        event.classId === classId &&
        event.date === date &&
        event.type === 'fixed' &&
        isSameTime
      ) {
        removedEvents.unshift(event);
        events.splice(index, 1);
      }
    }

    return removedEvents;
  }

  private sortEvents(events: TeacherScheduleEventResponse[]) {
    return [...events].sort((first, second) => {
      if (first.date !== second.date) {
        return first.date.localeCompare(second.date);
      }

      return (first.startTime ?? '24:00').localeCompare(
        second.startTime ?? '24:00',
      );
    });
  }

  private buildWeekDays(weekStart: Date): TeacherScheduleDayResponse[] {
    return this.buildDays(weekStart, this.addDays(weekStart, 7));
  }

  private buildDays(
    startDate: Date,
    endDateExclusive: Date,
  ): TeacherScheduleDayResponse[] {
    const days: TeacherScheduleDayResponse[] = [];
    let currentDate = startDate;
    while (currentDate < endDateExclusive) {
      days.push({
        date: this.toVietnamDateKey(currentDate),
        dayOfWeek: this.getVietnamDayOfWeek(currentDate),
      });
      currentDate = this.addDays(currentDate, 1);
    }
    return days;
  }

  private buildEmptyWeekResponse(
    weekStart: Date,
    days: TeacherScheduleDayResponse[],
  ): TeacherWeekScheduleResponse {
    return {
      weekStart: this.toVietnamDateKey(weekStart),
      weekEnd: this.toVietnamDateKey(this.addDays(weekStart, 6)),
      days,
      classes: [],
      events: [],
    };
  }

  private buildClassMap(classes: LeanClass[]) {
    return new Map(
      classes.map((classroom) => [classroom._id.toString(), classroom]),
    );
  }

  private buildColorMap(classes: LeanClass[]) {
    return new Map(
      classes.map((classroom, index) => [
        classroom._id.toString(),
        typeof classroom.colorIndex === 'number' ? classroom.colorIndex : index,
      ]),
    );
  }

  private parseVietnamDateOnly(value: string, label: string) {
    const match = DATE_ONLY_PATTERN.exec(value.trim());

    if (!match) {
      throw new BadRequestException(`${label} phải có dạng YYYY-MM-DD.`);
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    if (
      utcDate.getUTCFullYear() !== year ||
      utcDate.getUTCMonth() !== month - 1 ||
      utcDate.getUTCDate() !== day
    ) {
      throw new BadRequestException(`${label} không hợp lệ.`);
    }

    return new Date(
      Date.UTC(year, month - 1, day) - VIETNAM_TIMEZONE_OFFSET_MS,
    );
  }

  private getCurrentVietnamDate() {
    return this.parseVietnamDateOnly(
      this.toVietnamDateKey(new Date()),
      'Ngày hiện tại',
    );
  }

  private getVietnamWeekStart(date: Date) {
    const dayOfWeek = this.getVietnamDayOfWeek(date);

    return this.addDays(date, -(dayOfWeek - 1));
  }

  private getVietnamDayOfWeek(date: Date) {
    const vietnamDate = new Date(date.getTime() + VIETNAM_TIMEZONE_OFFSET_MS);
    const utcDay = vietnamDate.getUTCDay();

    return utcDay === 0 ? 7 : utcDay;
  }

  private toVietnamDateKey(date: Date) {
    const vietnamDate = new Date(date.getTime() + VIETNAM_TIMEZONE_OFFSET_MS);
    const year = vietnamDate.getUTCFullYear();
    const month = String(vietnamDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(vietnamDate.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private isDateKeyInWeek(
    dateKey: string,
    weekStart: Date,
    weekEndExclusive: Date,
  ) {
    const date = this.parseVietnamDateOnly(dateKey, 'Ngày trong tuần');

    return date >= weekStart && date < weekEndExclusive;
  }

  private addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * DAY_MS);
  }

  private buildSessionKey(
    classId: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    return `${classId}:${date}:${startTime}:${endTime}`;
  }

  private toVietnamTime(
    time: string | undefined,
    timeStorage?: 'utc' | 'vietnam',
  ) {
    if (!time) {
      return undefined;
    }

    return timeStorage === 'utc' ? convertUtcTimeToVietnam(time) : time;
  }

  private toObjectId(value: string, fieldName: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} không hợp lệ.`);
    }

    return new Types.ObjectId(value);
  }
}
