import { BadRequestException } from '@nestjs/common';
import { load } from 'cheerio';
import { ReceiptTemplateService } from '../../receipts/receipt-template.service';
import { PREVIEW_RECEIPT } from '../constants/preview-receipt';
import { SYSTEM_V2_HTML, SYSTEM_V2_CSS } from '../constants/system-invoice-v2';
import { INVOICE_REGIONS } from '../constants/invoice-regions';
import { sanitizeTemplateCss } from './sanitize-template';

describe('receipt layout with dynamic regions', () => {
  const renderer = new ReceiptTemplateService();
  const template = { html: SYSTEM_V2_HTML, css: SYSTEM_V2_CSS };
  it('ships the actual receipt layout with symbols instead of hardcoded student/payment data', () => {
    const $ = load(template.html);
    expect($('[data-edutrack-region]').length).toBe(INVOICE_REGIONS.length);
    expect($('.section').length).toBe(4);
    expect($('.comment-card').length).toBe(3);
    expect($('.payment-card').length).toBe(3);
    expect($('.sticker').length).toBe(2);
    expect($('.info-icon img').length).toBe(2);
    expect($('[data-edutrack-region="sessions"] th').length).toBe(6);
    expect($('[data-edutrack-region="sessions"] .lesson-index').length).toBe(4);
    expect($('.payment-line').length).toBe(4);
    expect($('.meta-line span').length).toBeGreaterThanOrEqual(3);
    expect($('[data-edutrack-region][style*="min-height"]').length).toBe(0);
    expect(template.html).not.toContain('Nguyễn Minh Anh');
    expect(sanitizeTemplateCss(template.css)).toContain(
      'grid-template-columns: 190px 1fr 170px',
    );
  });

  it('resolves sections through the existing receipt renderer and retains custom static elements', () => {
    const receipt = {
      ...PREVIEW_RECEIPT,
      studentSnapshot: { fullName: 'Student <script>unsafe()</script>' },
      strengthsComment: '<img onerror="alert(1)">',
      totalAmount: 720000,
    };
    const html = renderer.renderCustomTemplate(receipt, {
      ...template,
      html: template.html.replace(
        'LEARN ENGLISH WITH MS. CHEESE',
        'CUSTOM HEADER',
      ),
    });
    const $ = load(html);
    expect(
      $('script, [onerror], [data-edutrack-region], .region-symbol').length,
    ).toBe(0);
    expect($.text()).toContain('Student <script>unsafe()</script>');
    expect($.text()).toContain('720.000');
    expect($.text()).toContain('CUSTOM HEADER');
    expect($('.lesson-index').length).toBe(4);
    expect($('.comment-body').first().text()).toContain(
      '<img onerror="alert(1)">',
    );
  });

  it('renders varying lesson counts without retaining placeholder height and rejects unknown/nested regions', () => {
    const receipt = {
      ...PREVIEW_RECEIPT,
      sessions: Array.from({ length: 26 }, (_, index) => ({
        ...PREVIEW_RECEIPT.sessions[0],
        sequence: index + 1,
      })),
    };
    const html = renderer.renderCustomTemplate(receipt, template);
    expect(load(html)('.lesson-index').length).toBe(26);
    expect(html).toContain('height: auto');
    for (const body of [
      '<div data-edutrack-region="password"></div>',
      '<div data-edutrack-region="sessions"><div data-edutrack-region="qr"></div></div>',
    ]) {
      expect(() =>
        renderer.renderCustomTemplate(receipt, { html: body, css: '' }),
      ).toThrow(BadRequestException);
    }
  });
});
