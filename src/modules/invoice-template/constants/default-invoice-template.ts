import {
  InvoiceTemplateStatus,
  InvoiceTemplateType,
} from '../schemas/invoice-template.schema';
import { SYSTEM_V2_HTML, SYSTEM_V2_CSS } from './system-invoice-v2';

export const SYSTEM_INVOICE_TEMPLATE_ID = 'SYSTEM_INVOICE_V2';
export const SYSTEM_INVOICE_TEMPLATE_VERSION = 'system-v2';
export const SYSTEM_INVOICE_TEMPLATE_HTML = SYSTEM_V2_HTML;
export const SYSTEM_INVOICE_TEMPLATE_CSS = SYSTEM_V2_CSS;
export const SYSTEM_INVOICE_TEMPLATE_EDITOR_DATA = {
  assets: [],
  pages: [
    {
      id: 'system-invoice-v2-page',
      name: 'Phiếu theo dõi học tập & học phí',
      component: SYSTEM_V2_HTML,
      styles: SYSTEM_V2_CSS,
    },
  ],
  styles: [],
};
export const SYSTEM_INVOICE_TEMPLATE = {
  id: SYSTEM_INVOICE_TEMPLATE_ID,
  name: 'Phiếu theo dõi học tập & học phí',
  type: InvoiceTemplateType.System,
  version: 2,
  basedOnVersion: SYSTEM_INVOICE_TEMPLATE_VERSION,
  editorData: SYSTEM_INVOICE_TEMPLATE_EDITOR_DATA,
  html: SYSTEM_V2_HTML,
  css: SYSTEM_V2_CSS,
  isDefault: true,
  status: InvoiceTemplateStatus.Active,
  readonly: true,
} as const;
