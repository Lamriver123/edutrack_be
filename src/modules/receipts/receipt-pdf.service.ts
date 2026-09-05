/* eslint-disable @typescript-eslint/no-base-to-string, @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class ReceiptPdfService {
  private readonly stickerImageBuffer = this.loadStickerBuffer();

  async render(
    html: string,
    receipt: Record<string, any>,
    paymentQrDataUrl?: string,
  ) {
    const browserAutomation = await this.tryLoadBrowserAutomation();

    if (browserAutomation) {
      const launchOptions: Record<string, unknown> = {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      };

      if (browserAutomation.executablePath) {
        launchOptions.executablePath = browserAutomation.executablePath;
      }

      const browser = await browserAutomation.module.launch(launchOptions);

      try {
        const page = await browser.newPage();
        await page.setViewport({
          deviceScaleFactor: 1,
          height: 1123,
          width: 794,
        });
        await page.setContent(html, {
          waitUntil: ['load', 'networkidle0'],
        });
        await page.emulateMediaType('screen');

        return Buffer.from(
          await page.pdf({
            displayHeaderFooter: false,
            format: 'A4',
            margin: {
              bottom: '0mm',
              left: '0mm',
              right: '0mm',
              top: '0mm',
            },
            preferCSSPageSize: true,
            printBackground: true,
          }),
        );
      } finally {
        await browser.close();
      }
    }

    return this.renderFallbackPdf(receipt, paymentQrDataUrl);
  }

  private async tryLoadBrowserAutomation() {
    try {
      const module = await this.dynamicImport('puppeteer');

      return {
        module: module.default ?? module,
      };
    } catch {
      try {
        const module = await this.dynamicImport('puppeteer-core');
        const executablePath = this.findBrowserExecutablePath();

        if (!executablePath) {
          return null;
        }

        return {
          executablePath,
          module: module.default ?? module,
        };
      } catch {
        return null;
      }
    }
  }

  private dynamicImport(moduleName: string) {
    const dynamicImport = new Function(
      'moduleName',
      'return import(moduleName)',
    ) as (moduleName: string) => Promise<any>;

    return dynamicImport(moduleName);
  }

  private async renderFallbackPdf(
    receipt: Record<string, any>,
    paymentQrDataUrl?: string,
  ) {
    const PDFDocument = await this.tryLoadPdfKit();

    if (PDFDocument) {
      return this.renderPdfKitReceipt(PDFDocument, receipt, paymentQrDataUrl);
    }

    return this.renderBasicFallbackPdf(receipt);
  }

  private async tryLoadPdfKit() {
    try {
      const module = await this.dynamicImport('pdfkit');

      return module.default ?? module;
    } catch {
      return null;
    }
  }

  private renderPdfKitReceipt(
    PDFDocument: any,
    receipt: Record<string, any>,
    paymentQrDataUrl?: string,
  ) {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        margins: {
          bottom: 32,
          left: 32,
          right: 32,
          top: 28,
        },
        size: 'A4',
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const fonts = this.registerVietnameseFonts(doc);
      this.drawPdfKitReceipt(doc, receipt, paymentQrDataUrl, fonts);
      doc.end();
    });
  }

  private registerVietnameseFonts(doc: any) {
    const regularFont = this.findExistingPath([
      process.env.EDUTRACK_PDF_FONT_REGULAR_PATH,
      process.env.EDUTRACK_PDF_FONT_PATH,
      'C:\\Windows\\Fonts\\arial.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
    ]);
    const boldFont = this.findExistingPath([
      process.env.EDUTRACK_PDF_FONT_BOLD_PATH,
      'C:\\Windows\\Fonts\\arialbd.ttf',
      '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
      '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
      regularFont,
    ]);
    const fontNames = {
      boldFont: 'Helvetica-Bold',
      regularFont: 'Helvetica',
    };

    if (regularFont) {
      doc.registerFont('EduTrackRegular', regularFont);
      doc.font('EduTrackRegular');
      fontNames.regularFont = 'EduTrackRegular';
    }

    if (boldFont) {
      doc.registerFont('EduTrackBold', boldFont);
      fontNames.boldFont = 'EduTrackBold';
    }

    return fontNames;
  }

  private drawPdfKitReceipt(
    doc: any,
    receipt: Record<string, any>,
    paymentQrDataUrl?: string,
    fonts?: {
      boldFont: string;
      regularFont: string;
    },
  ) {
    const regularFont = fonts?.regularFont ?? 'Helvetica';
    const boldFont = fonts?.boldFont ?? 'Helvetica-Bold';
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 64;
    const left = 32;
    let y = 28;

    doc
      .rect(left, y, contentWidth, 94)
      .fill('#fffbea')
      .strokeColor('#fde68a')
      .lineWidth(1)
      .stroke();
    this.drawStickerImage(doc, left + 10, y + 9);
    this.drawStickerImage(doc, left + contentWidth - 62, y + 9);
    doc
      .font(boldFont)
      .fontSize(15)
      .fillColor('#6b3b1d')
      .text('LEARN ENGLISH WITH MS. CHEESE', left, y + 10, {
        align: 'center',
        width: contentWidth,
      });
    doc
      .font(boldFont)
      .fontSize(18)
      .fillColor('#ff7b35')
      .text('PHIẾU THEO DÕI HỌC TẬP & HỌC PHÍ', left, y + 33, {
        align: 'center',
        width: contentWidth,
      });
    doc
      .font(boldFont)
      .fontSize(10)
      .fillColor('#1f1646')
      .text(
        `Họ và tên học sinh: ${receipt.studentSnapshot?.fullName || 'Chưa cập nhật'}`,
        left + 16,
        y + 64,
        { width: contentWidth / 2 - 22 },
      )
      .text(
        `Khóa học: ${receipt.classSnapshot?.className || 'Chưa cập nhật'}`,
        left + contentWidth / 2 + 8,
        y + 64,
        { width: contentWidth / 2 - 22 },
      );
    y += 112;

    this.drawSectionTitle(doc, y, '1. Lịch học & nội dung bài học', '#355edb', {
      boldFont,
    });
    y += 28;
    y = this.drawLessonTable(doc, receipt.sessions ?? [], y, {
      boldFont,
      left,
      regularFont,
      width: contentWidth,
    });

    this.drawSectionTitle(
      doc,
      y + 12,
      '2. Kết quả kiểm tra & tiến độ học tập',
      '#328779',
      { boldFont },
    );
    y += 40;
    y = this.drawExamTable(doc, receipt.exams ?? [], y, {
      boldFont,
      left,
      regularFont,
      width: contentWidth,
    });

    this.drawSectionTitle(doc, y + 12, '3. Nhận xét của giáo viên', '#ff7b35', {
      boldFont,
    });
    y += 40;
    y = this.drawCommentCards(doc, receipt, y, {
      boldFont,
      left,
      regularFont,
      width: contentWidth,
    });

    this.drawSectionTitle(doc, y + 12, '4. Học phí & thanh toán', '#ff7b35', {
      boldFont,
    });
    y += 40;
    this.drawPaymentArea(doc, receipt, paymentQrDataUrl, y, {
      boldFont,
      left,
      regularFont,
      width: contentWidth,
    });

    doc
      .font(boldFont)
      .fontSize(10)
      .fillColor('#1d5f9f')
      .text(
        'Cảm ơn phụ huynh đã tin tưởng và đồng hành cùng Ms. Cheese',
        left,
        doc.page.height - 58,
        { align: 'center', width: contentWidth },
      )
      .text(
        'trên hành trình phát triển ngoại ngữ của con!',
        left,
        doc.page.height - 44,
        {
          align: 'center',
          width: contentWidth,
        },
      )
      .fontSize(16)
      .fillColor('#4f9f94')
      .text('Learn • Grow • Shine', left, doc.page.height - 25, {
        align: 'center',
        width: contentWidth,
      });
  }

  private drawSectionTitle(
    doc: any,
    y: number,
    title: string,
    color: string,
    fonts: { boldFont: string },
  ) {
    doc
      .roundedRect(32, y, 230, 22, 8)
      .fill(color)
      .font(fonts.boldFont)
      .fontSize(9)
      .fillColor('#ffffff')
      .text(title.toUpperCase(), 42, y + 6, { width: 210 });
  }

  private drawLessonTable(
    doc: any,
    sessions: any[],
    y: number,
    options: {
      boldFont: string;
      left: number;
      regularFont: string;
      width: number;
    },
  ) {
    const rowHeight = 44;

    if (sessions.length <= 1) {
      const columns = [56, 96, options.width - 152];

      this.drawTableRow(
        doc,
        y,
        ['Buổi', 'Ngày học', 'Nội dung'],
        columns,
        rowHeight,
        {
          background: '#ced8ff',
          boldFont: options.boldFont,
          left: options.left,
          regularFont: options.regularFont,
        },
      );
      y += rowHeight;

      this.drawTableRow(
        doc,
        y,
        sessions.length
          ? [
              sessions[0]?.sequence ?? '',
              this.formatDate(sessions[0]?.date),
              this.formatLessonContent(sessions[0]),
            ]
          : ['Chưa có buổi học tính phí.'],
        sessions.length ? columns : [options.width],
        rowHeight,
        {
          background: '#ffffff',
          boldFont: options.boldFont,
          left: options.left,
          regularFont: options.regularFont,
        },
      );

      return y + rowHeight;
    }

    const columns = [42, 76, 147, 42, 76, 147];
    const splitIndex = Math.ceil(sessions.length / 2);
    const headers = [
      'Buổi',
      'Ngày học',
      'Nội dung',
      'Buổi',
      'Ngày học',
      'Nội dung',
    ];

    this.drawTableRow(doc, y, headers, columns, rowHeight, {
      background: '#ced8ff',
      boldFont: options.boldFont,
      left: options.left,
      regularFont: options.regularFont,
    });
    y += rowHeight;

    const leftItems = sessions.slice(0, splitIndex);
    const rightItems = sessions.slice(splitIndex);

    for (let index = 0; index < splitIndex; index += 1) {
      const first = leftItems[index];
      const second = rightItems[index];
      this.drawTableRow(
        doc,
        y,
        [
          first?.sequence ?? '',
          this.formatDate(first?.date),
          this.formatLessonContent(first),
          second?.sequence ?? '',
          second ? this.formatDate(second.date) : '',
          second ? this.formatLessonContent(second, '') : '',
        ],
        columns,
        rowHeight,
        {
          background: '#ffffff',
          boldFont: options.boldFont,
          left: options.left,
          regularFont: options.regularFont,
        },
      );
      y += rowHeight;
    }

    return y;
  }

  private formatLessonContent(item: any, fallback = 'Nội dung buổi học') {
    const parts = this.uniqueNonEmpty([item?.topic, item?.content, item?.note]);

    return parts.length ? parts.join('\n') : fallback;
  }

  private drawExamTable(
    doc: any,
    exams: any[],
    y: number,
    options: {
      boldFont: string;
      left: number;
      regularFont: string;
      width: number;
    },
  ) {
    const rowHeight = 34;

    if (exams.length <= 1) {
      const columns = [options.width * 0.7, options.width * 0.3];

      this.drawTableRow(doc, y, ['Bài kiểm tra', 'Điểm'], columns, rowHeight, {
        background: '#ced8ff',
        boldFont: options.boldFont,
        left: options.left,
        regularFont: options.regularFont,
      });
      y += rowHeight;

      this.drawTableRow(
        doc,
        y,
        exams.length
          ? [
              `${exams[0].title}\n${this.formatDate(exams[0].date)}`,
              this.formatExamScoreText(exams[0]),
            ]
          : ['Chưa có bài kiểm tra trong kỳ.'],
        exams.length ? columns : [options.width],
        rowHeight,
        {
          background: '#ffffff',
          boldFont: options.boldFont,
          left: options.left,
          regularFont: options.regularFont,
        },
      );

      return y + rowHeight;
    }

    const columns = [
      options.width * 0.32,
      options.width * 0.18,
      options.width * 0.32,
      options.width * 0.18,
    ];

    this.drawTableRow(
      doc,
      y,
      ['Bài kiểm tra', 'Điểm', 'Bài kiểm tra', 'Điểm'],
      columns,
      rowHeight,
      {
        background: '#ced8ff',
        boldFont: options.boldFont,
        left: options.left,
        regularFont: options.regularFont,
      },
    );
    y += rowHeight;

    const splitIndex = Math.ceil(exams.length / 2);
    const leftItems = exams.slice(0, splitIndex);
    const rightItems = exams.slice(splitIndex);

    for (let index = 0; index < splitIndex; index += 1) {
      const first = leftItems[index];
      const second = rightItems[index];
      this.drawTableRow(
        doc,
        y,
        [
          `${first.title}\n${this.formatDate(first.date)}`,
          this.formatExamScoreText(first),
          second ? `${second.title}\n${this.formatDate(second.date)}` : '',
          second ? this.formatExamScoreText(second) : '',
        ],
        columns,
        rowHeight,
        {
          background: '#ffffff',
          boldFont: options.boldFont,
          left: options.left,
          regularFont: options.regularFont,
        },
      );
      y += rowHeight;
    }

    return y;
  }

  private formatExamScoreText(exam: any) {
    const scoreText = `${exam.score}/${exam.maxScore}`;
    const note = String(exam.note || '').trim();
    const teacherRemark = String(exam.teacherRemark || '').trim();
    const primaryText = note ? `${note} - điểm: ${scoreText}` : scoreText;

    if (teacherRemark && teacherRemark !== note) {
      return `${primaryText}\n${teacherRemark}`;
    }

    return primaryText;
  }

  private drawCommentCards(
    doc: any,
    receipt: Record<string, any>,
    y: number,
    options: {
      boldFont: string;
      left: number;
      regularFont: string;
      width: number;
    },
  ) {
    const gap = 8;
    const cardWidth = (options.width - gap * 2) / 3;
    const cards = [
      [
        'ĐIỂM MẠNH',
        receipt.strengthsComment || 'Giáo viên chưa thêm điểm mạnh.',
      ],
      [
        'CẦN CẢI THIỆN',
        receipt.improvementsComment ||
          'Giáo viên chưa thêm nội dung cần cải thiện.',
      ],
      [
        'NHẬN XÉT CHUNG',
        receipt.generalComment ||
          receipt.teacherComment ||
          'Giáo viên chưa thêm nhận xét chung.',
      ],
    ];

    cards.forEach(([title, content], index) => {
      const x = options.left + index * (cardWidth + gap);
      doc
        .roundedRect(x, y, cardWidth, 96, 8)
        .fill('#fffdf2')
        .strokeColor('#fde68a')
        .stroke()
        .font(options.boldFont)
        .fontSize(8)
        .fillColor('#7c3f15')
        .text(title, x + 8, y + 8, { align: 'center', width: cardWidth - 16 })
        .font(options.regularFont)
        .fontSize(8)
        .fillColor('#1f2937')
        .text(content, x + 8, y + 26, {
          align: 'center',
          height: 58,
          width: cardWidth - 16,
        });
    });

    return y + 96;
  }

  private drawPaymentArea(
    doc: any,
    receipt: Record<string, any>,
    paymentQrDataUrl: string | undefined,
    y: number,
    options: {
      boldFont: string;
      left: number;
      regularFont: string;
      width: number;
    },
  ) {
    const widths = [170, options.width - 340, 150];
    const gap = 10;
    const height = 124;
    let x = options.left;
    const priceNoteLines = this.buildTuitionPriceNoteLines(
      receipt.sessions ?? [],
    );

    widths.forEach((width) => {
      doc
        .roundedRect(x, y, width, height, 8)
        .fill('#fffdf2')
        .strokeColor('#fde68a')
        .stroke();
      x += width + gap;
    });

    doc
      .font(options.boldFont)
      .fontSize(8)
      .fillColor('#7c3f15')
      .text('TỔNG SỐ TIỀN', options.left + 10, y + 10, {
        align: 'center',
        width: widths[0] - 20,
      })
      .fontSize(14)
      .fillColor('#1f1646')
      .text(this.formatMoney(receipt.totalAmount), options.left + 10, y + 42, {
        align: 'center',
        width: widths[0] - 20,
      })
      .font(options.regularFont)
      .fontSize(8)
      .text(
        this.numberToPlainVietnameseMoney(receipt.totalAmount),
        options.left + 10,
        y + 64,
        {
          align: 'center',
          width: widths[0] - 20,
        },
      );

    if (priceNoteLines.length) {
      doc
        .font(options.boldFont)
        .fontSize(6.6)
        .fillColor('#7c3f15')
        .text('Đơn giá theo ngày học', options.left + 10, y + 84, {
          align: 'center',
          width: widths[0] - 20,
        })
        .font(options.regularFont)
        .fontSize(6.3)
        .text(priceNoteLines.join('\n'), options.left + 10, y + 96, {
          align: 'left',
          height: height - 98,
          width: widths[0] - 20,
        });
    }

    const infoX = options.left + widths[0] + gap + 12;
    doc
      .font(options.boldFont)
      .fontSize(8)
      .fillColor('#7c3f15')
      .text('THÔNG TIN THANH TOÁN', infoX, y + 10, {
        align: 'center',
        width: widths[1] - 24,
      })
      .font(options.regularFont)
      .fontSize(8)
      .fillColor('#1f2937')
      .text(
        `Tên tài khoản: ${receipt.teacherSnapshot?.bankAccountName || receipt.teacherSnapshot?.fullName || 'Chưa cập nhật'}`,
        infoX,
        y + 34,
        {
          width: widths[1] - 24,
        },
      )
      .text(
        `Số tài khoản: ${receipt.teacherSnapshot?.bankAccountNumber || 'Chưa cập nhật'}`,
        infoX,
        y + 52,
        {
          width: widths[1] - 24,
        },
      )
      .text(
        `Liên hệ: ${receipt.teacherSnapshot?.phone || receipt.teacherSnapshot?.email || 'Chưa cập nhật'}`,
        infoX,
        y + 70,
        {
          width: widths[1] - 24,
        },
      )
      .text(
        `Ghi chú: ${receipt.paymentNote || 'Vui lòng ghi nội dung chuyển khoản theo mã hóa đơn.'}`,
        infoX,
        y + 88,
        {
          width: widths[1] - 24,
        },
      );

    const qrX = options.left + widths[0] + widths[1] + gap * 2;
    doc
      .font(options.boldFont)
      .fontSize(8)
      .fillColor('#7c3f15')
      .text('QUÉT QR THANH TOÁN', qrX + 8, y + 10, {
        align: 'center',
        width: widths[2] - 16,
      });

    if (paymentQrDataUrl) {
      const qrBuffer = this.dataUrlToBuffer(paymentQrDataUrl);
      if (qrBuffer) {
        try {
          doc.image(qrBuffer, qrX + 27, y + 28, { fit: [96, 86] });
          return;
        } catch {
          // Some PDF renderers do not support WebP. Keep the receipt usable.
        }
      }
    }

    doc
      .roundedRect(qrX + 22, y + 32, 106, 70, 8)
      .strokeColor('#93c5fd')
      .dash(3, { space: 3 })
      .stroke()
      .undash()
      .font(options.regularFont)
      .fontSize(8)
      .fillColor('#64748b')
      .text('Chưa có QR thanh toán', qrX + 28, y + 58, {
        align: 'center',
        width: 94,
      });
  }

  private drawTableRow(
    doc: any,
    y: number,
    values: unknown[],
    widths: number[],
    height: number,
    options: {
      background: string;
      boldFont: string;
      left: number;
      regularFont: string;
    },
  ) {
    let x = options.left;

    values.forEach((value, index) => {
      const width = widths[index] ?? 0;
      doc
        .rect(x, y, width, height)
        .fill(options.background)
        .strokeColor('#9db2ff')
        .lineWidth(1)
        .stroke()
        .font(
          index === 0 && values.length !== 1
            ? options.boldFont
            : options.regularFont,
        )
        .fontSize(8)
        .fillColor('#1f1646')
        .text(String(value ?? ''), x + 5, y + 8, {
          align:
            index === 0 || index === 1 || index === 3 || index === 4
              ? 'center'
              : 'left',
          height: height - 12,
          width: width - 10,
        });
      x += width;
    });
  }

  private findExistingPath(paths: Array<string | undefined>) {
    return paths.find((path) => path && existsSync(path));
  }

  private findBrowserExecutablePath() {
    return this.findExistingPath([
      process.env.PUPPETEER_EXECUTABLE_PATH,
      process.env.EDUTRACK_CHROME_EXECUTABLE_PATH,
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\CocCoc\\Browser\\Application\\browser.exe',
      'C:\\Program Files (x86)\\CocCoc\\Browser\\Application\\browser.exe',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ]);
  }

  private drawStickerImage(doc: any, x: number, y: number) {
    if (!this.stickerImageBuffer) {
      return;
    }

    try {
      doc.image(this.stickerImageBuffer, x, y, { fit: [52, 52] });
    } catch {
      // Keep PDF rendering available even if the sticker format is unsupported.
    }
  }

  private loadStickerBuffer() {
    const stickerPath = this.findExistingPath([
      process.env.EDUTRACK_RECEIPT_STICKER_PATH,
      join(process.cwd(), '..', 'edutrack_fe', 'public', 'sticker.png'),
      join(process.cwd(), 'public', 'sticker.png'),
      join(process.cwd(), '..', 'sticker.png'),
      join(process.cwd(), '..', 'edutrack_fe', 'public', 'logo.png'),
    ]);

    return stickerPath ? readFileSync(stickerPath) : null;
  }

  private dataUrlToBuffer(value: string) {
    const [, base64] = value.split(',');

    if (!base64) {
      return null;
    }

    return Buffer.from(base64, 'base64');
  }

  private numberToPlainVietnameseMoney(value: number) {
    return `${Math.max(0, Math.round(value || 0)).toLocaleString('vi-VN')} đồng`;
  }

  private renderBasicFallbackPdf(receipt: Record<string, any>) {
    const lines = this.buildFallbackLines(receipt);
    const textCommands = this.buildTextCommands(lines);
    const objects: string[] = [];
    const pageHeight = Math.max(842, 140 + lines.length * 18);

    objects.push('<< /Type /Catalog /Pages 2 0 R >>');
    objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    );
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
    objects.push(
      `<< /Length ${Buffer.byteLength(textCommands, 'latin1')} >>\nstream\n${textCommands}\nendstream`,
    );

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    for (let index = 0; index < objects.length; index += 1) {
      offsets.push(Buffer.byteLength(pdf, 'latin1'));
      pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
    }

    const xrefOffset = Buffer.byteLength(pdf, 'latin1');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let index = 1; index < offsets.length; index += 1) {
      pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, 'latin1');
  }

  private buildFallbackLines(receipt: Record<string, any>) {
    const sessionLines = (receipt.sessions ?? []).flatMap((item: any) =>
      this.wrapLine(
        `${item.sequence}. ${this.formatDate(item.date)} ${item.startTime || ''}-${item.endTime || ''} | ${item.className} | ${this.formatMoney(item.amount)} | ${this.formatLessonContent(item)}`,
        92,
      ),
    );
    const examLines = (receipt.exams ?? []).flatMap((exam: any) =>
      this.wrapLine(
        `- ${this.formatDate(exam.date)} | ${exam.title} | ${this.formatExamScoreText(exam).replace(/\n/g, ' | ')}`,
        92,
      ),
    );
    const priceNoteLines = this.buildTuitionPriceNoteLines(
      receipt.sessions ?? [],
    );

    return [
      'EDUTRACK - PHIEU THANH TOAN HOC PHI',
      `Ma hoa don: ${receipt.receiptNumber}`,
      `Hoc sinh: ${receipt.studentSnapshot?.fullName || ''}`,
      `Lop: ${receipt.classSnapshot?.className || ''}`,
      `Giao vien: ${receipt.teacherSnapshot?.fullName || ''}`,
      `Ky hoc phi: ${this.formatDate(receipt.periodStart)} - ${this.formatDate(receipt.periodEnd)}`,
      '',
      'BUOI HOC TINH PHI',
      ...(sessionLines.length ? sessionLines : ['Chua co buoi hoc tinh phi.']),
      '',
      'BAI KIEM TRA TRONG KY',
      ...(examLines.length ? examLines : ['Chua co bai kiem tra trong ky.']),
      '',
      `Tam tinh: ${this.formatMoney(receipt.subtotal || 0)}`,
      `Giam gia: ${this.formatMoney(receipt.discountAmount || 0)}`,
      `Phu thu: ${this.formatMoney(receipt.adjustmentAmount || 0)}`,
      `Tong tien: ${this.formatMoney(receipt.totalAmount || 0)}`,
      ...(priceNoteLines.length
        ? ['', 'Don gia theo ngay hoc:', ...priceNoteLines]
        : []),
      '',
      'Diem manh:',
      ...this.wrapLine(
        receipt.strengthsComment || 'Giao vien chua them diem manh.',
        92,
      ),
      'Can cai thien:',
      ...this.wrapLine(
        receipt.improvementsComment ||
          'Giao vien chua them noi dung can cai thien.',
        92,
      ),
      'Nhan xet chung:',
      ...this.wrapLine(
        receipt.generalComment ||
          receipt.teacherComment ||
          'Giao vien chua them nhan xet chung.',
        92,
      ),
    ];
  }

  private buildTextCommands(lines: string[]) {
    const pageHeight = Math.max(842, 140 + lines.length * 18);
    let y = pageHeight - 56;

    return lines
      .map((line, index) => {
        const isTitle = index === 0;
        const command = `BT /${isTitle ? 'F2' : 'F1'} ${isTitle ? 15 : 10} Tf 46 ${y} Td (${this.escapePdfText(this.toPdfSafeText(line))}) Tj ET`;
        y -= isTitle ? 24 : 16;

        return command;
      })
      .join('\n');
  }

  private wrapLine(value: string, maxLength: number) {
    const words = this.toPdfSafeText(value).split(/\s+/);
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      if (`${current} ${word}`.trim().length > maxLength) {
        if (current) {
          lines.push(current);
        }
        current = word;
      } else {
        current = `${current} ${word}`.trim();
      }
    }

    if (current) {
      lines.push(current);
    }

    return lines;
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

  private buildTuitionPriceNoteLines(sessions: any[]) {
    return this.buildTuitionPriceRanges(sessions).map((range) =>
      this.formatTuitionPriceRange(range),
    );
  }

  private buildTuitionPriceRanges(sessions: any[]) {
    const items = sessions
      .map((session) => ({
        date: this.parseDateValue(session?.date),
        unitPrice: this.resolveSessionUnitPrice(session),
      }))
      .filter((item) => item.date && item.unitPrice !== null)
      .sort((first, second) => first.date!.getTime() - second.date!.getTime());
    const ranges: Array<{
      endDate: Date;
      startDate: Date;
      unitPrice: number;
    }> = [];

    for (const item of items) {
      const current = ranges[ranges.length - 1];

      if (current && current.unitPrice === item.unitPrice) {
        current.endDate = item.date!;
        continue;
      }

      ranges.push({
        endDate: item.date!,
        startDate: item.date!,
        unitPrice: item.unitPrice!,
      });
    }

    return ranges;
  }

  private formatTuitionPriceRange(range: {
    endDate: Date;
    startDate: Date;
    unitPrice: number;
  }) {
    const startDate = this.formatDate(range.startDate);
    const endDate = this.formatDate(range.endDate);
    const dateText =
      startDate === endDate ? startDate : `${startDate} đến ngày ${endDate}`;

    return `Ngày ${dateText}: ${this.formatMoney(range.unitPrice)}/buổi`;
  }

  private parseDateValue(value: unknown) {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(String(value));

    return Number.isNaN(date.getTime()) ? null : date;
  }

  private resolveSessionUnitPrice(session: any) {
    const unitPrice = Number(session?.unitPrice ?? session?.amount);

    if (!Number.isFinite(unitPrice)) {
      return null;
    }

    return Math.max(0, Math.round(unitPrice));
  }

  private formatMoney(value: number) {
    return `${Math.max(0, Math.round(value || 0)).toLocaleString('vi-VN')}VND`;
  }

  private formatDate(value?: string | Date) {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
    }).format(date);
  }

  private toPdfSafeText(value: unknown) {
    return String(value ?? '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7e]/g, '');
  }

  private escapePdfText(value: string) {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }
}
