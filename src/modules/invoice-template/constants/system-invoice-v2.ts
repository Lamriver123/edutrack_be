import { renderReceiptPage } from '../../receipts/receipt-template.layout';
import { RECEIPT_TEMPLATE_CSS } from '../../receipts/receipt-template.styles';
import {
  INVOICE_REGION_CSS,
  invoiceRegionPlaceholder as region,
} from './invoice-regions';

export const SYSTEM_V2_HTML = renderReceiptPage({
  pageClass: 'page edutrack-invoice-page',
  stickers:
    '<img class="sticker left" src="/sticker.png" alt="Sticker Ms. Cheese" /><img class="sticker right" src="/sticker.png" alt="Sticker Ms. Cheese" />',
  studentIcon: '<img src="/invoice-student.svg" alt="" />',
  classIcon: '<img src="/invoice-class.svg" alt="" />',
  student: region('student'),
  class: region('class'),
  metadata: region('metadata'),
  sessions: region('sessions'),
  exams: region('exams'),
  strengths: region('strengths'),
  improvements: region('improvements'),
  comment: region('comment'),
  total: region('total'),
  payment: region('payment'),
  qr: region('qr'),
  prices: region('prices'),
});

export const SYSTEM_V2_CSS = `${RECEIPT_TEMPLATE_CSS}
${INVOICE_REGION_CSS}
.edutrack-invoice-page { position: relative; }
`;
