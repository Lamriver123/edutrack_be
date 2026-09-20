import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { load } from 'cheerio';
import {
  CloudinaryService,
  UploadImageFile,
} from '../cloudinary/cloudinary.service';
import {
  InvoiceImage,
  InvoiceImageDocument,
} from './schemas/invoice-image.schema';

export const INVOICE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

@Injectable()
export class InvoiceImagesService {
  private readonly logger = new Logger(InvoiceImagesService.name);
  constructor(
    @InjectModel(InvoiceImage.name)
    private readonly model: Model<InvoiceImageDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async list(teacherId: string, before?: string) {
    const rows = await this.model
      .find({
        teacherId: new Types.ObjectId(teacherId),
        archivedAt: null,
        ...(before ? { _id: { $lt: new Types.ObjectId(before) } } : {}),
      })
      .sort({ _id: -1 })
      .limit(41)
      .exec();
    const images = rows.slice(0, 40);
    return {
      images: images.map(this.response),
      nextCursor: rows.length > 40 ? images.at(-1)!._id.toString() : null,
    };
  }

  async upload(teacherId: string, file?: UploadImageFile) {
    if (!file?.buffer?.length)
      throw new BadRequestException('Vui lòng chọn ảnh hóa đơn.');
    if (file.buffer.length > INVOICE_IMAGE_MAX_SIZE)
      throw new PayloadTooLargeException('Ảnh hóa đơn tối đa 5 MB.');
    const data = file.buffer;
    const valid =
      (file.mimetype === 'image/png' &&
        data
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
      (file.mimetype === 'image/jpeg' &&
        data[0] === 255 &&
        data[1] === 216 &&
        data[2] === 255) ||
      (file.mimetype === 'image/webp' &&
        data.toString('ascii', 0, 4) === 'RIFF' &&
        data.toString('ascii', 8, 12) === 'WEBP');
    if (!valid)
      throw new UnsupportedMediaTypeException(
        'Chỉ nhận ảnh PNG, JPG hoặc WEBP hợp lệ.',
      );
    const uploaded = await this.cloudinary.uploadInvoiceImage(file, teacherId);
    try {
      const image = await this.model.create({
        teacherId: new Types.ObjectId(teacherId),
        name: (file.originalname.split(/[\\/]/).at(-1) || 'Ảnh hóa đơn')
          .replace(/\p{Cc}/gu, '')
          .slice(0, 180),
        url: uploaded.url,
        publicId: uploaded.publicId,
        mimeType: file.mimetype,
        size: data.length,
        width: uploaded.width,
        height: uploaded.height,
      });
      return this.response(image);
    } catch (error) {
      // A failed DB write must not leave a newly uploaded asset untracked.
      await this.cloudinary
        .deleteInvoiceImage(uploaded.publicId)
        .catch(() =>
          this.logger.warn(
            `Could not clean up invoice image ${uploaded.publicId}`,
          ),
        );
      throw error;
    }
  }

  async archive(teacherId: string, imageId: string) {
    if (!Types.ObjectId.isValid(imageId))
      throw new BadRequestException('Mã ảnh không hợp lệ.');
    const image = await this.model
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(imageId),
          teacherId: new Types.ObjectId(teacherId),
          archivedAt: null,
        },
        { $set: { archivedAt: new Date() } },
        { returnDocument: 'after' },
      )
      .exec();
    if (!image) throw new NotFoundException('Không tìm thấy ảnh hóa đơn.');
    // Existing saved templates and issued receipts still reference the Cloudinary URL.
    return { id: imageId, archived: true };
  }

  async assertReferences(
    teacherId: string,
    html: string,
    project: Record<string, unknown>,
  ) {
    const ids = new Set<string>();
    const inspectHtml = (value: string) => {
      if (!value.includes('data-edutrack-image-id')) return;
      const $ = load(value, {}, false);
      $('[data-edutrack-image-id]').each((_index, element) => {
        ids.add($(element).attr('data-edutrack-image-id') ?? '');
      });
    };
    inspectHtml(html);
    const queue: unknown[] = [project];
    let count = 0;
    while (queue.length) {
      if (++count > 50000)
        throw new BadRequestException('Mẫu hóa đơn quá phức tạp.');
      const item = queue.pop();
      if (typeof item === 'string') inspectHtml(item);
      else if (Array.isArray(item)) queue.push(...(item as unknown[]));
      else if (item && typeof item === 'object') {
        for (const [key, value] of Object.entries(item)) {
          if (key === 'data-edutrack-image-id') ids.add(String(value));
          else queue.push(value);
        }
      }
    }
    if (!ids.size) return;
    if ([...ids].some((id) => !Types.ObjectId.isValid(id)))
      throw new BadRequestException('Mã ảnh trong mẫu không hợp lệ.');
    const images = await this.model
      .find({
        teacherId: new Types.ObjectId(teacherId),
        _id: { $in: [...ids].map((id) => new Types.ObjectId(id)) },
      })
      .select('_id')
      .exec();
    if (images.length !== ids.size)
      throw new BadRequestException(
        'Ảnh trong mẫu không thuộc thư viện của bạn.',
      );
  }

  private response = (image: InvoiceImageDocument) => ({
    id: image._id.toString(),
    name: image.name,
    url: image.url,
    width: image.width,
    height: image.height,
    size: image.size,
    mimeType: image.mimeType,
    createdAt: image.createdAt,
  });
}
