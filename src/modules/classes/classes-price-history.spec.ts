import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ClassesService } from './classes.service';
import { ClassStatus } from '../school-management/enums';

const teacherId = new Types.ObjectId();
const classId = new Types.ObjectId();
const classroom = { _id: classId, regularPrice: 150000, makeupPrice: 180000 };

function fixture(
  ownedClass: typeof classroom | null = classroom,
  versions: unknown[] = [],
) {
  const classes = {
    findOne: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(ownedClass) }),
  };
  const priceQuery = {
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(versions),
  };
  const prices = { find: jest.fn().mockReturnValue(priceQuery) };
  const unused = {} as never;
  const service = new ClassesService(
    unused,
    classes as never,
    prices as never,
    unused,
    unused,
    unused,
    unused,
    unused,
    unused,
    unused,
    unused,
    unused,
    unused,
    unused,
  );
  return { service, classes, prices, priceQuery };
}

describe('Class price history', () => {
  it('checks ownership before reading price versions and returns only public price fields', async () => {
    const versionId = new Types.ObjectId();
    const effectiveFrom = new Date('2026-10-08T17:00:00Z');
    const { service, classes, prices, priceQuery } = fixture(classroom, [
      {
        _id: versionId,
        teacherId,
        classId,
        effectiveFrom,
        regularPrice: 200000,
        makeupPrice: 250000,
      },
    ]);
    await expect(
      service.findPriceHistory(teacherId.toString(), classId.toString()),
    ).resolves.toEqual([
      {
        id: versionId.toString(),
        effectiveFrom,
        regularPrice: 200000,
        makeupPrice: 250000,
      },
    ]);
    expect(classes.findOne).toHaveBeenCalledWith({
      _id: classId,
      teacherId,
      status: { $ne: ClassStatus.Archived },
    });
    expect(prices.find).toHaveBeenCalledWith({ teacherId, classId });
    expect(priceQuery.sort).toHaveBeenCalledWith({ effectiveFrom: -1 });
  });

  it('refuses a class that does not belong to the teacher without reading its history', async () => {
    const { service, prices } = fixture(null);
    await expect(
      service.findPriceHistory(teacherId.toString(), classId.toString()),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prices.find).not.toHaveBeenCalled();
  });

  it('returns the existing class price for legacy classes with no saved versions', async () => {
    const { service } = fixture();
    await expect(
      service.findPriceHistory(teacherId.toString(), classId.toString()),
    ).resolves.toEqual([
      {
        id: null,
        regularPrice: 150000,
        makeupPrice: 180000,
        effectiveFrom: null,
      },
    ]);
  });

  it('represents the legacy baseline as the initial price instead of a misleading 1970 date', async () => {
    const versionId = new Types.ObjectId();
    const { service } = fixture(classroom, [
      {
        _id: versionId,
        effectiveFrom: new Date(0),
        regularPrice: 100000,
        makeupPrice: 120000,
      },
    ]);
    await expect(
      service.findPriceHistory(teacherId.toString(), classId.toString()),
    ).resolves.toEqual([
      {
        id: versionId.toString(),
        effectiveFrom: null,
        regularPrice: 100000,
        makeupPrice: 120000,
      },
    ]);
  });
});
