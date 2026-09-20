export type ReceiptPageContent = {
  student: string;
  class: string;
  metadata: string;
  sessions: string;
  exams: string;
  strengths: string;
  improvements: string;
  comment: string;
  total: string;
  payment: string;
  qr: string;
  prices: string;
  stickers: string;
  studentIcon: string;
  classIcon: string;
  pageClass?: string;
};

// All slots are trusted HTML produced by the renderer or the system placeholders.
export function renderReceiptPage(content: ReceiptPageContent) {
  return `<main class="${content.pageClass ?? 'page'}">
    <header class="top">
      ${content.stickers}
      <div class="brand-line">LEARN ENGLISH WITH MS. CHEESE</div>
      <h1>PHIẾU THEO DÕI HỌC TẬP &amp; HỌC PHÍ</h1>
      <div class="info-strip">
        <div class="info-pill"><span class="info-icon">${content.studentIcon}</span><span>${content.student}</span></div>
        <div class="info-pill"><span class="info-icon">${content.classIcon}</span><span>${content.class}</span></div>
      </div>
      ${content.metadata}
    </header>
    <section class="section">
      <div class="section-label">1. Lịch học &amp; nội dung bài học</div>
      ${content.sessions}
    </section>
    <section class="section">
      <div class="section-label green">2. Kết quả kiểm tra &amp; tiến độ học tập</div>
      ${content.exams}
    </section>
    <section class="section">
      <div class="section-label orange">3. Nhận xét của giáo viên</div>
      <div class="comment-grid">
        ${commentCard('Điểm mạnh', content.strengths)}
        ${commentCard('Cần cải thiện', content.improvements)}
        ${commentCard('Nhận xét chung', content.comment)}
      </div>
    </section>
    <section class="section">
      <div class="section-label orange">4. Học phí &amp; thanh toán</div>
      <div class="payment-grid">
        <div class="payment-card"><h3>Tổng số tiền</h3><div class="amount">${content.total}</div></div>
        <div class="payment-card"><h3>Thông tin thanh toán</h3>${content.payment}</div>
        <div class="payment-card"><h3>Quét QR thanh toán</h3><div class="qr">${content.qr}</div></div>
        ${content.prices ? `<div class="price-note"><div class="price-note-title">Đơn giá buổi học</div>${content.prices}</div>` : ''}
      </div>
    </section>
    <div class="footer"><span>Cảm ơn phụ huynh đã tin tưởng và đồng hành cùng Ms. Cheese</span><span>trên hành trình phát triển ngoại ngữ của con!</span></div>
    <div class="motto">Learn • Grow • Shine</div>
  </main>`;
}

function commentCard(title: string, content: string) {
  return `<div class="comment-card"><h3>${title}</h3><div class="comment-body">${content}</div></div>`;
}
