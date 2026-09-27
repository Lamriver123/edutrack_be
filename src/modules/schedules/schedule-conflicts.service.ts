import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { Connection, Model, Types } from 'mongoose';
import {
  convertUtcTimeToVietnam,
  convertUtcWeeklyTimeToVietnam,
  convertVietnamTimeToUtc,
} from '../../common/utils/vietnam-time';
import { ClassStatus, SessionStatus } from '../school-management/enums';
import {
  Attendance,
  AttendanceDocument,
} from '../school-management/schemas/attendance.schema';
import {
  Class,
  ClassDocument,
} from '../school-management/schemas/class.schema';
import {
  ClassSession,
  ClassSessionDocument,
} from '../school-management/schemas/class-session.schema';
import {
  ScheduleVersion,
  ScheduleVersionDocument,
} from '../school-management/schemas/schedule-version.schema';
import {
  ScheduleOverride,
  ScheduleOverrideDocument,
} from '../school-management/schemas/schedule-override.schema';
import { CreateFixedScheduleDto } from '../classes/dto/create-fixed-schedule.dto';
import { CreateTemporaryScheduleDto } from '../classes/dto/create-temporary-schedule.dto';
import { ScheduleAvailabilityDto } from './dto/check-schedule.dto';
import {
  checkFixed,
  checkTemporary,
  conflict,
  dateKey,
  fixedOnDate,
  freeIntervals,
  occupiedOnDate,
  resolveSource,
  sourceMatches,
  validDate,
  type ConflictResult,
  type OccupiedSlot,
  type ScheduleSnapshot,
  type TemporarySlot,
} from './schedule-conflict.engine';

type AttendanceOccurrence = Pick<
  OccupiedSlot,
  'date' | 'startTime' | 'endTime'
>;

