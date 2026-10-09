import { ConflictException, ValidationPipe } from '@nestjs/common';
import { Types } from 'mongoose';
import { ClassesService } from './classes.service';
import { CreateTemporaryScheduleDto } from './dto/create-temporary-schedule.dto';
import { CheckTemporaryScheduleDto } from '../schedules/dto/check-schedule.dto';
import {
  ScheduleOverrideAction,
  ScheduleType,
} from '../school-management/enums';

const teacherId = new Types.ObjectId();
const classId = new Types.ObjectId();
const overrideId = new Types.ObjectId();
const body = {
  action: ScheduleOverrideAction.Extra,
  newDate: '2026-10-09',
  startTime: '06:00',
  endTime: '07:30',
};
const query = <T>(value: T) => ({ exec: jest.fn().mockResolvedValue(value) });

function fixture() {
  const classroom = { _id: classId };
  const classModel = { findOne: jest.fn().mockReturnValue(query(classroom)) };
  const overrides = {
    create: jest
      .fn()
      .mockImplementation((records: Record<string, unknown>[]) =>
        Promise.resolve([{ _id: overrideId, ...records[0] }]),
      ),
    deleteOne: jest.fn().mockReturnValue(query({ deletedCount: 1 })),
  };
  const sessions = {
    findOneAndUpdate: jest
      .fn()
      .mockImplementation(
        (_filter: unknown, update: { $set: Record<string, unknown> }) =>
          query({ _id: new Types.ObjectId(), ...update.$set }),
      ),
  };
  const conflicts = {
    withTeacherWrite: jest.fn(
      (_teacherId: string, write: () => Promise<unknown>) => write(),
    ),
    checkTemporary: jest.fn().mockResolvedValue({
      blockingConflicts: [],
      warnings: [],
      originalStartTime: '06:00',
      originalEndTime: '07:30',
    }),
    assertAvailable: jest.fn(),
  };
  const unused = {} as never;
  const service = new ClassesService(
    unused,
    classModel as never,
    unused,
    unused,
    unused,
    overrides as never,
    sessions as never,
    unused,
    unused,
    unused,
    unused,
    unused,
    unused,
    conflicts as never,
  );
  return { service, overrides, sessions, conflicts };
}

describe('Temporary schedule with initial lesson content', () => {
  it.each([
    [ScheduleOverrideAction.Extra, ScheduleType.Extra],
    [ScheduleOverrideAction.OneOnOne, ScheduleType.OneOnOne],
    [ScheduleOverrideAction.Reschedule, ScheduleType.Temporary],
  ])(
    'saves %s content in the matching tenant/session with UTC hours',
    async (action, scheduleType) => {
      const { service, sessions } = fixture();
      const result = await service.createTemporarySchedule(
        teacherId.toString(),
        classId.toString(),
        {
          ...body,
          action,
          originalDate: '2026-10-08',
          topic: '  Ôn tập chương 1  ',
          content: '  Giải phương trình\nBài tập về nhà  ',
        },
      );
      expect(result).toMatchObject({
        id: overrideId.toString(),
        startTime: '06:00',
        endTime: '07:30',
      });
      expect(sessions.findOneAndUpdate).toHaveBeenCalledWith(
        {
          teacherId,
          classId,
          sourceKey: `${classId.toString()}:2026-10-09:06:00:07:30`,
        },
        {
          $set: expect.objectContaining({
            teacherId,
            classId,
            date: new Date('2026-10-08T17:00:00Z'),
            startTime: '23:00',
            endTime: '00:30',
            timeStorage: 'utc',
            scheduleType,
            topic: 'Ôn tập chương 1',
            content: 'Giải phương trình\nBài tập về nhà',
          }) as unknown,
        },
        expect.objectContaining({ upsert: true }),
      );
    },
  );

  it('keeps content optional and does not materialize an empty session', async () => {
    const { service, sessions } = fixture();
    await service.createTemporarySchedule(
      teacherId.toString(),
      classId.toString(),
      {
        ...body,
        topic: '  ',
        content: '\n ',
      },
    );
    await service.createTemporarySchedule(
      teacherId.toString(),
      classId.toString(),
      {
        action: ScheduleOverrideAction.Cancel,
        originalDate: '2026-10-09',
        topic: 'Ignored for cancellation',
      },
    );
    expect(sessions.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('rolls back the new override when content cannot be saved', async () => {
    const { service, sessions, overrides } = fixture();
    const error = new Error('Content write failed');
    sessions.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockRejectedValue(error),
    });
    await expect(
      service.createTemporarySchedule(
        teacherId.toString(),
        classId.toString(),
        {
          ...body,
          content: 'Bài tập',
        },
      ),
    ).rejects.toBe(error);
    expect(overrides.deleteOne).toHaveBeenCalledWith({
      _id: overrideId,
      teacherId,
      classId,
    });
  });

  it('does not save either record when conflict checking blocks creation', async () => {
    const { service, conflicts, overrides, sessions } = fixture();
    conflicts.assertAvailable.mockImplementation(() => {
      throw new ConflictException('Trùng lịch');
    });
    await expect(
      service.createTemporarySchedule(
        teacherId.toString(),
        classId.toString(),
        {
          ...body,
          content: 'Bài tập',
        },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(overrides.create).not.toHaveBeenCalled();
    expect(sessions.findOneAndUpdate).not.toHaveBeenCalled();
  });
});

describe('Initial lesson content validation', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  it('accepts content in both the creation and precheck requests', async () => {
    for (const metatype of [
      CreateTemporaryScheduleDto,
      CheckTemporaryScheduleDto,
    ]) {
      const request = {
        ...body,
        ...(metatype === CheckTemporaryScheduleDto
          ? { classId: classId.toString() }
          : {}),
        topic: 'Ôn tập',
        content: 'Bài tập về nhà',
      };
      await expect(
        pipe.transform(request, { type: 'body', metatype }),
      ).resolves.toMatchObject(request);
    }
  });

  it.each([
    { topic: 'x'.repeat(161) },
    { content: 'x'.repeat(1201) },
    { content: 123 },
  ])('rejects invalid content: %j', async (fields) => {
    await expect(
      pipe.transform(
        { ...body, ...fields },
        { type: 'body', metatype: CreateTemporaryScheduleDto },
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
});
