/* eslint-disable @typescript-eslint/no-base-to-string, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RECEIPT_TEMPLATE_CSS } from './receipt-template.styles';
import { renderReceiptPage } from './receipt-template.layout';
import { load } from 'cheerio';
import { renderRegionTemplate } from '../invoice-template/utils/region-renderer';
import { receiptBuiltInImagePath } from './receipt-image-policy';

type TuitionPriceNote = {
  label: string;
  unitPrice: number;
};

@Injectable()
export class ReceiptTemplateService {
  private readonly stickerDataUrl = this.loadStickerDataUrl();
  private readonly logoDataUrl = this.loadImageDataUrl(
    this.findExistingPath([
      join(process.cwd(), '..', 'edutrack_fe', 'public', 'logo.png'),
      join(process.cwd(), 'public', 'logo.png'),
    ]),
  );

  embedBuiltInImages(html: string) {
    const $ = load(html);
    $('img').each((_index, node) => {
      const path = receiptBuiltInImagePath($(node).attr('src') ?? '');
      if (!path) return;
      if (path.endsWith('.svg')) {
        const svg = this.renderInfoIcon(
          path === '/invoice-student.svg' ? 'student' : 'class',
        ).replace(
          '<svg',
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#08796c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"',
        );
        $(node).attr(
          'src',
          `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
        );
      } else {
        const dataUrl =
          path === '/logo.png' ? this.logoDataUrl : this.stickerDataUrl;
        if (dataUrl) $(node).attr('src', dataUrl);
        else $(node).remove();
      }
    });
    return $.html();
  }

  embedBankLogo(html: string, bankLogoDataUrl?: string) {
    const $ = load(html);
    const bankLogo = $('.bank-logo');

    if (!bankLogo.length) {
      return html;
    }

    if (bankLogoDataUrl) {
      bankLogo.attr('src', bankLogoDataUrl);
    } else {
      bankLogo.remove();
    }

    return $.html();
  }

  renderCustomTemplate(
    receipt: Record<string, any>,
    template: { html: string; css: string },
    paymentQrDataUrl?: string,
    bankLogoDataUrl?: string,
  ) {
    const $ = load(this.render(receipt, paymentQrDataUrl, bankLogoDataUrl));
    const section = $('.page > .section');
    const comments = $('.comment-body');
    const payment = $('.payment-card').eq(1).clone();
    payment.children('h3').remove();
    const renderedHtml = renderRegionTemplate(template.html, template.css, {
      student: $('.info-pill').eq(0).find('span').last().html() ?? '',
      class: $('.info-pill').eq(1).find('span').last().html() ?? '',
      metadata: $('.meta-line').toString(),
      sessions: section.eq(0).children('table').toString(),
      exams: section.eq(1).children().not('.section-label').toString(),
      strengths: comments.eq(0).html() ?? '',
      improvements: comments.eq(1).html() ?? '',
      comment: comments.eq(2).html() ?? '',
      total: $('.amount').html() ?? '',
      payment: payment.html() ?? '',
      qr: $('.qr').html() ?? '',
      prices: $('.price-note-list').toString(),
    });

    return this.ensurePaymentBankLine(
      renderedHtml,
      record(receipt.teacherSnapshot),
      bankLogoDataUrl,
    );
  }

  ensurePaymentBankLine(
    html: string,
    teacherSnapshot: Record<string, unknown>,
    bankLogoDataUrl?: string,
  ) {
    const $ = load(html);
    const bankName = this.stringValue(teacherSnapshot.bankName);
    const bankLogoUrl =
      bankLogoDataUrl || this.stringValue(teacherSnapshot.bankLogoUrl);
    const hasBankLine = $('.payment-line')
      .toArray()
      .some((node) => {
        const label = $(node).children('span').first().text().trim();

        return (
          $(node).hasClass('payment-bank-line') ||
          this.normalizeLabel(label).startsWith('ngan hang')
        );
      });

    if (hasBankLine) {
      return html;
    }

    const bankLine = this.paymentBankLine(bankName, bankLogoUrl);
    const accountLine = $('.payment-line')
      .toArray()
      .find((node) => {
        const label = $(node).children('span').first().text().trim();

        return this.normalizeLabel(label).startsWith('ten tai khoan');
      });

    if (accountLine) {
      $(accountLine).before(bankLine);
      return $.html();
    }

    const paymentHeading = $('.payment-card h3')
      .toArray()
      .find((node) =>
        this.normalizeLabel($(node).text()).includes('thong tin thanh toan'),
      );

    if (!paymentHeading) {
      return html;
    }

    $(paymentHeading).after(bankLine);
    return $.html();
  }

  render(
    receipt: Record<string, any>,
    paymentQrDataUrl?: string,
    bankLogoDataUrl?: string,
  ) {
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
  <style>${RECEIPT_TEMPLATE_CSS}</style>
</head>
<body>
  ${renderReceiptPage({
    stickers: this.renderSticker('left') + this.renderSticker('right'),
    studentIcon: this.renderInfoIcon('student'),
    classIcon: this.renderInfoIcon('class'),
    student: `Họ và tên học sinh: ${this.escape(receipt.studentSnapshot?.fullName)}`,
    class: `Khóa học: ${this.escape(classNames)}`,
    metadata: `<div class="meta-line"><span>Mã hóa đơn: ${this.escape(receipt.receiptNumber)}</span><span>Kỳ: ${this.formatDate(receipt.periodStart)} - ${this.formatDate(receipt.periodEnd)}</span><span>Ngày lập: ${this.formatDate(receipt.issuedAt)}</span></div>`,
    sessions: this.renderLessonTable(sessions, isMultiClass),
    exams: this.renderExamTables(exams, isMultiClass),
    strengths: this.escape(
      receipt.strengthsComment || 'Giáo viên chưa thêm điểm mạnh.',
    ),
    improvements: this.escape(
      receipt.improvementsComment ||
        'Giáo viên chưa thêm nội dung cần cải thiện.',
    ),
    comment: this.escape(generalComment),
    total: `<div><strong>${this.formatMoney(receipt.totalAmount)}</strong><div>${this.escape(this.numberToVietnameseWords(receipt.totalAmount))}</div></div>`,
    payment: [
      this.paymentBankLine(
        receipt.teacherSnapshot?.bankName,
        bankLogoDataUrl || receipt.teacherSnapshot?.bankLogoUrl,
      ),
      this.paymentLine(
        'Tên tài khoản',
        receipt.teacherSnapshot?.bankAccountName ||
          receipt.teacherSnapshot?.fullName,
      ),
      this.paymentLine(
        'Số tài khoản',
        receipt.teacherSnapshot?.bankAccountNumber,
      ),
      this.paymentLine(
        'Liên hệ',
        receipt.teacherSnapshot?.phone || receipt.teacherSnapshot?.email,
      ),
      this.paymentLine(
        'Ghi chú',
        receipt.paymentNote ||
          'Nếu có thắc mắc gì vui lòng liên hệ giáo viên.',
      ),
    ].join(''),
    qr: paymentQrDataUrl
      ? `<img alt="QR thanh toán" src="${paymentQrDataUrl}" />`
      : '<span>Chưa có QR thanh toán</span>',
    prices: this.renderTuitionPriceNotes(sessions),
  })}
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
            <th style="width: 13%;">Buổi</th>
            <th style="width: 18%;">Ngày học</th>
            <th style="width: 69%;">Nội dung</th>
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
          <th style="width: 10%;">Buổi</th>
          <th style="width: 14%;">Ngày học</th>
          <th style="width: 26%;">Nội dung</th>
          <th style="width: 10%;">Buổi</th>
          <th style="width: 14%;">Ngày học</th>
          <th style="width: 26%;">Nội dung</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  private renderLessonCells(item?: Record<string, any>, isMultiClass = false) {
    if (!item) {
      return '<td></td><td></td><td></td>';
    }

    const oneOnOneLabel =
      item.scheduleType === 'one_on_one'
        ? '<span class="lesson-index-kind">(Kèm 1:1)</span>'
        : '';

    return `<td class="lesson-index"><span class="lesson-index-value">${this.escape(item.sequence)}</span>${oneOnOneLabel}</td>
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

  private paymentBankLine(bankName?: string, bankLogoUrl?: string) {
    const logoUrl = this.safeBankLogoUrl(bankLogoUrl);
    const logo = logoUrl
      ? `<img alt="" class="bank-logo" height="26" src="${this.escape(logoUrl)}" style="width:50px;height:26px;object-fit:contain;vertical-align:middle" width="26" />`
      : '';

    return `<div class="payment-line payment-bank-line"><span>Ngân hàng:</span><strong class="payment-bank-value">${logo}<span>${this.escape(bankName || 'Chưa cập nhật')}</span></strong></div>`;
  }

  private normalizeLabel(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  }

  private stringValue(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
  }

  private safeBankLogoUrl(value?: string) {
    if (/^data:image\/(png|jpeg|webp);base64,/i.test(value ?? '')) {
      return value;
    }

    try {
      const url = new URL(value ?? '');

      return url.protocol === 'https:' &&
        ['api.vietqr.io', 'cdn.vietqr.io', 'vietqr.net'].includes(url.hostname)
        ? url.toString()
        : '';
    } catch {
      return '';
    }
  }

  private renderTuitionPriceNotes(sessions: any[]) {
    const notes = this.buildTuitionPriceNotes(sessions);

    if (!notes.length) {
      return '';
    }

    return `<div class="price-note-list">
        ${notes
          .map(
            (note) =>
              `<div class="price-note-row"><span>${this.escape(note.label)}</span><strong>${this.formatMoney(note.unitPrice)}/buổi</strong></div>`,
          )
          .join('')}
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

    return this.loadImageDataUrl(stickerPath);
  }

  private loadImageDataUrl(stickerPath?: string) {
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

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