@Injectable()
export class ScheduleConflictsService {
  constructor(
    @InjectModel(Class.name) private readonly classes: Model<ClassDocument>,
    @InjectModel(ScheduleVersion.name)
    private readonly versions: Model<ScheduleVersionDocument>,
    @InjectModel(ScheduleOverride.name)
    private readonly overrides: Model<ScheduleOverrideDocument>,
    @InjectModel(ClassSession.name)
    private readonly classSessions: Model<ClassSessionDocument>,
    @InjectModel(Attendance.name)
    private readonly attendances: Model<AttendanceDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async snapshot(
    teacherId: string,
    classId: string,
  ): Promise<ScheduleSnapshot> {
    if (!Types.ObjectId.isValid(classId))
      throw new BadRequestException('Mã lớp không hợp lệ.');
    const teacher = new Types.ObjectId(teacherId);
    const classes = await this.classes
      .find({ teacherId: teacher, status: { $ne: ClassStatus.Archived } })
      .select('_id name')
      .lean()
      .exec();
    if (!classes.some((c) => c._id.toString() === classId))
      throw new NotFoundException('Không tìm thấy lớp học.');
    const filter = {
      teacherId: teacher,
      classId: { $in: classes.map((c) => c._id) },
    };
    const [versions, overrides] = await Promise.all([
      this.versions.find(filter).lean().exec(),
      this.overrides.find(filter).lean().exec(),
    ]);
    const time = (v: string | undefined, storage?: string) =>
      v && storage === 'utc' ? convertUtcTimeToVietnam(v) : v;
    return {
      classes: new Map(classes.map((c) => [c._id.toString(), c.name])),
      versions: versions.map((v) => ({
        id: v._id.toString(),
        classId: v.classId.toString(),
        version: v.version,
        from: dateKey(v.effectiveFrom),
        to: v.effectiveTo ? dateKey(v.effectiveTo) : undefined,
        schedules: v.schedules.map((s) => {
          const start =
            v.timeStorage === 'utc'
              ? convertUtcWeeklyTimeToVietnam(s.dayOfWeek, s.startTime)
              : { dayOfWeek: s.dayOfWeek, time: s.startTime };
          return {
            dayOfWeek: start.dayOfWeek,
            startTime: start.time,
            endTime: time(s.endTime, v.timeStorage)!,
          };
        }),
      })),
      overrides: overrides.map((s) => ({
        id: s._id.toString(),
        classId: s.classId.toString(),
        action: s.action,
        originalDate: s.originalDate ? dateKey(s.originalDate) : undefined,
        newDate: s.newDate ? dateKey(s.newDate) : undefined,
        startTime: time(s.startTime, s.timeStorage),
        endTime: time(s.endTime, s.timeStorage),
        originalStartTime: time(s.originalStartTime, s.timeStorage),
        originalEndTime: time(s.originalEndTime, s.timeStorage),
      })),
    };
  }
  async checkFixed(
    teacherId: string,
    classId: string,
    dto: CreateFixedScheduleDto,
  ) {
    return checkFixed(
      await this.snapshot(teacherId, classId),
      classId,
      dto.effectiveFrom,
      dto.schedules,
    );
  }
  async checkTemporary(
    teacherId: string,
    classId: string,
    dto: CreateTemporaryScheduleDto,
    ignoreId?: string,
  ) {
    const snapshot = await this.snapshot(teacherId, classId);
    this.checkOwnedOverride(snapshot, classId, ignoreId);
    const draft = resolveSource(
      snapshot,
      { ...dto, id: ignoreId ?? 'draft', classId },
      ignoreId,
    );
    const old = snapshot.overrides.find((s) => s.id === ignoreId);
    const result = checkTemporary(snapshot, draft, ignoreId);
    await this.assertOccurrencesNotAttended(
      teacherId,
      classId,
      this.uniqueOccurrences([
        ...(old ? this.affectedOccurrences(snapshot, old) : []),
        ...this.affectedOccurrences(snapshot, draft),
      ]),
    );
    // Changing the source/action can restore an old occurrence; validate that too.
    if (old?.originalDate) {
      const before = occupiedOnDate(snapshot, old.originalDate);
      const after = occupiedOnDate(
        {
          ...snapshot,
          overrides: [
            ...snapshot.overrides.filter((s) => s.id !== ignoreId),
            draft,
          ],
        },
        old.originalDate,
      );
      for (const restored of after.filter(
        (e) =>
          e.type === 'fixed' &&
          !before.some(
            (b) =>
              b.scheduleId === e.scheduleId &&
              b.startTime === e.startTime &&
              b.endTime === e.endTime,
          ),
      )) {
        for (const other of after) {
          if (other === restored) continue;
          if (
            restored.startTime < other.endTime &&
            other.startTime < restored.endTime
          )
            result.blockingConflicts.push(conflict(snapshot, other));
        }
      }
    }
    return {
      ...result,
      originalStartTime: draft.originalStartTime,
      originalEndTime: draft.originalEndTime,
    };
  }
  async availability(teacherId: string, dto: ScheduleAvailabilityDto) {
    const snapshot = await this.snapshot(teacherId, dto.classId);
    this.checkOwnedOverride(snapshot, dto.classId, dto.ignoreOverrideId);
    const date = validDate(dto.date);
    if (dto.mode === 'fixed') {
      if (!dto.dayOfWeek) throw new BadRequestException('Vui lòng chọn thứ.');
      const result = checkFixed(snapshot, dto.classId, date, [
        {
          dayOfWeek: dto.dayOfWeek,
          startTime: dto.startTime,
          endTime: dto.endTime,
        },
      ]);
      return {
        slots: freeIntervals(
          result.blockingConflicts,
          dto.startTime,
          dto.endTime,
          dto.duration,
        ),
        warnings: result.warnings,
      };
    }
    let source: TemporarySlot | undefined;
    if (dto.originalDate)
      source = resolveSource(
        snapshot,
        { ...dto, id: 'draft', action: 'reschedule' },
        dto.ignoreOverrideId,
      );
    const busy = occupiedOnDate(snapshot, date, dto.ignoreOverrideId).filter(
      (event) => !source || !sourceMatches(event, source),
    );
    return {
      slots: freeIntervals(busy, dto.startTime, dto.endTime, dto.duration),
      warnings: [],
    };
  }
  async sourceSlots(
    teacherId: string,
    classId: string,
    date: string,
    ignoreId?: string,
  ) {
    const snapshot = await this.snapshot(teacherId, classId);
    this.checkOwnedOverride(snapshot, classId, ignoreId);
    return fixedOnDate(snapshot, validDate(date)).filter(
      (s) =>
        s.classId === classId &&
        !snapshot.overrides.some(
          (o) =>
            o.id !== ignoreId &&
            o.action !== 'extra' &&
            o.action !== 'one_on_one' &&
            sourceMatches(s, o),
        ),
    );
  }
  assertAvailable(result: ConflictResult) {
    if (result.blockingConflicts.length)
      throw new ConflictException({
        code: 'SCHEDULE_CONFLICT',
        message: `Trùng lịch. ${result.blockingConflicts.map((c) => c.message).join(' ')}`,
        ...result,
      });
  }
  async assertCanRevoke(teacherId: string, classId: string, id: string) {
    const snapshot = await this.snapshot(teacherId, classId);
    this.checkOwnedOverride(snapshot, classId, id);
    const old = snapshot.overrides.find((s) => s.id === id)!;
    await this.assertOccurrencesNotAttended(
      teacherId,
      classId,
      this.affectedOccurrences(snapshot, old),
    );
    if (
      old.action === 'extra' ||
      old.action === 'one_on_one' ||
      !old.originalDate
    )
      return;
    const before = occupiedOnDate(snapshot, old.originalDate);
    const after = occupiedOnDate(snapshot, old.originalDate, id);
    const blockingConflicts = after
      .filter(
        (s) =>
          sourceMatches(s, old) &&
          !before.some(
            (b) =>
              b.scheduleId === s.scheduleId &&
              b.startTime === s.startTime &&
              b.endTime === s.endTime,
          ),
      )
      .flatMap((s) =>
        after
          .filter(
            (other) =>
              other !== s &&
              s.startTime < other.endTime &&
              other.startTime < s.endTime,
          )
          .map((other) => conflict(snapshot, other)),
      );
    this.assertAvailable({ blockingConflicts, warnings: [] });
  }

  async assertOverridesNotAttended(
    teacherId: string,
    classId: string,
    ids: string[],
  ) {
    if (!ids.length) {
      return;
    }

    const snapshot = await this.snapshot(teacherId, classId);
    const idSet = new Set(ids);
    const schedules = snapshot.overrides.filter(
      (schedule) => schedule.classId === classId && idSet.has(schedule.id),
    );

    if (schedules.length !== idSet.size) {
      throw new NotFoundException('Không tìm thấy lịch tạm thời.');
    }

    await this.assertOccurrencesNotAttended(
      teacherId,
      classId,
      this.uniqueOccurrences(
        schedules.flatMap((schedule) =>
          this.affectedOccurrences(snapshot, schedule),
        ),
      ),
    );
  }

  private affectedOccurrences(
    snapshot: ScheduleSnapshot,
    schedule: TemporarySlot,
  ): AttendanceOccurrence[] {
    const occurrences: AttendanceOccurrence[] = [];

    if (schedule.originalDate) {
      const originalStartTime =
        schedule.originalStartTime ??
        (schedule.action === 'cancel' ? schedule.startTime : undefined);
      const originalEndTime =
        schedule.originalEndTime ??
        (schedule.action === 'cancel' ? schedule.endTime : undefined);

      if (originalStartTime && originalEndTime) {
        occurrences.push({
          date: schedule.originalDate,
          startTime: originalStartTime,
          endTime: originalEndTime,
        });
      } else {
        occurrences.push(
          ...fixedOnDate(snapshot, schedule.originalDate)
            .filter((event) => sourceMatches(event, schedule))
            .map(({ date, startTime, endTime }) => ({
              date,
              startTime,
              endTime,
            })),
        );
      }
    }

    if (
      schedule.action !== 'cancel' &&
      schedule.newDate &&
      schedule.startTime &&
      schedule.endTime
    ) {
      occurrences.push({
        date: schedule.newDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      });
    }

    return this.uniqueOccurrences(occurrences);
  }

  private uniqueOccurrences(occurrences: AttendanceOccurrence[]) {
    return [
      ...new Map(
        occurrences.map((occurrence) => [
          `${occurrence.date}:${occurrence.startTime}:${occurrence.endTime}`,
          occurrence,
        ]),
      ).values(),
    ];
  }

  private async assertOccurrencesNotAttended(
    teacherId: string,
    classId: string,
    occurrences: AttendanceOccurrence[],
  ) {
    if (!occurrences.length) {
      return;
    }

    const teacherObjectId = new Types.ObjectId(teacherId);
    const classObjectId = new Types.ObjectId(classId);
    const sessions = await this.classSessions
      .find({
        teacherId: teacherObjectId,
        classId: classObjectId,
        $or: occurrences.flatMap((occurrence) =>
          this.occurrenceSessionFilters(classId, occurrence),
        ),
      })
      .select('_id status')
      .lean<Array<{ _id: Types.ObjectId; status: SessionStatus }>>()
      .exec();

    if (!sessions.length) {
      return;
    }

    const hasCompletedSession = sessions.some(
      (session) => session.status === SessionStatus.Completed,
    );
    const hasAttendance = hasCompletedSession
      ? false
      : Boolean(
          await this.attendances
            .exists({
              teacherId: teacherObjectId,
              classId: classObjectId,
              sessionId: { $in: sessions.map((session) => session._id) },
            })
            .exec(),
        );

    if (hasCompletedSession || hasAttendance) {
      throw new ConflictException({
        code: 'SCHEDULE_ATTENDANCE_LOCKED',
        message:
          'Buổi học đã được điểm danh, không thể hủy, dời hoặc thu hồi lịch.',
      });
    }
  }

  private occurrenceSessionFilters(
    classId: string,
    occurrence: AttendanceOccurrence,
  ) {
    const [year, month, day] = occurrence.date.split('-').map(Number);
    const dateStart = new Date(Date.UTC(year, month - 1, day) - 7 * 3600000);
    const dateEnd = new Date(dateStart.getTime() + 24 * 3600000);

    return [
      {
        sourceKey: `${classId}:${occurrence.date}:${occurrence.startTime}:${occurrence.endTime}`,
      },
      {
        date: { $gte: dateStart, $lt: dateEnd },
        timeStorage: 'utc' as const,
        startTime: convertVietnamTimeToUtc(occurrence.startTime),
        endTime: convertVietnamTimeToUtc(occurrence.endTime),
      },
      {
        date: { $gte: dateStart, $lt: dateEnd },
        timeStorage: { $ne: 'utc' as const },
        startTime: occurrence.startTime,
        endTime: occurrence.endTime,
      },
    ];
  }
  private checkOwnedOverride(
    snapshot: ScheduleSnapshot,
    classId: string,
    id?: string,
  ) {
    if (
      id &&
      !snapshot.overrides.some((s) => s.id === id && s.classId === classId)
    )
      throw new NotFoundException('Không tìm thấy lịch tạm thời.');
  }

  // A database lease serializes check + write across tabs and Nest instances.
  async withTeacherWrite<T>(
    teacherId: string,
    write: () => Promise<T>,
  ): Promise<T> {
    const locks = this.connection.collection('schedule_write_locks');
    const _id = new Types.ObjectId(teacherId);
    const token = randomUUID();
    try {
      await locks.findOneAndUpdate(
        { _id, expiresAt: { $lte: new Date() } },
        { $set: { token, expiresAt: new Date(Date.now() + 120000) } },
        { upsert: true },
      );
    } catch (error) {
      if ((error as { code?: number }).code === 11000)
        throw new ConflictException(
          'Một thay đổi lịch khác đang được lưu. Vui lòng thử lại sau vài giây.',
        );
      throw error;
    }
    try {
      return await write();
    } finally {
      await locks.deleteOne({ _id, token });
    }
  }
}
