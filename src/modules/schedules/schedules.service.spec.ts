import { Types } from 'mongoose';
import { SchedulesService } from './schedules.service';

type QueryStub = {
  sort: () => QueryStub;
  select: () => QueryStub;
  lean: () => QueryStub;
  exec: () => Promise<unknown>;
};

type ModelData = {
  find?: unknown;
  findOne?: unknown;
};

function query(data: unknown): QueryStub {
  const chain: QueryStub = {
    sort: () => chain,
    select: () => chain,
    lean: () => chain,
    exec: () => Promise.resolve(data),
  };

  return chain;
}

function model<T>(data: unknown): T {
  const shaped =
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    (Object.prototype.hasOwnProperty.call(data, 'find') ||
      Object.prototype.hasOwnProperty.call(data, 'findOne'))
      ? (data as ModelData)
      : { find: data };
  const findData = shaped.find;
  let defaultFindOneData: unknown = findData;

  if (Array.isArray(findData)) {
    defaultFindOneData = (findData as unknown[])[0] ?? null;
  }

  return {
    find: () => query(findData),
    findOne: () => query(shaped.findOne ?? defaultFindOneData ?? null),
  } as T;
}

describe('Teacher calendar source exclusion', () => {
  it('moves only the selected fixed slot and returns original Vietnam time to both calendars', async () => {
    const teacherId = new Types.ObjectId().toString();
    const classId = new Types.ObjectId();
    const service = new SchedulesService(
      model([{ _id: classId, name: 'Lớp A' }]),
      model([
        {
          _id: new Types.ObjectId(),
          classId,
          version: 1,
          effectiveFrom: new Date('2026-09-01T00:00:00+07:00'),
          timeStorage: 'utc',
          schedules: [
            { dayOfWeek: 7, startTime: '22:00', endTime: '23:00' },
            { dayOfWeek: 1, startTime: '04:00', endTime: '05:00' },
          ],
        },
      ]),
      model([
        {
          _id: new Types.ObjectId(),
          classId,
          action: 'reschedule',
          originalDate: new Date('2026-09-07T00:00:00+07:00'),
          newDate: new Date('2026-09-07T00:00:00+07:00'),
          timeStorage: 'utc',
          originalStartTime: '22:00',
          originalEndTime: '23:00',
          startTime: '22:30',
          endTime: '23:30',
        },
      ]),
      model([]),
    );
    const result = await service.getTeacherWeekSchedule(teacherId, {
      weekStart: '2026-09-07',
    });
    const events = result.events.filter((e) => e.date === '2026-09-07');
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      type: 'reschedule',
      startTime: '05:30',
      endTime: '06:30',
      originalStartTime: '05:00',
      originalEndTime: '06:00',
    });
    expect(events[1]).toMatchObject({
      type: 'fixed',
      startTime: '11:00',
      endTime: '12:00',
    });
  });

  it('returns extra schedules for attendance even when the class has no fixed version', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-05T04:00:00.000Z'));

    try {
      const teacherId = new Types.ObjectId().toString();
      const classId = new Types.ObjectId();
      const overrideId = new Types.ObjectId();
      const service = new SchedulesService(
        model({
          findOne: { _id: classId, name: 'Lớp học thêm', colorIndex: 2 },
        }),
        model({ find: [], findOne: null }),
        model({
          find: [
            {
              _id: overrideId,
              classId,
              action: 'extra',
              newDate: new Date('2026-09-05T00:00:00+07:00'),
              timeStorage: 'utc',
              startTime: '01:00',
              endTime: '02:30',
              reason: 'Học bù đầu tiên',
            },
          ],
          findOne: { newDate: new Date('2026-09-05T00:00:00+07:00') },
        }),
        model({ find: [], findOne: null }),
      );

      const result = await service.getClassScheduleHistory(
        teacherId,
        classId.toString(),
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: `extra:${overrideId.toString()}:2026-09-05`,
        classId: classId.toString(),
        className: 'Lớp học thêm',
        date: '2026-09-05',
        startTime: '08:00',
        endTime: '09:30',
        type: 'extra',
        reason: 'Học bù đầu tiên',
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('keeps standalone class sessions visible in attendance history', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-05T04:00:00.000Z'));

    try {
      const teacherId = new Types.ObjectId().toString();
      const classId = new Types.ObjectId();
      const sessionId = new Types.ObjectId();
      const service = new SchedulesService(
        model({
          findOne: { _id: classId, name: 'Lớp đã điểm danh', colorIndex: 1 },
        }),
        model({ find: [], findOne: null }),
        model({ find: [], findOne: null }),
        model({
          find: [
            {
              _id: sessionId,
              classId,
              date: new Date('2026-09-04T00:00:00+07:00'),
              timeStorage: 'utc',
              startTime: '12:00',
              endTime: '13:30',
              scheduleType: 'manual',
              topic: 'Ôn tập',
              content: 'Buổi đã ghi nhận',
            },
          ],
          findOne: { date: new Date('2026-09-04T00:00:00+07:00') },
        }),
      );

      const result = await service.getClassScheduleHistory(
        teacherId,
        classId.toString(),
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: `session:${sessionId.toString()}:2026-09-04:19:00:20:30`,
        classId: classId.toString(),
        className: 'Lớp đã điểm danh',
        date: '2026-09-04',
        startTime: '19:00',
        endTime: '20:30',
        type: 'manual',
        topic: 'Ôn tập',
        content: 'Buổi đã ghi nhận',
      });
    } finally {
      jest.useRealTimers();
    }
  });
});
