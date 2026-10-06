import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Types } from 'mongoose';
import { ClassesService } from './classes.service';
import { TakeAttendanceDto } from './dto/take-attendance.dto';
import { AttendanceStatus, SessionStatus } from '../school-management/enums';
import { ScheduleConflictsService } from '../schedules/schedule-conflicts.service';

const query = <T>(read: () => T) => ({
  exec: jest.fn(() => Promise.resolve(read())),
  session: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
});

describe('ClassesService clearing saved attendance', () => {
  const teacherId = new Types.ObjectId().toString();
  const classId = new Types.ObjectId().toString();
  const studentId = new Types.ObjectId().toString();
  const secondStudentId = new Types.ObjectId().toString();
  const attendanceId = new Types.ObjectId();
  let service: ClassesService;
  let session: {
    _id: Types.ObjectId;
    date: Date;
    status: SessionStatus;
    completedAt?: Date;
  };
  let records: Array<{
    _id: Types.ObjectId;
    studentId: Types.ObjectId;
    isBilled: boolean;
  }>;
  const dbSession = {
    withTransaction: jest.fn(async (write: () => Promise<void>) => write()),
    endSession: jest.fn(),
  };
  const classSessionModel = {
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  };
  const attendanceModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    exists: jest.fn(),
  };
  const tuitionEntryModel = {
    find: jest.fn(),
    deleteOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  const overrideId = new Types.ObjectId();
  const scheduleOverrideModel = { findOneAndDelete: jest.fn() };
  let scheduleConflicts: ScheduleConflictsService;

  const payload = (ids = [studentId]) => ({
    sessions: [
      plainToInstance(TakeAttendanceDto, {
        date: '2026-10-05',
        startTime: '09:00',
        endTime: '10:00',
        scheduleEventType: 'extra',
        records: ids.map((id) => ({ studentId: id, status: null })),
      }),
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    session = {
      _id: new Types.ObjectId(),
      date: new Date('2026-10-04T17:00:00Z'),
      status: SessionStatus.Completed,
      completedAt: new Date(),
    };
    records = [
      {
        _id: attendanceId,
        studentId: new Types.ObjectId(studentId),
        isBilled: false,
      },
    ];
    classSessionModel.findOneAndUpdate.mockImplementation(
      (_filter: unknown, update: { $set: Partial<typeof session> }) =>
        query(() => Object.assign(session, update.$set)),
    );
    classSessionModel.updateOne.mockImplementation(
      (
        _filter: unknown,
        update: {
          $set: Partial<typeof session>;
          $unset?: { completedAt?: string };
        },
      ) =>
        query(() => {
          Object.assign(session, update.$set);
          if (update.$unset?.completedAt !== undefined)
            delete session.completedAt;
          return { modifiedCount: 1 };
        }),
    );
    attendanceModel.findOne.mockImplementation(
      (filter: { studentId: Types.ObjectId }) =>
        query(
          () =>
            records.find((record) =>
              record.studentId.equals(filter.studentId),
            ) ?? null,
        ),
    );
    attendanceModel.deleteOne.mockImplementation(
      (filter: { _id: Types.ObjectId }) =>
        query(() => {
          records = records.filter((record) => !record._id.equals(filter._id));
          return { deletedCount: 1 };
        }),
    );
    attendanceModel.exists.mockImplementation(() =>
      query(() => records[0] ?? null),
    );
    tuitionEntryModel.find.mockReturnValue(query(() => []));
    tuitionEntryModel.deleteOne.mockReturnValue(
      query(() => ({ deletedCount: 1 })),
    );
    const unused = {} as never;
    classSessionModel.find.mockImplementation(() => query(() => [session]));
    scheduleOverrideModel.findOneAndDelete.mockReturnValue(
      query(() => ({ _id: overrideId })),
    );
    scheduleConflicts = new ScheduleConflictsService(
      unused,
      unused,
      unused,
      classSessionModel as never,
      attendanceModel as never,
      unused,
      { exists: jest.fn(() => query(() => null)) } as never,
    );
    jest
      .spyOn(scheduleConflicts, 'withTeacherWrite')
      .mockImplementation(async (_teacher, write) => write());
    jest.spyOn(scheduleConflicts, 'snapshot').mockResolvedValue({
      classes: new Map([[classId, 'Lớp kiểm thử']]),
      versions: [],
      overrides: [
        {
          id: overrideId.toString(),
          classId,
          action: 'extra',
          newDate: '2026-10-05',
          startTime: '09:00',
          endTime: '10:00',
        },
      ],
    });
    service = new ClassesService(
      { startSession: jest.fn(() => Promise.resolve(dbSession)) } as never,
      {
        findOne: jest.fn(() =>
          query(() => ({
            _id: new Types.ObjectId(classId),
            regularPrice: 100000,
            makeupPrice: 100000,
          })),
        ),
      } as never,
      { findOne: jest.fn(() => query(() => null)) } as never,
      {
        find: jest.fn(() =>
          query(() =>
            [studentId, secondStudentId].map((id) => ({
              studentId: new Types.ObjectId(id),
            })),
          ),
        ),
      } as never,
      unused,
      scheduleOverrideModel as never,
      classSessionModel as never,
      attendanceModel as never,
      tuitionEntryModel as never,
      unused,
      unused,
      unused,
      unused,
      scheduleConflicts,
    );
  });

  it('removes attendance and tuition and resets the session after every record is cleared', async () => {
    await service.takeAttendanceBatch(teacherId, classId, payload());

    expect(records).toEqual([]);
    expect(tuitionEntryModel.deleteOne).toHaveBeenCalledWith(
      {
        teacherId: new Types.ObjectId(teacherId),
        $or: [
          { attendanceId },
          { sessionId: session._id, studentId: new Types.ObjectId(studentId) },
        ],
      },
      { session: dbSession },
    );
    expect(session.status).toBe(SessionStatus.Scheduled);
    expect(session.completedAt).toBeUndefined();
    expect(classSessionModel.updateOne).toHaveBeenCalledWith(
      {
        _id: session._id,
        teacherId: new Types.ObjectId(teacherId),
        classId: new Types.ObjectId(classId),
      },
      {
        $set: { status: SessionStatus.Scheduled },
        $unset: { completedAt: '' },
      },
      { session: dbSession },
    );
  });

  it('accepts the null status sent by the attendance UI', async () => {
    expect(await validate(payload().sessions[0])).toEqual([]);
  });

  it('still completes the session and creates tuition when saving regular attendance', async () => {
    records = [];
    session.status = SessionStatus.Scheduled;
    attendanceModel.findOneAndUpdate.mockImplementation(() =>
      query(() => {
        const attendance = {
          _id: attendanceId,
          studentId: new Types.ObjectId(studentId),
          isBilled: false,
        };
        records.push(attendance);
        return attendance;
      }),
    );
    tuitionEntryModel.findOneAndUpdate.mockReturnValue(
      query(() => ({ _id: new Types.ObjectId() })),
    );
    const dto = payload();
    dto.sessions[0].records[0].status = AttendanceStatus.Present;
    await service.takeAttendanceBatch(teacherId, classId, dto);
    expect(session.status).toBe(SessionStatus.Completed);
    expect(tuitionEntryModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: expect.objectContaining({
          amount: 100000,
          attendanceId,
        }) as object,
      }),
      expect.objectContaining({ session: dbSession, upsert: true }),
    );

    await service.takeAttendanceBatch(teacherId, classId, payload());
    expect(records).toEqual([]);
    expect(session.status).toBe(SessionStatus.Scheduled);
  });

  it('keeps the session completed while another saved record remains', async () => {
    records.push({
      _id: new Types.ObjectId(),
      studentId: new Types.ObjectId(secondStudentId),
      isBilled: false,
    });
    await service.takeAttendanceBatch(teacherId, classId, payload());

    expect(records).toHaveLength(1);
    expect(session.status).toBe(SessionStatus.Completed);
    expect(attendanceModel.exists).toHaveBeenCalledWith({
      teacherId: new Types.ObjectId(teacherId),
      classId: new Types.ObjectId(classId),
      sessionId: session._id,
    });
    await expect(
      service.revokeTemporarySchedule(
        teacherId,
        classId,
        overrideId.toString(),
      ),
    ).rejects.toThrow('đã được điểm danh');
    expect(scheduleOverrideModel.findOneAndDelete).not.toHaveBeenCalled();
  });

  it('blocks revocation before clearing and permits it after clearing all saved attendance', async () => {
    await expect(
      service.revokeTemporarySchedule(
        teacherId,
        classId,
        overrideId.toString(),
      ),
    ).rejects.toThrow('đã được điểm danh');
    expect(scheduleOverrideModel.findOneAndDelete).not.toHaveBeenCalled();

    await service.takeAttendanceBatch(teacherId, classId, payload());
    await expect(
      service.revokeTemporarySchedule(
        teacherId,
        classId,
        overrideId.toString(),
      ),
    ).resolves.toMatchObject({ message: 'Đã thu hồi lịch tạm thời.' });
    expect(scheduleOverrideModel.findOneAndDelete).toHaveBeenCalledWith({
      _id: overrideId,
      teacherId: new Types.ObjectId(teacherId),
      classId: new Types.ObjectId(classId),
    });
  });

  it('also resets an empty legacy session when saving a blank cell', async () => {
    records = [];
    await service.takeAttendanceBatch(teacherId, classId, payload());
    expect(session.status).toBe(SessionStatus.Scheduled);
  });

  it('rejects clearing attendance already included in a receipt', async () => {
    records[0].isBilled = true;
    await expect(
      service.takeAttendanceBatch(teacherId, classId, payload()),
    ).rejects.toThrow('đã được xuất hóa đơn');
    expect(records).toHaveLength(1);
    expect(attendanceModel.deleteOne).not.toHaveBeenCalled();
    expect(tuitionEntryModel.deleteOne).not.toHaveBeenCalled();
    expect(classSessionModel.updateOne).not.toHaveBeenCalled();
  });

  it('rejects clearing when billed tuition exists even if the attendance flag is stale', async () => {
    tuitionEntryModel.find.mockReturnValue(
      query(() => [
        {
          attendanceId,
          sessionId: session._id,
          studentId: new Types.ObjectId(studentId),
        },
      ]),
    );
    await expect(
      service.takeAttendanceBatch(teacherId, classId, payload()),
    ).rejects.toThrow('đã được xuất hóa đơn');
    expect(attendanceModel.deleteOne).not.toHaveBeenCalled();
    expect(tuitionEntryModel.deleteOne).not.toHaveBeenCalled();
  });

  it('resets the status on the MongoDB standalone fallback path too', async () => {
    dbSession.withTransaction.mockRejectedValueOnce(
      new Error(
        'Transaction numbers are only allowed on a replica set member or mongos',
      ),
    );
    await service.takeAttendanceBatch(teacherId, classId, payload());
    expect(records).toEqual([]);
    expect(session.status).toBe(SessionStatus.Scheduled);
    expect(classSessionModel.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      { session: undefined },
    );
  });
});
