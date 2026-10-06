import { randomUUID } from 'node:crypto';
import { ConflictException } from '@nestjs/common';
import { Connection, createConnection, Model, Types } from 'mongoose';
import { ClassesService } from '../src/modules/classes/classes.service';
import { ScheduleConflictsService } from '../src/modules/schedules/schedule-conflicts.service';
import { SchedulesService } from '../src/modules/schedules/schedules.service';
import {
  AttendanceStatus,
  ScheduleOverrideAction,
  ScheduleType,
  SessionStatus,
  TuitionStatus,
  TuitionType,
} from '../src/modules/school-management/enums';
import {
  Attendance,
  AttendanceDocument,
  AttendanceSchema,
  Class,
  ClassDocument,
  ClassSchema,
  ClassEnrollment,
  ClassEnrollmentDocument,
  ClassEnrollmentSchema,
  ClassPriceVersion,
  ClassPriceVersionDocument,
  ClassPriceVersionSchema,
  ClassSession,
  ClassSessionDocument,
  ClassSessionSchema,
  ScheduleOverride,
  ScheduleOverrideDocument,
  ScheduleOverrideSchema,
  ScheduleVersion,
  ScheduleVersionDocument,
  ScheduleVersionSchema,
  TuitionEntry,
  TuitionEntryDocument,
  TuitionEntrySchema,
} from '../src/modules/school-management/schemas';

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));

// Only this UUID database on a dedicated localhost QA port is touched.
// No application env, auth, cron, mail or push provider is started.
const databaseName = `edutrack_schedule_test_${process.pid}_${randomUUID().replaceAll('-', '')}`;
const mongoUri = `mongodb://127.0.0.1:27019/${databaseName}`;
const lessonDate = new Date('2026-08-26T00:00:00+07:00');

