import { Test } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ScheduleConflictsService } from './schedule-conflicts.service';
import {
  ScheduleOverrideAction,
  SessionStatus,
  TuitionStatus,
} from '../school-management/enums';
import { ScheduleSnapshot } from './schedule-conflict.engine';

const teacherId = new Types.ObjectId().toString();
const classId = new Types.ObjectId().toString();
const otherClassId = new Types.ObjectId().toString();
type QueryStub = {
  select: () => QueryStub;
  lean: () => QueryStub;
  exec: () => Promise<unknown>;
};
type SessionQueryFilter = {
  $or: Array<{
    sourceKey?: string;
    timeStorage?: string | { $ne: string };
    startTime?: string;
    endTime?: string;
  }>;
};
const query = (data: unknown): QueryStub => {
  const chain: QueryStub = {
    select: jest.fn(() => chain),
    lean: jest.fn(() => chain),
    exec: jest.fn().mockResolvedValue(data),
  };
  return chain;
};

describe('ScheduleConflictsService', () => {
  let service: ScheduleConflictsService;
  const classModel = { find: jest.fn() };
  const versions = { find: jest.fn() };
  const overrides = { find: jest.fn() };
  const classSessions = { find: jest.fn() };
  const attendances = { exists: jest.fn() };
  const tuitionEntries = { exists: jest.fn() };
  const locks = { findOneAndUpdate: jest.fn(), deleteOne: jest.fn() };
  const getLastSessionFilter = () => {
    const calls = classSessions.find.mock.calls as unknown as Array<
      [SessionQueryFilter]
    >;
    const lastCall = calls.at(-1);

    if (!lastCall) {
      throw new Error('Expected ClassSession.find to be called.');
    }

    return lastCall[0];
  };
  beforeEach(async () => {
    jest.resetAllMocks();
    classModel.find.mockReturnValue(
      query([{ _id: new Types.ObjectId(classId), name: 'Lớp A' }]),
    );
    versions.find.mockReturnValue(query([]));
    overrides.find.mockReturnValue(query([]));
    classSessions.find.mockReturnValue(query([]));
    attendances.exists.mockReturnValue(query(null));
    tuitionEntries.exists.mockReturnValue(query(null));
    const module = await Test.createTestingModule({
      providers: [
        ScheduleConflictsService,
        { provide: getModelToken('Class'), useValue: classModel },
        { provide: getModelToken('ScheduleVersion'), useValue: versions },
        { provide: getModelToken('ScheduleOverride'), useValue: overrides },
        { provide: getModelToken('ClassSession'), useValue: classSessions },
        { provide: getModelToken('Attendance'), useValue: attendances },
        { provide: getModelToken('TuitionEntry'), useValue: tuitionEntries },
        {
          provide: getConnectionToken(),
          useValue: { collection: () => locks },
        },
      ],
    }).compile();
    service = module.get(ScheduleConflictsService);
  });
  it('resolves Nest model dependencies and scopes all reads to JWT teacher and owned classes', async () => {
    await service.snapshot(teacherId, classId);
    expect(classModel.find).toHaveBeenCalledWith(
      expect.objectContaining({ teacherId: new Types.ObjectId(teacherId) }),
    );
    for (const model of [versions, overrides])
      expect(model.find).toHaveBeenCalledWith({
        teacherId: new Types.ObjectId(teacherId),
        classId: { $in: [new Types.ObjectId(classId)] },
      });
  });
  it('rejects classes not owned by the teacher before schedule reads', async () => {
    await expect(service.snapshot(teacherId, otherClassId)).rejects.toThrow(
      'Không tìm thấy lớp',
    );
    expect(versions.find).not.toHaveBeenCalled();
  });
  it('converts UTC early-morning weekly times back to the correct Vietnam weekday', async () => {
    versions.find.mockReturnValue(
      query([
        {
          _id: new Types.ObjectId(),
          classId: new Types.ObjectId(classId),
          version: 1,
          effectiveFrom: new Date('2026-09-06T17:00:00Z'),
          timeStorage: 'utc',
          schedules: [{ dayOfWeek: 7, startTime: '22:00', endTime: '23:00' }],
        },
      ]),
    );
    const data = await service.snapshot(teacherId, classId);
    expect(data.versions[0]).toMatchObject({
      from: '2026-09-07',
      schedules: [{ dayOfWeek: 1, startTime: '05:00', endTime: '06:00' }],
    });
  });
  it('keeps legacy Vietnam times unchanged', async () => {
    overrides.find.mockReturnValue(
      query([
        {
          _id: new Types.ObjectId(),
          classId: new Types.ObjectId(classId),
          action: 'extra',
          newDate: new Date('2026-09-06T17:00:00Z'),
          startTime: '05:00',
          endTime: '06:00',
        },
      ]),
    );
    expect(
      (await service.snapshot(teacherId, classId)).overrides[0].startTime,
    ).toBe('05:00');
  });
  it('rejects exclusion of another class override', async () => {
    await expect(
      service.checkTemporary(
        teacherId,
        classId,
        {
          action: ScheduleOverrideAction.Extra,
          newDate: '2026-09-07',
          startTime: '10:00',
          endTime: '11:00',
        },
        'foreign-id',
      ),
    ).rejects.toThrow('Không tìm thấy lịch tạm');
  });
  it('blocks restoring a fixed source now occupied by another class', async () => {
    const data: ScheduleSnapshot = {
      classes: new Map([
        [classId, 'Lớp A'],
        [otherClassId, 'Lớp B'],
      ]),
      versions: [
        {
          id: 'v1',
          classId,
          version: 1,
          from: '2026-09-01',
          schedules: [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }],
        },
      ],
      overrides: [
        {
          id: 'cancel',
          classId,
          action: 'cancel',
          originalDate: '2026-09-07',
          startTime: '09:00',
          endTime: '10:00',
        },
        {
          id: 'extra',
          classId: otherClassId,
          action: 'extra',
          newDate: '2026-09-07',
          startTime: '09:00',
          endTime: '10:00',
        },
      ],
    };
    jest.spyOn(service, 'snapshot').mockResolvedValue(data);
    await expect(
      service.assertCanRevoke(teacherId, classId, 'cancel'),
    ).rejects.toThrow('Trùng lịch');
  });
  it('blocks cancelling every fixed lesson in a day when one was attended', async () => {
    attendances.exists.mockReturnValue(query({ _id: new Types.ObjectId() }));
    versions.find.mockReturnValue(
      query([
        {
          _id: new Types.ObjectId(),
          classId: new Types.ObjectId(classId),
          version: 1,
          effectiveFrom: new Date('2026-08-31T17:00:00.000Z'),
          schedules: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '10:00' },
            { dayOfWeek: 1, startTime: '14:00', endTime: '15:00' },
          ],
        },
      ]),
    );
    classSessions.find.mockReturnValue(
      query([{ _id: new Types.ObjectId(), status: SessionStatus.Completed }]),
    );

    await expect(
      service.checkTemporary(teacherId, classId, {
        action: ScheduleOverrideAction.Cancel,
        originalDate: '2026-09-07',
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'SCHEDULE_ATTENDANCE_LOCKED',
      }) as object,
      status: 409,
    });

    expect(
      getLastSessionFilter().$or.flatMap((entry) =>
        entry.sourceKey ? [entry.sourceKey] : [],
      ),
    ).toEqual(
      expect.arrayContaining([
        `${classId}:2026-09-07:09:00:10:00`,
        `${classId}:2026-09-07:14:00:15:00`,
      ]),
    );
  });
  it('blocks creating a reschedule for a fixed lesson already attended', async () => {
    attendances.exists.mockReturnValue(query({ _id: new Types.ObjectId() }));
    versions.find.mockReturnValue(
      query([
        {
          _id: new Types.ObjectId(),
          classId: new Types.ObjectId(classId),
          version: 1,
          effectiveFrom: new Date('2026-08-31T17:00:00.000Z'),
          schedules: [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }],
        },
      ]),
    );
    classSessions.find.mockReturnValue(
      query([{ _id: new Types.ObjectId(), status: SessionStatus.Completed }]),
    );

    await expect(
      service.checkTemporary(teacherId, classId, {
        action: ScheduleOverrideAction.Reschedule,
        originalDate: '2026-09-07',
        originalStartTime: '09:00',
        originalEndTime: '10:00',
        newDate: '2026-09-08',
        startTime: '11:00',
        endTime: '12:00',
      }),
    ).rejects.toThrow('đã được điểm danh');
  });
  it('blocks revoking an attended temporary lesson and normalizes UTC times', async () => {
    attendances.exists.mockReturnValue(query({ _id: new Types.ObjectId() }));
    const overrideId = new Types.ObjectId().toString();
    overrides.find.mockReturnValue(
      query([
        {
          _id: new Types.ObjectId(overrideId),
          classId: new Types.ObjectId(classId),
          action: ScheduleOverrideAction.Extra,
          newDate: new Date('2026-09-06T17:00:00.000Z'),
          startTime: '02:00',
          endTime: '03:00',
          timeStorage: 'utc',
        },
      ]),
    );
    classSessions.find.mockReturnValue(
      query([{ _id: new Types.ObjectId(), status: SessionStatus.Completed }]),
    );

    await expect(
      service.assertCanRevoke(teacherId, classId, overrideId),
    ).rejects.toThrow('không thể hủy, dời hoặc thu hồi lịch');

    const sessionFilters = getLastSessionFilter().$or;
    expect(sessionFilters).toContainEqual(
      expect.objectContaining({
        sourceKey: `${classId}:2026-09-07:09:00:10:00`,
      }),
    );
    expect(sessionFilters).toContainEqual(
      expect.objectContaining({
        timeStorage: 'utc',
        startTime: '02:00',
        endTime: '03:00',
      }),
    );
  });
  it('checks the old target before editing a rescheduled lesson', async () => {
    attendances.exists.mockReturnValue(query({ _id: new Types.ObjectId() }));
    const overrideId = 'rescheduled-lesson';
    const snapshot: ScheduleSnapshot = {
      classes: new Map([[classId, 'Lớp A']]),
      versions: [
        {
          id: 'v1',
          classId,
          version: 1,
          from: '2026-09-01',
          schedules: [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }],
        },
      ],
      overrides: [
        {
          id: overrideId,
          classId,
          action: 'reschedule',
          originalDate: '2026-09-07',
          originalStartTime: '09:00',
          originalEndTime: '10:00',
          newDate: '2026-09-08',
          startTime: '11:00',
          endTime: '12:00',
        },
      ],
    };
    jest.spyOn(service, 'snapshot').mockResolvedValue(snapshot);
    classSessions.find.mockReturnValue(
      query([{ _id: new Types.ObjectId(), status: SessionStatus.Completed }]),
    );

    await expect(
      service.checkTemporary(
        teacherId,
        classId,
        {
          action: ScheduleOverrideAction.Reschedule,
          originalDate: '2026-09-07',
          originalStartTime: '09:00',
          originalEndTime: '10:00',
          newDate: '2026-09-09',
          startTime: '13:00',
          endTime: '14:00',
        },
        overrideId,
      ),
    ).rejects.toThrow('đã được điểm danh');

    expect(getLastSessionFilter().$or).toContainEqual(
      expect.objectContaining({
        sourceKey: `${classId}:2026-09-08:11:00:12:00`,
      }),
    );
  });
  it('allows changing a scheduled lesson that has no attendance records', async () => {
    classSessions.find.mockReturnValue(
      query([{ _id: new Types.ObjectId(), status: SessionStatus.Scheduled }]),
    );

    await expect(
      service.checkTemporary(teacherId, classId, {
        action: ScheduleOverrideAction.Extra,
        newDate: '2026-09-07',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ).resolves.toMatchObject({ blockingConflicts: [] });
    expect(attendances.exists).toHaveBeenCalled();
  });
  it.each([ScheduleOverrideAction.Cancel, ScheduleOverrideAction.Reschedule])(
    'allows %s of a legacy completed fixed lesson after all attendance was cleared',
    async (action) => {
      versions.find.mockReturnValue(
        query([
          {
            _id: new Types.ObjectId(),
            classId: new Types.ObjectId(classId),
            version: 1,
            effectiveFrom: new Date('2026-08-31T17:00:00Z'),
            schedules: [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }],
          },
        ]),
      );
      classSessions.find.mockReturnValue(
        query([{ _id: new Types.ObjectId(), status: SessionStatus.Completed }]),
      );
      await expect(
        service.checkTemporary(teacherId, classId, {
          action,
          originalDate: '2026-09-07',
          originalStartTime: '09:00',
          originalEndTime: '10:00',
          ...(action === ScheduleOverrideAction.Reschedule
            ? {
                newDate: '2026-09-08',
                startTime: '11:00',
                endTime: '12:00',
              }
            : { startTime: '09:00', endTime: '10:00' }),
        }),
      ).resolves.toMatchObject({ blockingConflicts: [] });
      expect(attendances.exists).toHaveBeenCalled();
    },
  );
  it('allows revoking an extra lesson with stale completed status but no attendance', async () => {
    const overrideId = new Types.ObjectId().toString();
    overrides.find.mockReturnValue(
      query([
        {
          _id: new Types.ObjectId(overrideId),
          classId: new Types.ObjectId(classId),
          action: ScheduleOverrideAction.Extra,
          newDate: new Date('2026-09-06T17:00:00Z'),
          startTime: '09:00',
          endTime: '10:00',
          timeStorage: 'vietnam',
        },
      ]),
    );
    classSessions.find.mockReturnValue(
      query([{ _id: new Types.ObjectId(), status: SessionStatus.Completed }]),
    );
    await expect(
      service.assertCanRevoke(teacherId, classId, overrideId),
    ).resolves.toBeUndefined();
    await expect(
      service.assertOverridesNotAttended(teacherId, classId, [overrideId]),
    ).resolves.toBeUndefined();
  });
  it('blocks legacy sessions that have attendance records but are not completed', async () => {
    classSessions.find.mockReturnValue(
      query([{ _id: new Types.ObjectId(), status: SessionStatus.Scheduled }]),
    );
    attendances.exists.mockReturnValue(query({ _id: new Types.ObjectId() }));

    await expect(
      service.checkTemporary(teacherId, classId, {
        action: ScheduleOverrideAction.Extra,
        newDate: '2026-09-07',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ).rejects.toThrow('đã được điểm danh');
    expect(attendances.exists).toHaveBeenCalledWith({
      teacherId: new Types.ObjectId(teacherId),
      classId: new Types.ObjectId(classId),
      sessionId: { $in: [expect.any(Types.ObjectId) as Types.ObjectId] },
    });
  });
  it('keeps billed lessons locked even if their attendance record is missing', async () => {
    const sessionId = new Types.ObjectId();
    classSessions.find.mockReturnValue(
      query([{ _id: sessionId, status: SessionStatus.Scheduled }]),
    );
    tuitionEntries.exists.mockReturnValue(query({ _id: new Types.ObjectId() }));
    await expect(
      service.checkTemporary(teacherId, classId, {
        action: ScheduleOverrideAction.Extra,
        newDate: '2026-09-07',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ).rejects.toThrow('đã được điểm danh');
    expect(tuitionEntries.exists).toHaveBeenCalledWith({
      teacherId: new Types.ObjectId(teacherId),
      classId: new Types.ObjectId(classId),
      sessionId: { $in: [sessionId] },
      status: TuitionStatus.Billed,
    });
  });
  it('blocks bulk removal when a suspended schedule would delete an attended override', async () => {
    attendances.exists.mockReturnValue(query({ _id: new Types.ObjectId() }));
    const firstId = new Types.ObjectId().toString();
    const secondId = new Types.ObjectId().toString();
    overrides.find.mockReturnValue(
      query([
        {
          _id: new Types.ObjectId(firstId),
          classId: new Types.ObjectId(classId),
          action: ScheduleOverrideAction.Extra,
          newDate: new Date('2026-09-06T17:00:00.000Z'),
          startTime: '02:00',
          endTime: '03:00',
          timeStorage: 'utc',
        },
        {
          _id: new Types.ObjectId(secondId),
          classId: new Types.ObjectId(classId),
          action: ScheduleOverrideAction.Reschedule,
          originalDate: new Date('2026-09-07T17:00:00.000Z'),
          originalStartTime: '02:00',
          originalEndTime: '03:00',
          newDate: new Date('2026-09-08T17:00:00.000Z'),
          startTime: '04:00',
          endTime: '05:00',
          timeStorage: 'utc',
        },
      ]),
    );
    classSessions.find.mockReturnValue(
      query([{ _id: new Types.ObjectId(), status: SessionStatus.Completed }]),
    );

    await expect(
      service.assertOverridesNotAttended(teacherId, classId, [
        firstId,
        secondId,
      ]),
    ).rejects.toThrow('đã được điểm danh');

    expect(
      getLastSessionFilter().$or.flatMap((entry) =>
        entry.sourceKey ? [entry.sourceKey] : [],
      ),
    ).toEqual(
      expect.arrayContaining([
        `${classId}:2026-09-07:09:00:10:00`,
        `${classId}:2026-09-08:09:00:10:00`,
        `${classId}:2026-09-09:11:00:12:00`,
      ]),
    );
  });
  it('rejects bulk removal when an override belongs to another class', async () => {
    const overrideId = 'foreign-override';
    jest.spyOn(service, 'snapshot').mockResolvedValue({
      classes: new Map([
        [classId, 'Lớp A'],
        ['foreign-class', 'Lớp B'],
      ]),
      versions: [],
      overrides: [
        {
          id: overrideId,
          classId: 'foreign-class',
          action: 'extra',
          newDate: '2026-09-07',
          startTime: '09:00',
          endTime: '10:00',
        },
      ],
    });

    await expect(
      service.assertOverridesNotAttended(teacherId, classId, [overrideId]),
    ).rejects.toThrow('Không tìm thấy lịch tạm thời');
    expect(classSessions.find).not.toHaveBeenCalled();
  });
  it('does not run a second mutation while another teacher write lease exists', async () => {
    locks.findOneAndUpdate.mockRejectedValue({ code: 11000 });
    const mutation = jest.fn();
    await expect(service.withTeacherWrite(teacherId, mutation)).rejects.toThrow(
      'thay đổi lịch khác',
    );
    expect(mutation).not.toHaveBeenCalled();
  });
  it('releases the teacher lock when saving fails', async () => {
    await expect(
      service.withTeacherWrite(teacherId, () =>
        Promise.reject(new Error('write failed')),
      ),
    ).rejects.toThrow('write failed');
    expect(locks.deleteOne).toHaveBeenCalledWith({
      _id: new Types.ObjectId(teacherId),
      token: expect.any(String) as string,
    });
  });
});
