import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ClassesService } from './classes.service';

const resolvedQuery = <T>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
  session: jest.fn().mockReturnThis(),
});

describe('ClassesService schedule attendance guard', () => {
  it('does not delete overrides or suspend the fixed schedule when attendance blocks removal', async () => {
    const teacherId = new Types.ObjectId().toString();
    const classId = new Types.ObjectId().toString();
    const overrideId = new Types.ObjectId();
    const classroom = { _id: new Types.ObjectId(classId) };
    const activeVersion = {
      effectiveTo: null,
      save: jest.fn(),
    };
    const orphanedOverride = { _id: overrideId };
    const classModel = {
      findOne: jest.fn().mockReturnValue(resolvedQuery(classroom)),
    };
    const scheduleVersionModel = {
      findOne: jest.fn().mockReturnValue(resolvedQuery(activeVersion)),
    };
    const deleteQuery = resolvedQuery({ deletedCount: 1 });
    const scheduleOverrideModel = {
      find: jest.fn().mockReturnValue(resolvedQuery([orphanedOverride])),
      deleteMany: jest.fn().mockReturnValue(deleteQuery),
    };
    const attendanceConflict = new ConflictException({
      code: 'SCHEDULE_ATTENDANCE_LOCKED',
      message: 'Buổi học đã được điểm danh.',
    });
    const scheduleConflicts = {
      withTeacherWrite: jest.fn(
        (_teacherId: string, write: () => Promise<unknown>) => write(),
      ),
      assertOverridesNotAttended: jest
        .fn()
        .mockRejectedValue(attendanceConflict),
    };
    const unused = {} as never;
    const service = new ClassesService(
      unused,
      classModel as never,
      unused,
      unused,
      scheduleVersionModel as never,
      scheduleOverrideModel as never,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      scheduleConflicts as never,
    );

    await expect(
      service.suspendFixedSchedule(teacherId, classId, {
        suspendFrom: '2026-09-01',
      }),
    ).rejects.toBe(attendanceConflict);

    expect(scheduleConflicts.assertOverridesNotAttended).toHaveBeenCalledWith(
      teacherId,
      classId,
      [overrideId.toString()],
    );
    expect(scheduleOverrideModel.deleteMany).not.toHaveBeenCalled();
    expect(activeVersion.save).not.toHaveBeenCalled();
  });
});
