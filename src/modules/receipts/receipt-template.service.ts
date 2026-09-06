/* eslint-disable @typescript-eslint/no-base-to-string, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type TuitionPriceNote = {
  label: string;
  unitPrice: number;
};

@Injectable()
export class ReceiptTemplateService {
  private readonly stickerDataUrl = this.loadStickerDataUrl();

  render(receipt: Record<string, any>, paymentQrDataUrl?: string) {
    const sessions = receipt.sessions ?? [];
    const exams = receipt.exams ?? [];
    const generalComment =
      receipt.generalComment ||
      receipt.teacherComment ||
      'Giáo viên chưa thêm nhận xét chung cho kỳ học này.';
    const classNames = this.getReceiptClassNames(receipt);
    const isMultiClass =
      receipt.scopeType === 'multi_class' ||
      this.getReceiptClassNameList(receipt).length > 1;

    return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${this.escape(receipt.receiptNumber)} - EduTrack</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * { box-sizing: border-box; }
    html {
      background: #eef2ff;
    }
    body {
      margin: 0;
      background: #eef2ff;
      color: #1f1646;
      font-family: Arial, "DejaVu Sans", "Liberation Sans", Tahoma, sans-serif;
      font-size: 13px;
      line-height: 1.45;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .page {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #d7e2ff;
      padding: 18px 20px 16px;
    }
    .top {
      position: relative;
      text-align: center;
      padding: 0 72px 10px;
      border-bottom: 3px solid #fee2a8;
    }
    .sticker {
      position: absolute;
      top: 6px;
      width: 52px;
      height: 52px;
      border-radius: 16px 18px 14px 20px;
      object-fit: contain;
      box-shadow: 0 10px 22px rgba(245, 158, 11, 0.18);
    }
    .sticker.right {
      right: 14px;
      transform: rotate(12deg);
    }
    .sticker.left {
      left: 14px;
      transform: rotate(-10deg);
    }
    .brand-line {
      color: #6b3b1d;
      font-size: 19px;
      font-weight: 900;
      letter-spacing: .04em;
    }
    h1 {
      margin: 4px 0 0;
      color: #ff7b35;
      font-size: 25px;
      font-weight: 900;
      letter-spacing: .01em;
    }
    .info-strip {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 8px 0 6px;
      border-radius: 10px;
      background: #fffbea;
      padding: 8px 10px;
    }
    .info-pill {
      display: flex;
      min-width: 0;
      align-items: center;
      gap: 8px;
      color: #533421;
      font-weight: 900;
    }
    .info-icon {
      display: grid;
      width: 28px;
      height: 28px;
      flex: 0 0 28px;
      place-items: center;
      border-radius: 999px;
      background: #c7f9ed;
      color: #08796c;
    }
    .info-icon svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      stroke-width: 2.2;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .info-pill span:last-child {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .meta-line {
      display: flex;
      justify-content: center;
      gap: 14px;
      color: #6b7280;
      font-size: 11px;
      font-weight: 800;
    }
    .section {
      margin-top: 14px;
    }
    .section-label {
      display: inline-flex;
      min-height: 24px;
      align-items: center;
      border-radius: 999px 999px 999px 4px;
      background: linear-gradient(135deg, #4d7ef8, #355edb);
      color: #ffffff;
      padding: 0 12px;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .section-label.green {
      background: linear-gradient(135deg, #6cb8a6, #328779);
    }
    .section-label.orange {
      background: linear-gradient(135deg, #ffb25c, #ff7b35);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    th, td {
      border: 2px solid #9db2ff;
      padding: 8px 7px;
      vertical-align: middle;
    }
    th {
      background: #ced8ff;
      color: #1f1646;
      font-size: 12px;
      font-weight: 900;
      text-align: center;
    }
    td {
      background: #ffffff;
      color: #312a55;
      font-size: 12px;
      font-weight: 700;
    }
    .center { text-align: center; }
    .muted { color: #64748b; }
    .lesson-index {
      background: #ff8a3d;
      color: #ffffff;
      font-weight: 900;
      text-align: center;
    }
    .lesson-class {
      display: inline-block;
      margin-bottom: 3px;
      border-radius: 999px;
      background: #eef2ff;
      padding: 2px 7px;
      color: #4338ca;
      font-size: 10px;
      font-weight: 900;
    }
    .exam-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-top: 6px;
    }
    .exam-grid.single {
      grid-template-columns: 1fr;
    }
    .comment-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 7px;
    }
    .comment-card {
      display: grid;
      grid-template-rows: auto 1fr;
      min-height: 116px;
      border: 1.8px solid #f6d36b;
      border-radius: 12px;
      background: #ffffff;
      padding: 8px;
      color: #1f2937;
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      white-space: pre-line;
    }
    .comment-card h3 {
      margin: 0;
      border-radius: 8px;
      background: #fff4c6;
      padding: 7px 8px;
      color: #7c3f15;
      font-size: 12px;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
    }
    .comment-body {
      display: grid;
      min-height: 68px;
      place-items: center;
      margin-top: 8px;
      border-radius: 8px;
      background: #fffdf2;
      padding: 8px;
      line-height: 1.5;
    }
    .payment-grid {
      display: grid;
      grid-template-columns: 190px 1fr 170px;
      gap: 10px;
      align-items: stretch;
      margin-top: 7px;
    }
    .payment-card {
      border: 1.8px solid #fde68a;
      border-radius: 10px;
      background: #fffdf2;
      padding: 10px;
    }
    .payment-card h3 {
      margin: 0 0 8px;
      color: #7c3f15;
      font-size: 12px;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
    }
    .amount {
      display: grid;
      min-height: 76px;
      place-items: center;
      border-radius: 8px;
      background: #fff7d6;
      color: #1f1646;
      text-align: center;
    }
    .amount strong {
      display: block;
      margin: 3px 0;
      font-size: 20px;
      font-weight: 900;
    }
    .price-note {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 145px 1fr;
      gap: 8px;
      align-items: stretch;
      border: 1.8px dashed #f0cf71;
      border-radius: 10px;
      background: #fffaf0;
      padding: 8px;
      color: #7c3f15;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.35;
    }
    .price-note-title {
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: #fff1bf;
      padding: 7px;
      text-align: center;
      text-transform: uppercase;
    }
    .price-note-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 6px;
    }
    .price-note-row {
      display: flex;
      min-width: 0;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      border-radius: 8px;
      background: #ffffff;
      padding: 6px 8px;
    }
    .price-note-row span {
      min-width: 0;
      color: #6b3b1d;
    }
    .price-note-row strong {
      flex: 0 0 auto;
      color: #1f1646;
      font-weight: 900;
      white-space: nowrap;
    }
    .payment-line {
      display: grid;
      grid-template-columns: 110px 1fr;
      gap: 8px;
      border-bottom: 1px solid #f3e8bf;
      padding: 5px 0;
      font-size: 12px;
      font-weight: 800;
    }
    .payment-line:last-child { border-bottom: 0; }
    .qr {
      display: grid;
      height: 132px;
      place-items: center;
      border: 1.8px dashed #93c5fd;
      border-radius: 10px;
      background: #f8fbff;
      color: #64748b;
      font-weight: 900;
      text-align: center;
    }
    .qr img {
      width: 124px;
      height: 124px;
      object-fit: contain;
    }
    .footer {
      margin-top: 10px;
      border-radius: 10px;
      background: linear-gradient(90deg, #eef7ff, #fff8dd);
      padding: 9px;
      color: #1d5f9f;
      text-align: center;
      font-size: 13px;
      font-weight: 900;
    }
    .footer span {
      display: block;
    }
    .motto {
      margin-top: 4px;
      color: #4f9f94;
      font-size: 22px;
      font-weight: 900;
      text-align: center;
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="top">
      ${this.renderSticker('left')}
      ${this.renderSticker('right')}
      <div class="brand-line">LEARN ENGLISH WITH MS. CHEESE</div>
      <h1>PHIẾU THEO DÕI HỌC TẬP &amp; HỌC PHÍ</h1>
      <div class="info-strip">
        <div class="info-pill">
          <span class="info-icon">${this.renderInfoIcon('student')}</span>
          <span>Họ và tên học sinh: ${this.escape(receipt.studentSnapshot?.fullName)}</span>
        </div>
        <div class="info-pill">
          <span class="info-icon">${this.renderInfoIcon('class')}</span>
          <span>Khóa học: ${this.escape(classNames)}</span>
        </div>
      </div>
      <div class="meta-line">
        <span>Mã hóa đơn: ${this.escape(receipt.receiptNumber)}</span>
        <span>Kỳ: ${this.formatDate(receipt.periodStart)} - ${this.formatDate(receipt.periodEnd)}</span>
        <span>Ngày lập: ${this.formatDate(receipt.issuedAt)}</span>
      </div>
    </header>

    <section class="section">
      <div class="section-label">1. Lịch học &amp; nội dung bài học</div>
      ${this.renderLessonTable(sessions, isMultiClass)}
    </section>

    <section class="section">
      <div class="section-label green">2. Kết quả kiểm tra &amp; tiến độ học tập</div>
      ${this.renderExamTables(exams, isMultiClass)}
    </section>

    <section class="section">
      <div class="section-label orange">3. Nhận xét của giáo viên</div>
      <div class="comment-grid">
        ${this.renderCommentCard('Điểm mạnh', receipt.strengthsComment, 'Giáo viên chưa thêm điểm mạnh.')}
        ${this.renderCommentCard('Cần cải thiện', receipt.improvementsComment, 'Giáo viên chưa thêm nội dung cần cải thiện.')}
        ${this.renderCommentCard('Nhận xét chung', generalComment, 'Giáo viên chưa thêm nhận xét chung.')}
      </div>
    </section>

    <section class="section">
      <div class="section-label orange">4. Học phí &amp; thanh toán</div>
      <div class="payment-grid">
        <div class="payment-card">
          <h3>Tổng số tiền</h3>
          <div class="amount">
            <div>
              <strong>${this.formatMoney(receipt.totalAmount)}</strong>
              <div>${this.escape(this.numberToVietnameseWords(receipt.totalAmount))}</div>
            </div>
          </div>
        </div>
        <div class="payment-card">
          <h3>Thông tin thanh toán</h3>
          ${this.paymentLine('Tên tài khoản', receipt.teacherSnapshot?.bankAccountName || receipt.teacherSnapshot?.fullName)}
          ${this.paymentLine('Số tài khoản', receipt.teacherSnapshot?.bankAccountNumber)}
          ${this.paymentLine('Liên hệ', receipt.teacherSnapshot?.phone || receipt.teacherSnapshot?.email)}
          ${this.paymentLine('Ghi chú', receipt.paymentNote || 'Vui lòng ghi nội dung chuyển khoản theo mã hóa đơn.')}
        </div>
        <div class="payment-card">
          <h3>Quét QR thanh toán</h3>
          <div class="qr">${
            paymentQrDataUrl
              ? `<img alt="QR thanh toán" src="${paymentQrDataUrl}" />`
              : '<span>Chưa có QR thanh toán</span>'
          }</div>
        </div>
        ${this.renderTuitionPriceNotes(sessions)}
      </div>
    </section>

    <div class="footer">
      <span>Cảm ơn phụ huynh đã tin tưởng và đồng hành cùng Ms. Cheese</span>
      <span>trên hành trình phát triển ngoại ngữ của con!</span>
    </div>
    <div class="motto">Learn • Grow • Shine</div>
  </main>
</body>
</html>`;
  }

  private renderLessonTable(sessions: any[], isMultiClass = false) {
    if (!sessions.length) {
      return `<table><tbody><tr><td class="center muted">Chưa có buổi học tính phí.</td></tr></tbody></table>`;
    }

    if (sessions.length === 1) {
      return `<table>
        <thead>
          <tr>
            <th style="width: 10%;">Buổi</th>
            <th style="width: 18%;">Ngày học</th>
            <th style="width: 72%;">Nội dung</th>
          </tr>
        </thead>
        <tbody>
          <tr>${this.renderLessonCells(sessions[0], isMultiClass)}</tr>
        </tbody>
      </table>`;
    }

    const splitIndex = Math.ceil(sessions.length / 2);
    const left = sessions.slice(0, splitIndex);
    const right = sessions.slice(splitIndex);
    const rows = Array.from({ length: splitIndex }, (_, index) => {
      const first = left[index];
      const second = right[index];

      return `<tr>
        ${this.renderLessonCells(first, isMultiClass)}
        ${this.renderLessonCells(second, isMultiClass)}
      </tr>`;
    }).join('');

    return `<table>
      <thead>
        <tr>
          <th style="width: 7%;">Buổi</th>
          <th style="width: 14%;">Ngày học</th>
          <th style="width: 29%;">Nội dung</th>
          <th style="width: 7%;">Buổi</th>
          <th style="width: 14%;">Ngày học</th>
          <th style="width: 29%;">Nội dung</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  private renderLessonCells(item?: Record<string, any>, isMultiClass = false) {
    if (!item) {
      return '<td></td><td></td><td></td>';
    }

    return `<td class="lesson-index">${this.escape(item.sequence)}</td>
      <td class="center">${this.formatDate(item.date)}</td>
      <td>${this.renderLessonContent(item, isMultiClass)}</td>`;
  }

  private renderLessonContent(item: Record<string, any>, isMultiClass = false) {
    const makeupText = item.makeupForClassName
      ? `Học tại ${item.attendedClassName || item.className} - bù cho ${item.makeupForClassName}`
      : '';
    const parts = this.uniqueNonEmpty([
      makeupText,
      item.topic,
      item.content,
      item.note,
    ]);
    const classBadge =
      isMultiClass && item.className
        ? `<span class="lesson-class">${this.escape(item.className)}</span><br>`
        : '';

    if (!parts.length) {
      return `${classBadge}${this.escape('Nội dung buổi học')}`;
    }

    const [title, ...details] = parts;

    if (!details.length) {
      return `${classBadge}${this.escape(title)}`;
    }

    return `${classBadge}<strong>${this.escape(title)}</strong><br><span class="muted">${this.escape(details.join(' - '))}</span>`;
  }

  private renderExamTables(exams: any[], isMultiClass = false) {
    if (!exams.length) {
      return `<table><tbody><tr><td class="center muted">Chưa có bài kiểm tra trong kỳ.</td></tr></tbody></table>`;
    }

    if (exams.length === 1) {
      const exam = exams[0];

      return `<div class="exam-grid single">
        <table>
          <thead>
            <tr><th>Bài kiểm tra</th><th>Điểm</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${this.renderExamTitle(exam, isMultiClass)}</td>
              <td class="center">${this.renderExamScoreCell(exam)}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
    }

    const splitIndex = Math.ceil(exams.length / 2);
    const chunks = [exams.slice(0, splitIndex), exams.slice(splitIndex)];

    return `<div class="exam-grid">
      ${chunks
        .map(
          (items) => `<table>
            <thead>
              <tr><th>Bài kiểm tra</th><th>Điểm</th></tr>
            </thead>
            <tbody>
              ${
                items.length
                  ? items
                      .map(
                        (exam: any) => `<tr>
                          <td>${this.renderExamTitle(exam, isMultiClass)}</td>
                          <td class="center">${this.renderExamScoreCell(exam)}</td>
                        </tr>`,
                      )
                      .join('')
                  : '<tr><td colspan="2" class="center muted">Chưa có thêm bài kiểm tra.</td></tr>'
              }
            </tbody>
          </table>`,
        )
        .join('')}
    </div>`;
  }

  private renderExamScoreCell(exam: any) {
    const scoreText = `${exam.score}/${exam.maxScore}`;
    const note = String(exam.note || '').trim();
    const teacherRemark = String(exam.teacherRemark || '').trim();
    const primaryText = note ? `${note} - điểm: ${scoreText}` : scoreText;
    const remark =
      teacherRemark && teacherRemark !== note
        ? `<br><span class="muted">${this.escape(teacherRemark)}</span>`
        : '';

    return `${this.escape(primaryText)}${remark}`;
  }

  private renderExamTitle(exam: Record<string, any>, isMultiClass = false) {
    const classBadge =
      isMultiClass && exam.className
        ? `<span class="lesson-class">${this.escape(exam.className)}</span><br>`
        : '';

    return `${classBadge}${this.escape(exam.title)}<br><span class="muted">${this.formatDate(exam.date)}</span>`;
  }

  private renderCommentCard(
    title: string,
    value: string | undefined,
    fallback: string,
  ) {
    return `<div class="comment-card">
      <h3>${this.escape(title)}</h3>
      <div class="comment-body">${this.escape(value || fallback)}</div>
    </div>`;
  }

  private uniqueNonEmpty(values: unknown[]) {
    const seen = new Set<string>();

    return values
      .map((value) => String(value || '').trim())
      .filter((value) => {
        if (!value || seen.has(value)) {
          return false;
        }

        seen.add(value);
        return true;
      });
  }

  private getReceiptClassNames(receipt: Record<string, any>) {
    return this.getReceiptClassNameList(receipt).join(' + ') || 'Lớp học';
  }

  private getReceiptClassNameList(receipt: Record<string, any>) {
    const snapshots = Array.isArray(receipt.classSnapshots)
      ? receipt.classSnapshots
      : [];
    const names = snapshots
      .map((snapshot: Record<string, unknown>) =>
        typeof snapshot.className === 'string' ? snapshot.className.trim() : '',
      )
      .filter(Boolean);

    if (!names.length && receipt.classSnapshot?.className) {
      names.push(receipt.classSnapshot.className);
    }

    return [...new Set(names)];
  }

  private paymentLine(label: string, value?: string) {
    return `<div class="payment-line"><span>${this.escape(label)}:</span><strong>${this.escape(value || 'Chưa cập nhật')}</strong></div>`;
  }

  private renderTuitionPriceNotes(sessions: any[]) {
    const notes = this.buildTuitionPriceNotes(sessions);

    if (!notes.length) {
      return '';
    }

    return `<div class="price-note">
      <div class="price-note-title">Đơn giá buổi học</div>
      <div class="price-note-list">
        ${notes
          .map(
            (note) =>
              `<div class="price-note-row"><span>${this.escape(note.label)}</span><strong>${this.formatMoney(note.unitPrice)}/buổi</strong></div>`,
          )
          .join('')}
      </div>
    </div>`;
  }

  private buildTuitionPriceNotes(sessions: any[]): TuitionPriceNote[] {
    const items = sessions
      .map((session, index) => ({
        className: this.resolveSessionClassName(session),
        order: index,
        sequence: this.resolveSessionSequence(session, index),
        unitPrice: this.resolveSessionUnitPrice(session),
      }))
      .filter((item) => item.unitPrice !== null)
      .sort(
        (first, second) =>
          first.sequence - second.sequence || first.order - second.order,
      );

    if (!items.length) {
      return [];
    }

    const uniquePrices = new Set(items.map((item) => item.unitPrice));

    if (uniquePrices.size === 1) {
      return [
        {
          label: `Tất cả ${items.length} buổi học`,
          unitPrice: items[0].unitPrice!,
        },
      ];
    }

    const classNames = new Set(items.map((item) => item.className));
    const shouldShowClassName = classNames.size > 1;
    const groups = new Map<
      string,
      {
        className: string;
        order: number;
        sequences: number[];
        unitPrice: number;
      }
    >();

    for (const item of items) {
      const key = `${shouldShowClassName ? item.className : ''}:${item.unitPrice}`;
      const existing = groups.get(key);

      if (existing) {
        existing.sequences.push(item.sequence);
        continue;
      }

      groups.set(key, {
        className: item.className,
        order: item.order,
        sequences: [item.sequence],
        unitPrice: item.unitPrice!,
      });
    }

    return [...groups.values()]
      .sort((first, second) => first.order - second.order)
      .map((group) => ({
        label: `${shouldShowClassName ? `${group.className} - ` : ''}Buổi ${this.formatSequenceRanges(group.sequences)}`,
        unitPrice: group.unitPrice,
      }));
  }

  private formatSequenceRanges(values: number[]) {
    const sequences = [...new Set(values)]
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((first, second) => first - second);
    const ranges: string[] = [];
    let start: number | null = null;
    let previous: number | null = null;

    for (const sequence of sequences) {
      if (start === null || previous === null) {
        start = sequence;
        previous = sequence;
        continue;
      }

      if (sequence === previous + 1) {
        previous = sequence;
        continue;
      }

      ranges.push(start === previous ? String(start) : `${start}-${previous}`);
      start = sequence;
      previous = sequence;
    }

    if (start !== null && previous !== null) {
      ranges.push(start === previous ? String(start) : `${start}-${previous}`);
    }

    return ranges.join(', ');
  }

  private resolveSessionClassName(session: any) {
    const value =
      session?.billingClassName ||
      session?.className ||
      session?.attendedClassName;

    return String(value || 'Lớp học').trim() || 'Lớp học';
  }

  private resolveSessionSequence(session: any, index: number) {
    const sequence = Number(session?.sequence);

    if (Number.isFinite(sequence) && sequence > 0) {
      return Math.round(sequence);
    }

    return index + 1;
  }

  private resolveSessionUnitPrice(session: any) {
    const unitPrice = Number(session?.unitPrice ?? session?.amount);

    if (!Number.isFinite(unitPrice)) {
      return null;
    }

    return Math.max(0, Math.round(unitPrice));
  }

  private renderSticker(position: 'left' | 'right') {
    if (!this.stickerDataUrl) {
      return '';
    }

    return `<img alt="Sticker Ms. Cheese" class="sticker ${position}" src="${this.stickerDataUrl}" />`;
  }

  private renderInfoIcon(type: 'class' | 'student') {
    if (type === 'class') {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V5.75A2.75 2.75 0 0 1 6.75 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5" /><path d="M8 7h8" /><path d="M8 11h6" /></svg>`;
    }

    return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></svg>`;
  }

  private loadStickerDataUrl() {
    const stickerPath = this.findExistingPath([
      process.env.EDUTRACK_RECEIPT_STICKER_PATH,
      join(process.cwd(), '..', 'edutrack_fe', 'public', 'sticker.png'),
      join(process.cwd(), 'public', 'sticker.png'),
      join(process.cwd(), '..', 'sticker.png'),
      join(process.cwd(), '..', 'edutrack_fe', 'public', 'logo.png'),
    ]);

    if (!stickerPath) {
      return '';
    }

    const ext = stickerPath.toLowerCase().endsWith('.webp')
      ? 'webp'
      : stickerPath.toLowerCase().endsWith('.jpg') ||
          stickerPath.toLowerCase().endsWith('.jpeg')
        ? 'jpeg'
        : 'png';

    return `data:image/${ext};base64,${readFileSync(stickerPath).toString(
      'base64',
    )}`;
  }

  private findExistingPath(paths: Array<string | undefined>) {
    return paths.find((path) => path && existsSync(path));
  }

  private formatMoney(value: number) {
    return `${Math.max(0, Math.round(value || 0)).toLocaleString('vi-VN')}VND`;
  }

  private formatDate(value?: string | Date) {
    if (!value) {
      return 'Chưa cập nhật';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Chưa cập nhật';
    }

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
    }).format(date);
  }

  private numberToVietnameseWords(value: number) {
    const amount = Math.max(0, Math.round(value || 0));

    if (!amount) {
      return 'Không đồng';
    }

    const groups: number[] = [];
    let remaining = amount;

    while (remaining > 0) {
      groups.unshift(remaining % 1000);
      remaining = Math.floor(remaining / 1000);
    }

    const scales = ['', 'nghìn', 'triệu', 'tỷ'];
    const words = groups
      .map((group, index) => {
        if (!group) {
          return '';
        }

        const scaleIndex = groups.length - index - 1;
        const full = index > 0 && group < 100;

        return `${this.readThreeDigits(group, full)} ${
          scales[scaleIndex] ?? ''
        }`;
      })
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return `${this.capitalize(words)} đồng`;
  }

  private readThreeDigits(value: number, full: boolean) {
    const digits = [
      '',
      'một',
      'hai',
      'ba',
      'bốn',
      'năm',
      'sáu',
      'bảy',
      'tám',
      'chín',
    ];
    const hundred = Math.floor(value / 100);
    const ten = Math.floor((value % 100) / 10);
    const unit = value % 10;
    const parts: string[] = [];

    if (hundred || full) {
      parts.push(`${hundred ? digits[hundred] : 'không'} trăm`);
    }

    if (ten > 1) {
      parts.push(`${digits[ten]} mươi`);
    } else if (ten === 1) {
      parts.push('mười');
    } else if ((hundred || full) && unit) {
      parts.push('lẻ');
    }

    if (unit) {
      if (ten > 1 && unit === 1) {
        parts.push('mốt');
      } else if (ten >= 1 && unit === 5) {
        parts.push('lăm');
      } else if (ten > 1 && unit === 4) {
        parts.push('tư');
      } else {
        parts.push(digits[unit]);
      }
    }

    return parts.join(' ').trim();
  }

  private capitalize(value: string) {
    return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
  }

  private escape(value: unknown) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
