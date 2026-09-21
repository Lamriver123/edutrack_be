import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { load } from 'cheerio';
import { InvoiceTemplateService } from '../invoice-template/invoice-template.service';
import { SYSTEM_INVOICE_TEMPLATE } from '../invoice-template/constants/default-invoice-template';
import { SYSTEM_INVOICE_TEMPLATE as LEGACY } from '../invoice-template/constants/legacy-invoice-template';
import { PREVIEW_RECEIPT } from '../invoice-template/constants/preview-receipt';
import { ReceiptDesignService } from './receipt-design.service';
import { ReceiptTemplateService } from './receipt-template.service';
import { isReceiptBrowserRequestAllowed } from './receipt-image-policy';

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));

describe('receipt template selection and snapshots', () => {
  const templates = { findOne: jest.fn(), getDefaultTemplate: jest.fn() };
  const service = new ReceiptDesignService(
    templates as unknown as InvoiceTemplateService,
    new ReceiptTemplateService(),
  );
  beforeEach(() => {
    jest.resetAllMocks();
    templates.findOne.mockResolvedValue({ ...SYSTEM_INVOICE_TEMPLATE });
    templates.getDefaultTemplate.mockResolvedValue({
      ...SYSTEM_INVOICE_TEMPLATE,
    });
  });

  it('resolves the owned selected template, or the default when omitted', async () => {
    const selected = await service.resolve('teacher', 'saved-id');
    expect(templates.findOne).toHaveBeenCalledWith('teacher', 'saved-id');
    expect(selected.revision).toMatch(/^[a-f\d]{64}$/);
    await service.resolve('teacher');
    expect(templates.getDefaultTemplate).toHaveBeenCalledWith('teacher');
    templates.findOne.mockRejectedValue(new NotFoundException());
    await expect(service.resolve('other-teacher', 'saved-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects an overwritten template after preview and keeps the copied content immutable', async () => {
    const source = { ...SYSTEM_INVOICE_TEMPLATE };
    templates.findOne.mockResolvedValue(source);
    const snapshot = await service.resolve('teacher', source.id);
    source.html = source.html.replace(
      'LEARN ENGLISH WITH MS. CHEESE',
      'CHANGED HEADER',
    );
    await expect(
      service.resolve('teacher', source.id, snapshot.revision),
    ).rejects.toThrow(ConflictException);
    const html = service.render(PREVIEW_RECEIPT, snapshot);
    expect(html).not.toContain('CHANGED HEADER');
    expect(service.metadata(snapshot)).toEqual({
      id: snapshot.id,
      name: snapshot.name,
      version: snapshot.version,
      revision: snapshot.revision,
    });
  });

  it('fills regions from real multi-class receipt data and embeds built-in assets and QR', async () => {
    const snapshot = await service.resolve('teacher');
    const qr = 'data:image/png;base64,AA==';
    const bankLogo = 'data:image/png;base64,AQID';
    const html = service.render(
      {
        ...PREVIEW_RECEIPT,
        studentSnapshot: { fullName: 'Student <unsafe>' },
        classSnapshots: [{ className: 'Class A' }, { className: 'Class B' }],
        totalAmount: 1200000,
      },
      snapshot,
      qr,
      bankLogo,
    );
    const $ = load(html);
    expect($.text()).toContain('Student <unsafe>');
    expect($.text()).toContain('Class A + Class B');
    expect($.text()).toContain('1.200.000');
    expect($('[data-edutrack-region], .region-symbol, unsafe').length).toBe(0);
    expect($('.sticker').first().attr('src')).toMatch(/^data:image\//);
    expect($('.info-icon img').first().attr('src')).toMatch(
      /^data:image\/svg\+xml/,
    );
    expect($('.qr img').attr('src')).toBe(qr);
    expect($('.bank-logo').attr('src')).toBe(bankLogo);
    expect($('.payment-bank-line')).toHaveLength(1);
    expect($('.payment-bank-line').text()).toContain('Vietcombank');
  });

  it('adds bank information to older custom templates without a payment region', async () => {
    templates.findOne.mockResolvedValue({
      ...SYSTEM_INVOICE_TEMPLATE,
      html: `<main class="old-template"><div class="payment-card"><h3>Thông tin thanh toán</h3><div class="payment-line"><span>Tên tài khoản:</span><strong data-edutrack-field="teacher.bankAccountName">Chủ tài khoản</strong></div><div class="payment-line"><span>Số tài khoản:</span><strong data-edutrack-field="teacher.bankAccountNumber">0000000000</strong></div></div></main>`,
      css: '.payment-line { display: grid; grid-template-columns: 110px 1fr; }',
    });
    const snapshot = await service.resolve('teacher', 'old-template');
    const bankLogo = 'data:image/png;base64,AQID';
    const html = service.render(PREVIEW_RECEIPT, snapshot, undefined, bankLogo);
    const $ = load(html);

    expect($('.payment-bank-line')).toHaveLength(1);
    expect($('.payment-bank-line').text()).toContain('Vietcombank');
    expect($('.bank-logo').attr('src')).toBe(bankLogo);
    expect($('.bank-logo').attr('width')).toBe('26');
    expect($('.payment-line').first().hasClass('payment-bank-line')).toBe(true);
  });

  it('marks one-on-one lessons in receipt previews and issued template HTML', async () => {
    const snapshot = await service.resolve('teacher');
    const html = service.render(
      {
        ...PREVIEW_RECEIPT,
        sessions: [
          {
            ...PREVIEW_RECEIPT.sessions[0],
            scheduleType: 'one_on_one',
          },
        ],
      },
      snapshot,
    );
    const $ = load(html);

    expect($('.lesson-index .lesson-index-kind')).toHaveLength(1);
    expect($('.lesson-index-value').text()).toBe('1');
    expect($('.lesson-index-kind').text()).toBe('(Kèm 1:1)');
    expect(
      $('.lesson-index').closest('tr').find('td').eq(2).text(),
    ).not.toContain('Kèm 1:1');
  });

  it('fills legacy field templates without leaking demonstration data into issued invoices', async () => {
    templates.findOne.mockResolvedValue(LEGACY);
    const snapshot = await service.resolve('teacher', LEGACY.id);
    const html = service.render(
      {
        ...PREVIEW_RECEIPT,
        studentSnapshot: { fullName: 'Actual Student' },
        teacherSnapshot: {},
      },
      snapshot,
    );
    const $ = load(html);
    expect($.text()).toContain('Actual Student');
    expect($.text()).toContain('600.000');
    expect($.text()).not.toContain('HS-0001');
    expect($.text()).not.toContain('0912345678');
    expect($('[data-edutrack-field]').length).toBe(0);
  });

  it('rejects template resources that could make the PDF browser access arbitrary hosts', async () => {
    for (const src of [
      'http://127.0.0.1:3001/private',
      'https://example.com/image.png',
      'file:///secret',
    ]) {
      templates.findOne.mockResolvedValue({
        ...SYSTEM_INVOICE_TEMPLATE,
        html: `<img src="${src}">`,
      });
      await expect(service.resolve('teacher', 'id')).rejects.toThrow(
        BadRequestException,
      );
    }
    templates.findOne.mockResolvedValue({
      ...SYSTEM_INVOICE_TEMPLATE,
      css: '.page { background: url(https://example.com/image.png) }',
    });
    await expect(service.resolve('teacher', 'id')).rejects.toThrow(
      BadRequestException,
    );
    expect(
      isReceiptBrowserRequestAllowed(
        'https://res.cloudinary.com/cloud/image/upload/logo.png',
      ),
    ).toBe(true);
    expect(
      isReceiptBrowserRequestAllowed('https://fonts.gstatic.com/font.woff2'),
    ).toBe(true);
    for (const url of [
      'http://localhost:3001/api',
      'file:///secret',
      'https://res.cloudinary.com.evil.test/a',
      'https://user:pass@res.cloudinary.com/a',
      'https://res.cloudinary.com:444/a',
    ])
      expect(isReceiptBrowserRequestAllowed(url)).toBe(false);
  });
});
