import { Test } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ScheduleConflictsService } from './schedule-conflicts.service';
import { ScheduleOverrideAction } from '../school-management/enums';
import { ScheduleSnapshot } from './schedule-conflict.engine';

const teacherId = new Types.ObjectId().toString();
const classId = new Types.ObjectId().toString();
const otherClassId = new Types.ObjectId().toString();
type QueryStub = {
  select: () => QueryStub;
  lean: () => QueryStub;
  exec: () => Promise<unknown>;
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
  const locks = { findOneAndUpdate: jest.fn(), deleteOne: jest.fn() };
  beforeEach(async () => {
    jest.resetAllMocks();
    classModel.find.mockReturnValue(
      query([{ _id: new Types.ObjectId(classId), name: 'Lớp A' }]),
    );
    versions.find.mockReturnValue(query([]));
    overrides.find.mockReturnValue(query([]));
    const module = await Test.createTestingModule({
      providers: [
        ScheduleConflictsService,
        { provide: getModelToken('Class'), useValue: classModel },
        { provide: getModelToken('ScheduleVersion'), useValue: versions },
        { provide: getModelToken('ScheduleOverride'), useValue: overrides },
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
