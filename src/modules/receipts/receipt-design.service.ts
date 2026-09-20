import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { InvoiceTemplateService } from '../invoice-template/invoice-template.service';
import { ReceiptTemplateSnapshot } from '../school-management/schemas/receipt-template-snapshot.schema';
import { ReceiptTemplateService } from './receipt-template.service';
import {
  assertWhitelistedDynamicFields,
  sanitizeTemplateCss,
  sanitizeTemplateHtml,
} from '../invoice-template/utils/sanitize-template';
import { renderInvoiceTemplateHtml } from '../invoice-template/utils/template-renderer';
import {
  isReceiptCloudImage,
  receiptBuiltInImagePath,
} from './receipt-image-policy';

@Injectable()
export class ReceiptDesignService {
  constructor(
    private readonly templates: InvoiceTemplateService,
    private readonly renderer: ReceiptTemplateService,
  ) {}

  async resolve(
    teacherId: string,
    templateId?: string,
    expectedRevision?: string,
  ): Promise<ReceiptTemplateSnapshot> {
    const template = templateId
      ? await this.templates.findOne(teacherId, templateId)
      : await this.templates.getDefaultTemplate(teacherId);
    assertWhitelistedDynamicFields(template.html);
    const html = sanitizeTemplateHtml(template.html);
    const css = sanitizeTemplateCss(template.css);
    const $ = load(html);
    if (
      !html ||
      /url\s*\(/i.test(css) ||
      $('[style]')
        .toArray()
        .some((node) => /url\s*\(/i.test($(node).attr('style') ?? ''))
    ) {
      throw new BadRequestException(
        'Mẫu hóa đơn không hợp lệ. Hãy chèn ảnh qua thư viện ảnh hóa đơn.',
      );
    }
    $('img').each((_index, node) => {
      const src = $(node).attr('src') ?? '';
      if (!receiptBuiltInImagePath(src) && !isReceiptCloudImage(src)) {
        throw new BadRequestException(
          'Ảnh trong mẫu phải được tải lên thư viện ảnh hóa đơn trước khi phát hành.',
        );
      }
    });
    const revision = createHash('sha256')
      .update(JSON.stringify([template.id, template.version, html, css]))
      .digest('hex');
    if (expectedRevision && revision !== expectedRevision) {
      throw new ConflictException(
        'Mẫu đã thay đổi sau khi xem trước. Vui lòng xem trước lại trước khi phát hành.',
      );
    }
    return {
      id: template.id,
      name: template.name,
      version: template.version,
      revision,
      html,
      css,
    };
  }

  metadata(snapshot?: ReceiptTemplateSnapshot) {
    if (!snapshot) return undefined;
    const { id, name, version, revision } = snapshot;
    return { id, name, version, revision };
  }

  render(
    receipt: Record<string, unknown>,
    template: ReceiptTemplateSnapshot,
    qr?: string,
  ) {
    const sessions = Array.isArray(receipt.sessions)
      ? receipt.sessions.map(record)
      : [];
    const classes =
      Array.isArray(receipt.classSnapshots) && receipt.classSnapshots.length
        ? receipt.classSnapshots.map(record)
        : [record(receipt.classSnapshot)];
    const prices = [
      ...new Set(
        sessions
          .map((item) => Number(item.unitPrice ?? item.amount))
          .filter(Number.isFinite),
      ),
    ];
    const html = renderInvoiceTemplateHtml(
      template.html,
      {
        student: record(receipt.studentSnapshot),
        teacher: record(receipt.teacherSnapshot),
        class: {
          name: classes
            .map((item) => item.className)
            .filter(Boolean)
            .join(' + '),
          schedule: [
            ...new Set(
              sessions
                .map((item) =>
                  [item.startTime, item.endTime].filter(Boolean).join(' - '),
                )
                .filter(Boolean),
            ),
          ].join(', '),
        },
        tuition: {
          sessionCount: receipt.lessonCount ?? sessions.length,
          sessionPrice: prices.length === 1 ? prices[0] : undefined,
          totalAmount: receipt.totalAmount,
          paymentDate: receipt.paidAt ?? receipt.dueDate,
        },
        invoice: {
          invoiceCode: receipt.receiptNumber,
          createdAt: receipt.issuedAt,
        },
      },
      { previewFallback: false },
    );
    return this.renderer.embedBuiltInImages(
      this.renderer.renderCustomTemplate(
        receipt,
        { html, css: template.css },
        qr,
      ),
    );
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
