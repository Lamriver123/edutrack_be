import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SYSTEM_INVOICE_TEMPLATE as LEGACY_TEMPLATE } from './constants/legacy-invoice-template';
import { InvoiceImagesService } from './invoice-images.service';
import {
  SYSTEM_INVOICE_TEMPLATE,
  SYSTEM_INVOICE_TEMPLATE_ID,
  SYSTEM_INVOICE_TEMPLATE_VERSION,
} from './constants/default-invoice-template';
import { CreateInvoiceTemplateDto } from './dto/create-invoice-template.dto';
import { DuplicateInvoiceTemplateDto } from './dto/duplicate-invoice-template.dto';
import { UpdateInvoiceTemplateDto } from './dto/update-invoice-template.dto';
import {
  InvoiceTemplate,
  InvoiceTemplateDocument,
  InvoiceTemplateStatus,
  InvoiceTemplateType,
} from './schemas/invoice-template.schema';
import {
  assertWhitelistedDynamicFields,
  sanitizeTemplateCss,
  sanitizeTemplateHtml,
} from './utils/sanitize-template';

export type InvoiceTemplateResponse = {
  id: string;
  teacherId?: string;
  name: string;
  type: InvoiceTemplateType;
  version: number;
  basedOnVersion: string;
  editorData: Record<string, unknown>;
  html: string;
  css: string;
  thumbnailUrl?: string;
  isDefault: boolean;
  status: InvoiceTemplateStatus;
  readonly: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type InvoiceTemplateSource = {
  name: string;
  basedOnVersion: string;
  editorData: Record<string, unknown>;
  html: string;
  css: string;
  thumbnailUrl?: string;
};

@Injectable()
export class InvoiceTemplateService {
  constructor(
    @InjectModel(InvoiceTemplate.name)
    private readonly invoiceTemplateModel: Model<InvoiceTemplateDocument>,
    private readonly images: InvoiceImagesService,
  ) {}

  async getDefaultTemplate(teacherIdStr: string) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const template = await this.invoiceTemplateModel
      .findOne({
        teacherId,
        type: InvoiceTemplateType.Custom,
        status: InvoiceTemplateStatus.Active,
        isDefault: true,
      })
      .sort({ updatedAt: -1 })
      .exec();

    return template ? this.toTemplateResponse(template) : this.systemResponse();
  }

  async findAll(teacherIdStr: string) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const templates = await this.invoiceTemplateModel
      .find({
        teacherId,
        type: InvoiceTemplateType.Custom,
        status: InvoiceTemplateStatus.Active,
      })
      .sort({ createdAt: -1, _id: -1 })
      .exec();

    return [
      this.systemResponse(),
      { ...LEGACY_TEMPLATE, isDefault: false },
      ...templates.map(this.toTemplateResponse),
    ];
  }

  async findOne(teacherIdStr: string, templateId: string) {
    if (this.isLegacyTemplateId(templateId))
      return { ...LEGACY_TEMPLATE, isDefault: false };
    if (this.isSystemTemplateId(templateId)) {
      return this.systemResponse();
    }

    const template = await this.findCustomTemplateForTeacherOrThrow(
      teacherIdStr,
      templateId,
    );

    return this.toTemplateResponse(template);
  }

  async create(teacherIdStr: string, dto: CreateInvoiceTemplateDto) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const html = this.cleanHtml(dto.html);
    await this.images.assertReferences(teacherIdStr, html, dto.editorData);
    const version = await this.nextVersion(teacherId);
    const isDefault =
      dto.isDefault ?? !(await this.hasActiveDefaultTemplate(teacherId));

    if (isDefault) {
      await this.unsetDefaultTemplates(teacherId);
    }

    try {
      const template = await this.invoiceTemplateModel.create({
        teacherId,
        name: this.cleanName(dto.name),
        type: InvoiceTemplateType.Custom,
        version,
        basedOnVersion:
          dto.basedOnVersion?.trim() || SYSTEM_INVOICE_TEMPLATE_VERSION,
        editorData: dto.editorData,
        html,
        css: sanitizeTemplateCss(dto.css),
        thumbnailUrl: dto.thumbnailUrl?.trim(),
        isDefault,
        status: InvoiceTemplateStatus.Active,
      });

      return this.toTemplateResponse(template);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Mỗi giáo viên chỉ có một mẫu hóa đơn mặc định đang hoạt động.',
        );
      }

      throw error;
    }
  }

  async update(
    teacherIdStr: string,
    templateId: string,
    dto: UpdateInvoiceTemplateDto,
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const template = await this.findCustomTemplateForTeacherOrThrow(
      teacherIdStr,
      templateId,
    );

    await this.images.assertReferences(
      teacherIdStr,
      this.cleanHtml(dto.html ?? template.html),
      dto.editorData ?? template.editorData,
    );

    if (dto.isDefault === true) {
      await this.unsetDefaultTemplates(teacherId, template._id);
      template.isDefault = true;
    } else if (dto.isDefault === false) {
      template.isDefault = false;
    }

    if (dto.name !== undefined) {
      template.name = this.cleanName(dto.name);
    }

    if (dto.basedOnVersion !== undefined) {
      template.basedOnVersion =
        dto.basedOnVersion.trim() || SYSTEM_INVOICE_TEMPLATE_VERSION;
    }

    if (dto.editorData !== undefined) {
      template.editorData = dto.editorData;
    }

    if (dto.html !== undefined) {
      template.html = this.cleanHtml(dto.html);
    }

    if (dto.css !== undefined) {
      template.css = sanitizeTemplateCss(dto.css);
    }

    if (dto.thumbnailUrl !== undefined) {
      template.thumbnailUrl = dto.thumbnailUrl.trim() || undefined;
    }

    try {
      await template.save();

      return this.toTemplateResponse(template);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Mỗi giáo viên chỉ có một mẫu hóa đơn mặc định đang hoạt động.',
        );
      }

      throw error;
    }
  }

  async duplicate(
    teacherIdStr: string,
    templateId: string,
    dto: DuplicateInvoiceTemplateDto = {},
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const source = await this.resolveTemplateSource(teacherIdStr, templateId);
    await this.images.assertReferences(
      teacherIdStr,
      source.html,
      source.editorData,
    );
    const version = await this.nextVersion(teacherId);
    const isDefault = dto.isDefault ?? false;

    if (isDefault) {
      await this.unsetDefaultTemplates(teacherId);
    }

    try {
      const template = await this.invoiceTemplateModel.create({
        teacherId,
        name: this.cleanName(dto.name || `${source.name} - Bản sao`),
        type: InvoiceTemplateType.Custom,
        version,
        basedOnVersion: source.basedOnVersion,
        editorData: source.editorData,
        html: source.html,
        css: source.css,
        thumbnailUrl: source.thumbnailUrl,
        isDefault,
        status: InvoiceTemplateStatus.Active,
      });

      return this.toTemplateResponse(template);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          'Mỗi giáo viên chỉ có một mẫu hóa đơn mặc định đang hoạt động.',
        );
      }

      throw error;
    }
  }

  async remove(teacherIdStr: string, templateId: string) {
    if (
      this.isSystemTemplateId(templateId) ||
      this.isLegacyTemplateId(templateId)
    ) {
      throw new BadRequestException('Không thể xóa mẫu hóa đơn hệ thống.');
    }

    const template = await this.findCustomTemplateForTeacherOrThrow(
      teacherIdStr,
      templateId,
    );
    template.status = InvoiceTemplateStatus.Archived;
    template.isDefault = false;
    await template.save();

    return { message: 'Đã xóa mẫu hóa đơn.' };
  }

  async resetDefaultTemplate(teacherIdStr: string) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');

    await this.invoiceTemplateModel
      .updateMany(
        {
          teacherId,
          type: InvoiceTemplateType.Custom,
          status: InvoiceTemplateStatus.Active,
          isDefault: true,
        },
        {
          $set: {
            isDefault: false,
            status: InvoiceTemplateStatus.Archived,
          },
        },
      )
      .exec();

    return this.systemResponse();
  }

  private async resolveTemplateSource(
    teacherIdStr: string,
    templateId: string,
  ): Promise<InvoiceTemplateSource> {
    if (this.isLegacyTemplateId(templateId)) return LEGACY_TEMPLATE;
    if (this.isSystemTemplateId(templateId)) {
      return SYSTEM_INVOICE_TEMPLATE;
    }

    const template = await this.findCustomTemplateForTeacherOrThrow(
      teacherIdStr,
      templateId,
    );

    return {
      name: template.name,
      basedOnVersion: template.basedOnVersion,
      editorData: template.editorData,
      html: template.html,
      css: template.css,
      thumbnailUrl: template.thumbnailUrl,
    };
  }

  private async findCustomTemplateForTeacherOrThrow(
    teacherIdStr: string,
    templateIdStr: string,
  ) {
    const teacherId = this.toObjectId(teacherIdStr, 'teacherId');
    const templateId = this.toObjectId(templateIdStr, 'templateId');
    const template = await this.invoiceTemplateModel
      .findOne({
        _id: templateId,
        teacherId,
        type: InvoiceTemplateType.Custom,
        status: InvoiceTemplateStatus.Active,
      })
      .exec();

    if (!template) {
      throw new NotFoundException('Không tìm thấy mẫu hóa đơn.');
    }

    return template;
  }

  private async hasActiveDefaultTemplate(teacherId: Types.ObjectId) {
    const existing = await this.invoiceTemplateModel
      .exists({
        teacherId,
        type: InvoiceTemplateType.Custom,
        status: InvoiceTemplateStatus.Active,
        isDefault: true,
      })
      .exec();

    return Boolean(existing);
  }

  private async nextVersion(teacherId: Types.ObjectId) {
    // Include archived copies so new saved versions never reuse their numbers.
    const latest = await this.invoiceTemplateModel
      .findOne({ teacherId, type: InvoiceTemplateType.Custom })
      .sort({ version: -1 })
      .exec();
    return (latest?.version ?? 0) + 1;
  }

  private unsetDefaultTemplates(
    teacherId: Types.ObjectId,
    exceptTemplateId?: Types.ObjectId,
  ) {
    const filter: Record<string, unknown> = {
      teacherId,
      type: InvoiceTemplateType.Custom,
      status: InvoiceTemplateStatus.Active,
      isDefault: true,
    };

    if (exceptTemplateId) {
      filter._id = { $ne: exceptTemplateId };
    }

    return this.invoiceTemplateModel
      .updateMany(filter, { $set: { isDefault: false } })
      .exec();
  }

  private cleanHtml(html: string) {
    assertWhitelistedDynamicFields(html);
    const sanitizedHtml = sanitizeTemplateHtml(html);
    assertWhitelistedDynamicFields(sanitizedHtml);

    if (!sanitizedHtml) {
      throw new BadRequestException('Nội dung HTML mẫu hóa đơn không hợp lệ.');
    }

    return sanitizedHtml;
  }

  private cleanName(name: string) {
    const cleanName = name.trim();

    if (!cleanName) {
      throw new BadRequestException('Tên mẫu hóa đơn không được để trống.');
    }

    return cleanName;
  }

  private systemResponse(): InvoiceTemplateResponse {
    return {
      ...SYSTEM_INVOICE_TEMPLATE,
      editorData: SYSTEM_INVOICE_TEMPLATE.editorData,
    };
  }

  private toTemplateResponse = (
    template: InvoiceTemplateDocument,
  ): InvoiceTemplateResponse => ({
    id: template._id.toString(),
    teacherId: template.teacherId?.toString(),
    name: template.name,
    type: template.type,
    version: template.version,
    basedOnVersion: template.basedOnVersion,
    editorData: template.editorData,
    html: template.html,
    css: template.css,
    thumbnailUrl: template.thumbnailUrl,
    isDefault: template.isDefault,
    status: template.status,
    readonly: template.type === InvoiceTemplateType.System,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  });

  private isSystemTemplateId(templateId: string) {
    return (
      templateId === SYSTEM_INVOICE_TEMPLATE_ID ||
      templateId === SYSTEM_INVOICE_TEMPLATE_VERSION
    );
  }

  private isLegacyTemplateId(id: string) {
    return id === LEGACY_TEMPLATE.id || id === LEGACY_TEMPLATE.basedOnVersion;
  }

  private toObjectId(value: string, fieldName: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} không hợp lệ.`);
    }

    return new Types.ObjectId(value);
  }

  private isDuplicateKeyError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    );
  }
}