describe('Temporary lesson withdrawal with real isolated MongoDB', () => {
  let connection: Connection;
  let classModel: Model<ClassDocument>;
  let overrideModel: Model<ScheduleOverrideDocument>;
  let sessionModel: Model<ClassSessionDocument>;
  let attendanceModel: Model<AttendanceDocument>;
  let tuitionModel: Model<TuitionEntryDocument>;
  let schedules: SchedulesService;
  let classes: ClassesService;

  beforeAll(async () => {
    connection = await createConnection(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    }).asPromise();
    classModel = connection.model<ClassDocument>(Class.name, ClassSchema);
    overrideModel = connection.model<ScheduleOverrideDocument>(
      ScheduleOverride.name,
      ScheduleOverrideSchema,
    );
    sessionModel = connection.model<ClassSessionDocument>(
      ClassSession.name,
      ClassSessionSchema,
    );
    attendanceModel = connection.model<AttendanceDocument>(
      Attendance.name,
      AttendanceSchema,
    );
    tuitionModel = connection.model<TuitionEntryDocument>(
      TuitionEntry.name,
      TuitionEntrySchema,
    );
    const enrollmentModel = connection.model<ClassEnrollmentDocument>(
      ClassEnrollment.name,
      ClassEnrollmentSchema,
    );
    const priceModel = connection.model<ClassPriceVersionDocument>(
      ClassPriceVersion.name,
      ClassPriceVersionSchema,
    );
    const versionModel = connection.model<ScheduleVersionDocument>(
      ScheduleVersion.name,
      ScheduleVersionSchema,
    );
    await Promise.all(
      Object.values(connection.models).map((model) => model.init()),
    );
    schedules = new SchedulesService(
      classModel,
      versionModel,
      overrideModel,
      sessionModel,
      attendanceModel,
      tuitionModel,
    );
    const conflicts = new ScheduleConflictsService(
      classModel,
      versionModel,
      overrideModel,
      sessionModel,
      attendanceModel,
      connection,
      tuitionModel,
    );
    classes = new ClassesService(
      connection,
      classModel,
      priceModel,
      enrollmentModel,
      versionModel,
      overrideModel,
      sessionModel,
      attendanceModel,
      tuitionModel,
      {} as never,
      {} as never,
      {} as never,
      schedules,
      conflicts,
    );
  });

  afterAll(async () => {
    if (!connection) return;
    try {
      if (
        connection.name !== databaseName ||
        !databaseName.startsWith('edutrack_schedule_test_')
      )
        throw new Error('Refusing to drop a database not owned by this suite.');
      await connection.dropDatabase();
    } finally {
      await connection.close();
    }
  });

  async function fixture() {
    const teacherId = new Types.ObjectId();
    const classroom = await classModel.create({
      teacherId,
      name: 'Lớp kiểm thử',
      searchText: 'lop kiem thu',
      regularPrice: 100000,
      makeupPrice: 120000,
    });
    return { teacherId, classId: classroom._id };
  }

  it('blocks partial clearing, then removes a fully cleared lesson from the week, history and attendance sheet after withdrawal', async () => {
    const { teacherId, classId } = await fixture();
    const studentIds = Array.from({ length: 3 }, () => new Types.ObjectId());
    await connection
      .model(ClassEnrollment.name)
      .create(
        studentIds.map((studentId) => ({ teacherId, classId, studentId })),
      );
    const override = await overrideModel.create({
      teacherId,
      classId,
      action: ScheduleOverrideAction.Extra,
      newDate: lessonDate,
      startTime: '12:00',
      endTime: '13:30',
      timeStorage: 'utc',
    });
    const save = (ids: Types.ObjectId[], status?: AttendanceStatus) =>
      classes.takeAttendanceBatch(teacherId.toString(), classId.toString(), {
        sessions: [
          {
            date: '2026-08-26',
            startTime: '19:00',
            endTime: '20:30',
            scheduleEventType: 'extra',
            records: ids.map((studentId) => ({
              studentId: studentId.toString(),
              status,
            })),
          },
        ],
      });
    await save(studentIds, AttendanceStatus.Present);
    expect(await attendanceModel.countDocuments({ classId })).toBe(3);
    await save([studentIds[0]]);
    await expect(
      classes.revokeTemporarySchedule(
        teacherId.toString(),
        classId.toString(),
        override._id.toString(),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(await attendanceModel.countDocuments({ classId })).toBe(2);
    expect(await overrideModel.exists({ _id: override._id })).toBeTruthy();

    await save(studentIds.slice(1));
    expect(await attendanceModel.countDocuments({ classId })).toBe(0);
    expect(await tuitionModel.countDocuments({ classId })).toBe(0);
    // Materialized content is enough to trigger the old calendar fallback.
    await sessionModel.updateOne(
      { classId },
      { $set: { topic: 'Ôn bài', content: 'Buổi tạo nhầm' } },
    );
    const before = await schedules.getTeacherWeekSchedule(
      teacherId.toString(),
      { weekStart: '2026-08-24' },
    );
    expect(before.events).toHaveLength(1);
    expect(before.events[0]).toMatchObject({
      type: 'extra',
      topic: 'Ôn bài',
      startTime: '19:00',
    });
    await classes.revokeTemporarySchedule(
      teacherId.toString(),
      classId.toString(),
      override._id.toString(),
    );
    expect(await overrideModel.countDocuments({ classId })).toBe(0);
    expect(await sessionModel.countDocuments({ classId })).toBe(1);
    expect(
      (
        await schedules.getTeacherWeekSchedule(teacherId.toString(), {
          weekStart: '2026-08-24',
        })
      ).events,
    ).toEqual([]);
    expect(
      await schedules.getClassScheduleHistory(
        teacherId.toString(),
        classId.toString(),
      ),
    ).toEqual([]);
    expect(
      await classes.getAttendanceSheet(
        teacherId.toString(),
        classId.toString(),
      ),
    ).toEqual({ sessions: [], records: [] });
  });

  it('repairs already withdrawn legacy lessons while preserving actual attendance, billed tuition and manual lessons', async () => {
    const { teacherId, classId } = await fixture();
    const makeSession = (
      startTime: string,
      scheduleType = ScheduleType.Extra,
      status = SessionStatus.Completed,
    ) =>
      sessionModel.create({
        teacherId,
        classId,
        date: lessonDate,
        timeStorage: 'vietnam',
        startTime,
        endTime: `${Number(startTime.slice(0, 2)) + 1}:00`,
        scheduleType,
        status,
      });
    const empty = await makeSession('15:00');
    const partial = await makeSession(
      '16:00',
      ScheduleType.Extra,
      SessionStatus.Scheduled,
    );
    const billed = await makeSession(
      '17:00',
      ScheduleType.Temporary,
      SessionStatus.Scheduled,
    );
    const manual = await makeSession(
      '18:00',
      ScheduleType.Manual,
      SessionStatus.Scheduled,
    );
    await attendanceModel.create({
      teacherId,
      classId,
      sessionId: partial._id,
      studentId: new Types.ObjectId(),
      status: AttendanceStatus.Excused,
    });
    await tuitionModel.create({
      teacherId,
      classId,
      sessionId: billed._id,
      studentId: new Types.ObjectId(),
      amount: 100000,
      classNameSnapshot: 'Lớp kiểm thử',
      sessionDate: lessonDate,
      type: TuitionType.Regular,
      status: TuitionStatus.Billed,
    });
    // A different tenant's malformed legacy ref must not retain this empty lesson.
    await attendanceModel.create({
      teacherId: new Types.ObjectId(),
      classId,
      sessionId: empty._id,
      studentId: new Types.ObjectId(),
      status: AttendanceStatus.Present,
    });
    const expected = [partial, billed, manual].map(
      (session) => session.startTime,
    );
    const week = await schedules.getTeacherWeekSchedule(teacherId.toString(), {
      weekStart: '2026-08-24',
    });
    const history = await schedules.getClassScheduleHistory(
      teacherId.toString(),
      classId.toString(),
    );
    expect(week.events.map((event) => event.startTime)).toEqual(expected);
    expect(history.map((event) => event.startTime)).toEqual(expected);
    expect(await sessionModel.countDocuments({ classId })).toBe(4);
  });

  it('restores only the original fixed slot when an unattended move is withdrawn', async () => {
    const { teacherId, classId } = await fixture();
    await connection.model(ScheduleVersion.name).create({
      teacherId,
      classId,
      version: 1,
      effectiveFrom: lessonDate,
      effectiveTo: new Date('2026-08-30T00:00:00+07:00'),
      timeStorage: 'vietnam',
      schedules: [{ dayOfWeek: 3, startTime: '19:00', endTime: '20:30' }],
    });
    const movedDate = new Date('2026-08-28T00:00:00+07:00');
    const override = await overrideModel.create({
      teacherId,
      classId,
      action: ScheduleOverrideAction.Reschedule,
      originalDate: lessonDate,
      originalStartTime: '19:00',
      originalEndTime: '20:30',
      newDate: movedDate,
      startTime: '19:00',
      endTime: '20:30',
      timeStorage: 'vietnam',
    });
    await sessionModel.create({
      teacherId,
      classId,
      date: movedDate,
      startTime: '12:00',
      endTime: '13:30',
      timeStorage: 'utc',
      scheduleType: ScheduleType.Temporary,
      status: SessionStatus.Scheduled,
      topic: 'Nội dung buổi dời',
    });
    await classes.revokeTemporarySchedule(
      teacherId.toString(),
      classId.toString(),
      override._id.toString(),
    );
    const week = await schedules.getTeacherWeekSchedule(teacherId.toString(), {
      weekStart: '2026-08-24',
    });
    expect(week.events).toHaveLength(1);
    expect(week.events[0]).toMatchObject({
      type: 'fixed',
      date: '2026-08-26',
      startTime: '19:00',
    });
    expect(week.events[0].topic).toBeUndefined();
    expect(
      (
        await schedules.getClassScheduleHistory(
          teacherId.toString(),
          classId.toString(),
        )
      ).map((event) => event.date),
    ).toEqual(['2026-08-26']);
  });
});
