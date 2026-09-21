export const INVOICE_REGIONS = [
  { key: 'student', label: 'Thông tin học sinh', height: 28 },
  { key: 'class', label: 'Khóa học', height: 28 },
  { key: 'metadata', label: 'Mã hóa đơn · Kỳ học · Ngày lập', height: 22 },
  { key: 'sessions', label: 'Lịch học & nội dung bài học', height: 100 },
  { key: 'exams', label: 'Kết quả kiểm tra & tiến độ', height: 62 },
  { key: 'strengths', label: 'Điểm mạnh', height: 64 },
  { key: 'improvements', label: 'Cần cải thiện', height: 64 },
  { key: 'comment', label: 'Nhận xét chung', height: 64 },
  { key: 'total', label: 'Tổng tiền · Bằng chữ', height: 92 },
  { key: 'payment', label: 'Tài khoản · Liên hệ · Ghi chú', height: 112 },
  { key: 'qr', label: 'QR thanh toán', height: 112 },
  { key: 'prices', label: 'Đơn giá buổi học', height: 32 },
] as const;

export type InvoiceRegionKey = (typeof INVOICE_REGIONS)[number]['key'];
export const INVOICE_REGION_KEYS = new Set<string>(
  INVOICE_REGIONS.map((region) => region.key),
);

export function invoiceRegionPlaceholder(key: InvoiceRegionKey) {
  const tag = key === 'student' || key === 'class' ? 'span' : 'div';
  return `<${tag} class="invoice-region" data-edutrack-region="${key}">${regionContent[key]}</${tag}>`;
}

const symbol = (label: string) =>
  `<span class="region-symbol">{{${label}}}</span>`;
const lessonCells = () =>
  `<td class="lesson-index">#</td><td class="center">${symbol('Ngày học')}</td><td>${symbol('Nội dung bài học')}</td>`;
const paymentLine = (label: string, field: string) =>
  `<div class="payment-line"><span>${label}:</span><strong>${symbol(field)}</strong></div>`;

const regionContent: Record<InvoiceRegionKey, string> = {
  student: `Họ và tên học sinh: ${symbol('Họ tên')}`,
  class: `Khóa học: ${symbol('Tên lớp')}`,
  metadata: `<div class="meta-line"><span>Mã hóa đơn: ${symbol('Mã')}</span><span>Kỳ: ${symbol('Từ ngày')} - ${symbol('Đến ngày')}</span><span>Ngày lập: ${symbol('Ngày lập')}</span></div>`,
  sessions: `<table><thead><tr><th style="width:7%">Buổi</th><th style="width:14%">Ngày học</th><th style="width:29%">Nội dung</th><th style="width:7%">Buổi</th><th style="width:14%">Ngày học</th><th style="width:29%">Nội dung</th></tr></thead><tbody><tr>${lessonCells()}${lessonCells()}</tr><tr>${lessonCells()}${lessonCells()}</tr></tbody></table>`,
  exams: `<table><tbody><tr><td class="center muted">${symbol('Bài kiểm tra trong kỳ')}</td></tr></tbody></table>`,
  strengths: symbol('Điểm mạnh'),
  improvements: symbol('Cần cải thiện'),
  comment: symbol('Nhận xét chung'),
  total: `<div><strong>${symbol('Tổng tiền')}</strong><div>${symbol('Bằng chữ')}</div></div>`,
  payment: [
    paymentLine('Ngân hàng', 'Tên ngân hàng + logo'),
    paymentLine('Tên tài khoản', 'Chủ tài khoản'),
    paymentLine('Số tài khoản', 'Số tài khoản'),
    paymentLine('Liên hệ', 'Liên hệ'),
    paymentLine('Ghi chú', 'Ghi chú thanh toán'),
  ].join(''),
  qr: symbol('QR thanh toán'),
  prices: `<div class="price-note-list"><div class="price-note-row"><span>${symbol('Nhóm buổi học')}</span><strong>${symbol('Đơn giá')}/buổi</strong></div></div>`,
};

export const INVOICE_REGION_CSS = `
.invoice-region { min-width: 0; }
.region-symbol { font: inherit; color: inherit; }
`;
