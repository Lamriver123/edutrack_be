import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InvoiceTemplateService } from './invoice-template.service';
import { InvoiceImagesService } from './invoice-images.service';
jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));
import {
  InvoiceTemplateDocument,
  InvoiceTemplateStatus,
  InvoiceTemplateType,
} from './schemas/invoice-template.schema';

const teacherId = new Types.ObjectId().toString();
const templateId = new Types.ObjectId();
const query = (result: unknown) => ({
  sort: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(result),
});

describe('invoice template saved versions', () => {
  const model = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  };
  const service = new InvoiceTemplateService(
    model as unknown as Model<InvoiceTemplateDocument>,
    {
      assertReferences: jest.fn().mockResolvedValue(undefined),
    } as unknown as InvoiceImagesService,
  );
  const document = () => ({
    _id: templateId,
    teacherId: new Types.ObjectId(teacherId),
    name: 'Saved template',
    type: InvoiceTemplateType.Custom,
    status: InvoiceTemplateStatus.Active,
    version: 2,
    basedOnVersion: 'system-v1',
    editorData: {},
    html: '<main>Invoice</main>',
    css: '',
    isDefault: true,
    save: jest.fn().mockResolvedValue(undefined),
  });
  beforeEach(() => {
    jest.resetAllMocks();
    model.updateMany.mockReturnValue(query({}));
  });

  it('creates a new saved version without replacing the previous template', async () => {
    model.findOne.mockReturnValue(query({ version: 4 }));
    model.create.mockImplementation((data: Record<string, unknown>) =>
      Promise.resolve({ ...document(), ...data }),
    );
    const result = await service.create(teacherId, {
      name: 'New version',
      editorData: {},
      html: '<main>New</main>',
      isDefault: true,
    });
    expect(result.version).toBe(5);
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        teacherId: new Types.ObjectId(teacherId),
        version: 5,
      }),
    );
    expect(model.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ teacherId: new Types.ObjectId(teacherId) }),
      { $set: { isDefault: false } },
    );
  });

  it('overwrites only the selected owned template and keeps its version number', async () => {
    const selected = document();
    model.findOne.mockReturnValue(query(selected));
    const result = await service.update(teacherId, templateId.toString(), {
      name: 'Updated version',
    });
    expect(result.name).toBe('Updated version');
    expect(result.version).toBe(2);
    expect(selected.save).toHaveBeenCalledTimes(1);
    expect(model.create).not.toHaveBeenCalled();
    expect(model.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: templateId,
        teacherId: new Types.ObjectId(teacherId),
      }),
    );
  });

  it('lists active teacher copies newest first without prioritizing the default', async () => {
    const list = query([document()]);
    model.find.mockReturnValue(list);
    const result = await service.findAll(teacherId);
    expect(list.sort).toHaveBeenCalledWith({ createdAt: -1, _id: -1 });
    expect(model.find).toHaveBeenCalledWith({
      teacherId: new Types.ObjectId(teacherId),
      type: InvoiceTemplateType.Custom,
      status: InvoiceTemplateStatus.Active,
    });
    expect(result[0].readonly).toBe(true);
    expect(result[1].id).toBe('SYSTEM_INVOICE_V1');
    expect(result[2].id).toBe(templateId.toString());
  });

  it('cannot overwrite the system template or a template owned by another teacher', async () => {
    model.findOne.mockReturnValue(query(null));
    await expect(
      service.update(teacherId, 'SYSTEM_INVOICE_V1', { name: 'Changed' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.update(teacherId, templateId.toString(), { name: 'Changed' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(model.create).not.toHaveBeenCalled();
    expect(model.updateMany).not.toHaveBeenCalled();
  });

  it('archives an owned custom template instead of deleting its history', async () => {
    const selected = document();
    model.findOne.mockReturnValue(query(selected));

    await expect(
      service.remove(teacherId, templateId.toString()),
    ).resolves.toEqual({ message: 'Đã xóa mẫu hóa đơn.' });
    expect(selected.status).toBe(InvoiceTemplateStatus.Archived);
    expect(selected.isDefault).toBe(false);
    expect(selected.save).toHaveBeenCalledTimes(1);
  });

  it('does not allow system templates to be removed', async () => {
    await expect(
      service.remove(teacherId, 'SYSTEM_INVOICE_V2'),
    ).rejects.toThrow('Không thể xóa mẫu hóa đơn hệ thống.');
    await expect(
      service.remove(teacherId, 'SYSTEM_INVOICE_V1'),
    ).rejects.toThrow('Không thể xóa mẫu hóa đơn hệ thống.');
    expect(model.findOne).not.toHaveBeenCalled();
  });
});
