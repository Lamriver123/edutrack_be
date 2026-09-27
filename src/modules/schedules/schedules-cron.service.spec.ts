import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { SchedulesCronService } from './schedules-cron.service';
import { TeacherScheduleEventResponse } from './schedules.service';

function query<T>(value: T) {
  return {
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
}

describe('Scheduled push reminders', () => {
  const teacherId = new Types.ObjectId();
  const classId = new Types.ObjectId().toString();
  let events: TeacherScheduleEventResponse[];
  let users: { find: jest.Mock };
  let sessions: { findOne: jest.Mock };
  let emitter: { emitAsync: jest.Mock };
  let schedules: { getTeacherWeekSchedule: jest.Mock };
  let reminders: { claim: jest.Mock; finish: jest.Mock };
  let service: SchedulesCronService;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-27T17:30:00+07:00'));
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    events = [
      {
        id: 'slot',
        classId,
        className: 'Toán',
        classImageUrl: '',
        colorIndex: 0,
        date: '2026-09-27',
        dayOfWeek: 7,
        startTime: '18:00',
        endTime: '19:00',
        type: 'fixed',
      },
    ];
    users = { find: jest.fn().mockReturnValue(query([{ _id: teacherId }])) };
    sessions = { findOne: jest.fn().mockReturnValue(query(null)) };
    emitter = { emitAsync: jest.fn().mockResolvedValue([{ sent: 1 }]) };
    schedules = {
      getTeacherWeekSchedule: jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ days: [{ date: '2026-09-27' }], events }),
        ),
    };
    reminders = {
      claim: jest.fn().mockResolvedValue('lease'),
      finish: jest.fn().mockResolvedValue(undefined),
    };
    service = new SchedulesCronService(
      users as unknown as ConstructorParameters<typeof SchedulesCronService>[0],
      sessions as unknown as ConstructorParameters<
        typeof SchedulesCronService
      >[1],
      emitter as unknown as ConstructorParameters<
        typeof SchedulesCronService
      >[2],
      schedules as unknown as ConstructorParameters<
        typeof SchedulesCronService
      >[3],
      reminders as unknown as ConstructorParameters<
        typeof SchedulesCronService
      >[4],
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it.each(['17:30', '17:35', '17:45', '17:59'])(
    'sends pre-class reminders at %s Vietnam time including catch-up',
    async (time) => {
      jest.setSystemTime(new Date(`2026-09-27T${time}:00+07:00`));
      await service.handleCron();
      expect(emitter.emitAsync).toHaveBeenCalledWith(
        'notification.push',
        expect.objectContaining({
          userId: teacherId.toString(),
          payload: expect.objectContaining({
            url: `/classes/${classId}`,
            tag: expect.stringContaining(':pre-class') as unknown,
          }) as unknown,
        }),
      );
      expect(reminders.finish).toHaveBeenCalledWith(
        expect.any(String),
        'lease',
        true,
      );
    },
  );

  it.each(['17:29', '18:00', '18:09', '18:31', '19:00'])(
    'does not send outside reminder windows at %s',
    async (time) => {
      jest.setSystemTime(new Date(`2026-09-27T${time}:00+07:00`));
      await service.handleCron();
      expect(emitter.emitAsync).not.toHaveBeenCalled();
    },
  );

  it.each(['18:10', '18:15', '18:25', '18:30'])(
    'reminds unrecorded attendance at %s',
    async (time) => {
      jest.setSystemTime(new Date(`2026-09-27T${time}:00+07:00`));
      await service.handleCron();
      expect(emitter.emitAsync).toHaveBeenCalledWith(
        'notification.push',
        expect.objectContaining({
          payload: expect.objectContaining({
            url: `/classes/${classId}?tab=attendance`,
          }) as unknown,
        }),
      );
      expect(sessions.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          teacherId,
          classId: new Types.ObjectId(classId),
          status: { $in: ['completed', 'cancelled'] },
          $or: expect.arrayContaining([
            { sourceKey: `${classId}:2026-09-27:18:00:19:00` },
          ]) as unknown,
        }),
      );
    },
  );

  it('skips recorded/cancelled attendance and supports UTC/legacy session matching', async () => {
    jest.setSystemTime(new Date('2026-09-27T18:10:00+07:00'));
    sessions.findOne.mockReturnValue(query({ _id: 'completed' }));
    await service.handleCron();
    expect(emitter.emitAsync).not.toHaveBeenCalled();
    expect(sessions.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.arrayContaining([
          expect.objectContaining({
            $or: [
              { timeStorage: 'utc', startTime: '11:00', endTime: '12:00' },
              {
                timeStorage: { $ne: 'utc' },
                startTime: '18:00',
                endTime: '19:00',
              },
            ],
          }),
        ]) as unknown,
      }),
    );
  });

  it('does not remind attendance after a short lesson has ended', async () => {
    events[0].endTime = '18:15';
    jest.setSystemTime(new Date('2026-09-27T18:16:00+07:00'));
    await service.handleCron();
    expect(emitter.emitAsync).not.toHaveBeenCalled();
  });

  it('skips cancelled and incomplete schedule events', async () => {
    events[0].type = 'cancel';
    events.push({
      ...events[0],
      id: 'incomplete',
      type: 'fixed',
      startTime: undefined,
    });
    await service.handleCron();
    expect(emitter.emitAsync).not.toHaveBeenCalled();
  });

  it.each(['extra', 'reschedule', 'manual', 'one_on_one'] as const)(
    'sends for %s events returned by the calendar',
    async (type) => {
      events[0].type = type;
      await service.handleCron();
      expect(emitter.emitAsync).toHaveBeenCalledTimes(1);
    },
  );

  it.each([{ result: [] }, { result: [{ sent: 0 }] }, { result: [undefined] }])(
    'releases unsent reminders for retry when listener returns %j',
    async ({ result }) => {
      emitter.emitAsync
        .mockResolvedValueOnce(result)
        .mockResolvedValueOnce([{ sent: 1 }]);
      await service.handleCron();
      expect(reminders.finish).toHaveBeenLastCalledWith(
        expect.any(String),
        'lease',
        false,
      );
      expect(service.getStatus().lastError).toBe('push_delivery_failed');
      await service.handleCron();
      expect(reminders.finish).toHaveBeenLastCalledWith(
        expect.any(String),
        'lease',
        true,
      );
      expect(service.getStatus().lastError).toBeNull();
    },
  );

  it('releases a claim and reports status after delivery throws', async () => {
    emitter.emitAsync.mockRejectedValueOnce(new Error('network'));
    await service.handleCron();
    expect(reminders.finish).toHaveBeenCalledWith(
      expect.any(String),
      'lease',
      false,
    );
    expect(service.getStatus()).toEqual(
      expect.objectContaining({
        running: false,
        lastError: 'teacher_scan_failed',
        lastCompletedAt: expect.any(String) as unknown,
      }),
    );
  });

  it('does not send already claimed or delivered reminders', async () => {
    reminders.claim.mockResolvedValue(null);
    await service.handleCron();
    expect(emitter.emitAsync).not.toHaveBeenCalled();
    expect(reminders.finish).not.toHaveBeenCalled();
  });

  it('fetches both weeks for an upcoming Monday class near Sunday midnight', async () => {
    jest.setSystemTime(new Date('2026-09-27T23:50:00+07:00'));
    events[0] = {
      ...events[0],
      date: '2026-09-28',
      dayOfWeek: 1,
      startTime: '00:10',
      endTime: '01:00',
    };
    schedules.getTeacherWeekSchedule
      .mockResolvedValueOnce({ days: [{ date: '2026-09-27' }], events: [] })
      .mockResolvedValueOnce({ days: [{ date: '2026-09-28' }], events });
    await service.handleCron();
    expect(schedules.getTeacherWeekSchedule).toHaveBeenNthCalledWith(
      2,
      teacherId.toString(),
      { weekStart: '2026-09-28' },
    );
    expect(emitter.emitAsync).toHaveBeenCalledTimes(1);
  });

  it('does not overlap scans and recovers from a failed teacher query', async () => {
    let rejectQuery!: (reason: Error) => void;
    const pending = new Promise<never>((_, reject) => {
      rejectQuery = reject;
    });
    users.find.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      exec: () => pending,
    });
    const first = service.handleCron();
    await service.handleCron();
    expect(users.find).toHaveBeenCalledTimes(1);
    rejectQuery(new Error('database unavailable'));
    await first;
    expect(service.getStatus()).toEqual(
      expect.objectContaining({ running: false, lastError: 'scan_failed' }),
    );
    await service.handleCron();
    expect(emitter.emitAsync).toHaveBeenCalledTimes(1);
  });

  it('continues to another teacher when a calendar lookup fails', async () => {
    const otherTeacher = new Types.ObjectId();
    users.find.mockReturnValue(
      query([{ _id: teacherId }, { _id: otherTeacher }]),
    );
    schedules.getTeacherWeekSchedule.mockRejectedValueOnce(
      new Error('bad schedule'),
    );
    await service.handleCron();
    expect(emitter.emitAsync).toHaveBeenCalledWith(
      'notification.push',
      expect.objectContaining({ userId: otherTeacher.toString() }),
    );
  });

  it('records a heartbeat even with no subscriptions', async () => {
    users.find.mockReturnValue(query([]));
    await service.handleCron();
    expect(service.getStatus().lastCompletedAt).toEqual(
      new Date().toISOString(),
    );
    expect(schedules.getTeacherWeekSchedule).not.toHaveBeenCalled();
  });

  it('does not send stale pre-class reminders after a slow calendar query', async () => {
    jest.setSystemTime(new Date('2026-09-27T17:59:00+07:00'));
    schedules.getTeacherWeekSchedule.mockImplementationOnce(() => {
      jest.setSystemTime(new Date('2026-09-27T18:01:00+07:00'));
      return Promise.resolve({ days: [{ date: '2026-09-27' }], events });
    });
    await service.handleCron();
    expect(emitter.emitAsync).not.toHaveBeenCalled();
  });

  it.each(['17:59', '18:29'])(
    'rechecks the delivery window after a delayed lease at %s',
    async (time) => {
      jest.setSystemTime(new Date(`2026-09-27T${time}:00+07:00`));
      reminders.claim.mockImplementationOnce(() => {
        jest.setSystemTime(Date.now() + 120_000);
        return Promise.resolve('lease');
      });
      await service.handleCron();
      expect(emitter.emitAsync).not.toHaveBeenCalled();
      expect(reminders.finish).toHaveBeenCalledWith(
        expect.any(String),
        'lease',
        false,
      );
    },
  );
});
