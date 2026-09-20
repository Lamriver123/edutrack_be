import {
  BadRequestException,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import {
  InvoiceImagesService,
  INVOICE_IMAGE_MAX_SIZE,
} from './invoice-images.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { InvoiceImageDocument } from './schemas/invoice-image.schema';
jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));

const teacherId = new Types.ObjectId().toString();
const imageId = new Types.ObjectId();
const query = (value: unknown) => ({
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(value),
});
const png = {
  buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0]),
  originalname: 'logo.png',
  mimetype: 'image/png',
  size: 10,
};

describe('invoice image library', () => {
  const model = {
    find: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  const cloud = {
    uploadInvoiceImage: jest.fn(),
    deleteInvoiceImage: jest.fn(),
  };
  const service = new InvoiceImagesService(
    model as unknown as Model<InvoiceImageDocument>,
    cloud as unknown as CloudinaryService,
  );
  beforeEach(() => {
    jest.resetAllMocks();
    cloud.uploadInvoiceImage.mockResolvedValue({
      url: 'https://res.cloudinary.com/test/logo.png',
      publicId: 'invoice/logo',
      width: 200,
      height: 100,
    });
    cloud.deleteInvoiceImage.mockResolvedValue(undefined);
    model.create.mockImplementation((data: Record<string, unknown>) =>
      Promise.resolve({ ...data, _id: imageId }),
    );
  });

  it('uploads bytes to Cloudinary and persists only URL and metadata with JWT ownership', async () => {
    const image = await service.upload(teacherId, png);
    expect(cloud.uploadInvoiceImage).toHaveBeenCalledWith(png, teacherId);
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        teacherId: new Types.ObjectId(teacherId),
        url: image.url,
        publicId: 'invoice/logo',
        size: 10,
        width: 200,
        height: 100,
      }),
    );
    const saved = (model.create.mock.calls as unknown[][])[0][0];
    expect(saved).not.toHaveProperty('buffer');
    expect(image).not.toHaveProperty('teacherId');
    expect(image.id).toBe(imageId.toString());
  });

  it('rejects missing, oversize, SVG and forged MIME images before upload', async () => {
    await expect(service.upload(teacherId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.upload(teacherId, {
        ...png,
        buffer: Buffer.alloc(INVOICE_IMAGE_MAX_SIZE + 1),
      }),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
    await expect(
      service.upload(teacherId, { ...png, mimetype: 'image/svg+xml' }),
    ).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
    await expect(
      service.upload(teacherId, {
        ...png,
        buffer: Buffer.from('<script>alert(1)</script>'),
      }),
    ).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
    expect(cloud.uploadInvoiceImage).not.toHaveBeenCalled();
  });

  it('does not persist on Cloudinary failure and removes a new asset if the DB write fails', async () => {
    cloud.uploadInvoiceImage.mockRejectedValueOnce(new Error('cloud down'));
    await expect(service.upload(teacherId, png)).rejects.toThrow('cloud down');
    expect(model.create).not.toHaveBeenCalled();
    model.create.mockRejectedValueOnce(new Error('database down'));
    await expect(service.upload(teacherId, png)).rejects.toThrow(
      'database down',
    );
    expect(cloud.deleteInvoiceImage).toHaveBeenCalledWith('invoice/logo');
  });

  it('paginates only active images owned by the teacher', async () => {
    const result = query(
      Array.from({ length: 41 }, () => ({ _id: imageId, name: 'image' })),
    );
    model.find.mockReturnValue(result);
    const page = await service.list(teacherId, imageId.toString());
    expect(model.find).toHaveBeenCalledWith({
      teacherId: new Types.ObjectId(teacherId),
      archivedAt: null,
      _id: { $lt: imageId },
    });
    expect(result.limit).toHaveBeenCalledWith(41);
    expect(page.images).toHaveLength(40);
    expect(page.nextCursor).toBe(imageId.toString());
  });

  it('archives only owned images without deleting URLs referenced by old templates', async () => {
    model.findOneAndUpdate
      .mockReturnValueOnce(query(null))
      .mockReturnValueOnce(query({ _id: imageId }));
    await expect(
      service.archive(teacherId, imageId.toString()),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.archive(teacherId, imageId.toString()),
    ).resolves.toEqual({ id: imageId.toString(), archived: true });
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        teacherId: new Types.ObjectId(teacherId),
        _id: imageId,
      }),
      expect.anything(),
      expect.anything(),
    );
    expect(cloud.deleteInvoiceImage).not.toHaveBeenCalled();
  });

  it('validates image references in both HTML and ProjectJSON, including archived owned images', async () => {
    model.find
      .mockReturnValueOnce(query([]))
      .mockReturnValueOnce(query([{ _id: imageId }]));
    const project = {
      pages: [
        {
          components: [
            {
              type: 'image',
              attributes: { 'data-edutrack-image-id': imageId.toString() },
            },
          ],
        },
      ],
    };
    await expect(
      service.assertReferences(teacherId, '<main></main>', project),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.assertReferences(
        teacherId,
        `<img data-edutrack-image-id="${imageId.toString()}" src="https://example.com/logo.png" />`,
        project,
      ),
    ).resolves.toBeUndefined();
    expect(model.find).toHaveBeenLastCalledWith({
      teacherId: new Types.ObjectId(teacherId),
      _id: { $in: [imageId] },
    });
  });
});
