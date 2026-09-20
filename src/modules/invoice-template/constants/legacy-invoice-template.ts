import {
  InvoiceTemplateStatus,
  InvoiceTemplateType,
} from '../schemas/invoice-template.schema';

export const SYSTEM_INVOICE_TEMPLATE_ID = 'SYSTEM_INVOICE_V1';
export const SYSTEM_INVOICE_TEMPLATE_VERSION = 'system-v1';

export const SYSTEM_INVOICE_TEMPLATE_HTML = `<main class="edutrack-invoice-page">
  <header class="invoice-header">
    <div class="brand-line">LEARN ENGLISH WITH MS. CHEESE</div>
    <h1>PHIẾU THEO DÕI HỌC TẬP &amp; HỌC PHÍ</h1>
    <div class="invoice-meta">
      <span>Mã hóa đơn: <strong data-edutrack-field="invoice.invoiceCode">INV-202609-0001</strong></span>
      <span>Ngày lập: <strong data-edutrack-field="invoice.createdAt">13/09/2026</strong></span>
    </div>
  </header>

  <section class="info-grid">
    <div class="info-box">
      <p class="section-label">Học sinh</p>
      <p>Họ tên: <span data-edutrack-field="student.fullName">Nguyễn Minh Anh</span></p>
      <p>Mã học sinh: <span data-edutrack-field="student.studentCode">HS-0001</span></p>
      <p>Số điện thoại: <span data-edutrack-field="student.phone">0901234567</span></p>
    </div>
    <div class="info-box">
      <p class="section-label">Lớp học</p>
      <p>Tên lớp: <span data-edutrack-field="class.name">English 7A</span></p>
      <p>Lịch học: <span data-edutrack-field="class.schedule">Thứ 2, Thứ 4 - 18:00</span></p>
    </div>
  </section>

  <section class="invoice-section">
    <p class="section-label">Học phí</p>
    <table>
      <tbody>
        <tr>
          <td>Số buổi</td>
          <td><span data-edutrack-field="tuition.sessionCount">8</span></td>
        </tr>
        <tr>
          <td>Đơn giá</td>
          <td><span data-edutrack-field="tuition.sessionPrice">100.000 VND</span></td>
        </tr>
        <tr>
          <td>Ngày thanh toán</td>
          <td><span data-edutrack-field="tuition.paymentDate">15/09/2026</span></td>
        </tr>
        <tr class="total-row">
          <td>Tổng cộng</td>
          <td><span data-edutrack-field="tuition.totalAmount">800.000 VND</span></td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="info-grid">
    <div class="info-box">
      <p class="section-label">Giáo viên</p>
      <p>Họ tên: <span data-edutrack-field="teacher.fullName">Ms. Cheese</span></p>
      <p>SĐT: <span data-edutrack-field="teacher.phone">0912345678</span></p>
      <p>Địa chỉ: <span data-edutrack-field="teacher.address">Hà Nội</span></p>
    </div>
    <div class="signature-box">
      <p>Chữ ký giáo viên</p>
      <hr />
    </div>
  </section>
</main>`;

export const SYSTEM_INVOICE_TEMPLATE_CSS = `.edutrack-invoice-page {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #ffffff;
  color: #1f1646;
  font-family: Arial, "DejaVu Sans", "Liberation Sans", sans-serif;
  font-size: 13px;
  line-height: 1.45;
  padding: 18mm 16mm;
}

.invoice-header {
  border-bottom: 3px solid #fee2a8;
  margin-bottom: 18px;
  padding-bottom: 12px;
  text-align: center;
}

.brand-line {
  color: #6b3b1d;
  font-size: 18px;
  font-weight: 800;
}

h1 {
  color: #ff7b35;
  font-size: 24px;
  margin: 6px 0 10px;
}

.invoice-meta,
.info-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr;
}

.info-box,
.signature-box {
  border: 1.5px solid #d7e2ff;
  border-radius: 8px;
  padding: 12px;
}

.section-label {
  color: #355edb;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.invoice-section {
  margin: 18px 0;
}

table {
  border-collapse: collapse;
  width: 100%;
}

td {
  border: 1.5px solid #9db2ff;
  padding: 10px;
}

.total-row td {
  background: #fff7d6;
  font-size: 16px;
  font-weight: 800;
}

.signature-box {
  display: grid;
  place-items: center;
  text-align: center;
}

@page {
  size: A4;
  margin: 0;
}`;

export const SYSTEM_INVOICE_TEMPLATE_EDITOR_DATA = {
  assets: [],
  pages: [
    {
      component: SYSTEM_INVOICE_TEMPLATE_HTML,
      id: 'system-invoice-v1-page',
      name: 'SYSTEM_INVOICE_V1',
      styles: SYSTEM_INVOICE_TEMPLATE_CSS,
    },
  ],
  styles: [],
  version: SYSTEM_INVOICE_TEMPLATE_VERSION,
};

export const SYSTEM_INVOICE_TEMPLATE = {
  id: SYSTEM_INVOICE_TEMPLATE_ID,
  name: 'SYSTEM_INVOICE_V1',
  type: InvoiceTemplateType.System,
  version: 1,
  basedOnVersion: SYSTEM_INVOICE_TEMPLATE_VERSION,
  editorData: SYSTEM_INVOICE_TEMPLATE_EDITOR_DATA,
  html: SYSTEM_INVOICE_TEMPLATE_HTML,
  css: SYSTEM_INVOICE_TEMPLATE_CSS,
  isDefault: true,
  status: InvoiceTemplateStatus.Active,
  readonly: true,
} as const;
