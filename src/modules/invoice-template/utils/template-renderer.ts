import { BadRequestException } from '@nestjs/common';
import {
  INVOICE_DYNAMIC_FIELD_MAP,
  InvoiceDynamicField,
} from '../constants/invoice-fields';
import {
  assertWhitelistedDynamicFields,
  sanitizeTemplateHtml,
} from './sanitize-template';

export type InvoiceTemplateRenderContext = {
  student?: Record<string, unknown>;
  class?: Record<string, unknown>;
  tuition?: Record<string, unknown>;
  teacher?: Record<string, unknown>;
  invoice?: Record<string, unknown>;
};

const DYNAMIC_FIELD_ELEMENT_PATTERN =
  /<([a-z][\w:-]*)([^>]*)\sdata-edutrack-field=(["'])([^"']+)\3([^>]*)>([\s\S]*?)<\/\1>/gi;
const DYNAMIC_FIELD_ATTRIBUTE_PATTERN =
  /\sdata-edutrack-field\s*=\s*(?:"[^"]+"|'[^']+'|[^\s"'=<>`]+)/i;

export function renderInvoiceTemplateHtml(
  html: string,
  context: InvoiceTemplateRenderContext,
  options: { previewFallback?: boolean } = {},
) {
  assertWhitelistedDynamicFields(html);
  const sanitizedHtml = sanitizeTemplateHtml(html);

  return sanitizedHtml.replace(
    DYNAMIC_FIELD_ELEMENT_PATTERN,
    (
      _match,
      tagName: string,
      attributesBefore: string,
      _quote: string,
      fieldKey: string,
      attributesAfter: string,
    ) => {
      const field = INVOICE_DYNAMIC_FIELD_MAP.get(fieldKey);

      if (!field) {
        throw new BadRequestException(
          `Trường động hóa đơn không hợp lệ: ${fieldKey}.`,
        );
      }

      const attributes = `${attributesBefore}${attributesAfter}`.replace(
        DYNAMIC_FIELD_ATTRIBUTE_PATTERN,
        '',
      );
      const value = formatDynamicFieldValue(
        resolveDynamicFieldValue(fieldKey, context),
        field,
        options.previewFallback ?? true,
      );

      return `<${tagName}${attributes}>${escapeHtml(value)}</${tagName}>`;
    },
  );
}

export function buildMockInvoiceRenderContext(): InvoiceTemplateRenderContext {
  return {
    student: {
      fullName: 'Nguyễn Minh Anh',
      phone: '0901234567',
      studentCode: 'HS-0001',
    },
    class: {
      name: 'English 7A',
      schedule: 'Thứ 2, Thứ 4 - 18:00',
    },
    tuition: {
      paymentDate: new Date('2026-09-15T00:00:00.000Z'),
      sessionCount: 8,
      sessionPrice: 100000,
      totalAmount: 800000,
    },
    teacher: {
      address: 'Hà Nội',
      bankAccountName: 'NGUYEN VAN A',
      bankAccountNumber: '0000000000',
      bankName: 'Vietcombank',
      fullName: 'Ms. Cheese',
      phone: '0912345678',
    },
    invoice: {
      createdAt: new Date('2026-09-13T00:00:00.000Z'),
      invoiceCode: 'INV-202609-0001',
    },
  };
}

function resolveDynamicFieldValue(
  fieldKey: string,
  context: InvoiceTemplateRenderContext,
) {
  const [domain, property] = fieldKey.split('.');

  if (!domain || !property) {
    return '';
  }

  const domainValue = context[domain as keyof InvoiceTemplateRenderContext];

  if (!domainValue) {
    return '';
  }

  return domainValue[property];
}

function formatDynamicFieldValue(
  value: unknown,
  field: InvoiceDynamicField,
  previewFallback: boolean,
) {
  if (value === undefined || value === null || value === '') {
    return previewFallback ? field.previewValue : '';
  }

  if (field.formatter === 'money') {
    const amount = Number(value);

    if (Number.isFinite(amount)) {
      return `${Math.round(amount).toLocaleString('vi-VN')} VND`;
    }
  }

  if (field.formatter === 'date') {
    const date =
      value instanceof Date
        ? value
        : typeof value === 'string' || typeof value === 'number'
          ? new Date(value)
          : null;

    if (date && !Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
      }).format(date);
    }
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
    }).format(value);
  }

  return previewFallback ? field.previewValue : '';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
