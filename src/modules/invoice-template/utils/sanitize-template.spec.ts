import { BadRequestException } from '@nestjs/common';
import {
  assertWhitelistedDynamicFields,
  sanitizeTemplateCss,
  sanitizeTemplateHtml,
} from './sanitize-template';
import { renderInvoiceTemplateHtml } from './template-renderer';

describe('invoice template sanitization', () => {
  it('preserves GrapesJS component selectors and text formatting on save', () => {
    const html = sanitizeTemplateHtml(
      '<div id="iabc12"><b>Học phí</b><i>Ghi chú</i></div>',
    );
    const css = sanitizeTemplateCss(
      '#iabc12 { position: absolute; left: 32px; top: 80px; width: 240px; font-size: 18px; border-top-width: 2px; border-top-style: solid; row-gap: 10px; }',
    );

    expect(html).toBe('<div id="iabc12"><b>Học phí</b><i>Ghi chú</i></div>');
    expect(css).toContain('#iabc12');
    expect(css).toContain('left: 32px');
    expect(css).toContain('font-size: 18px');
    expect(css).toContain('border-top-width: 2px');
    expect(css).toContain('border-top-style: solid');
    expect(css).toContain('row-gap: 10px');
  });

  it('removes unsafe html, event handlers, and javascript URLs', () => {
    const html = sanitizeTemplateHtml(`
      <div onclick="alert(1)" style="color: red; behavior: url(test); width: 100px;">
        <script>alert(1)</script>
        <iframe src="https://example.com"></iframe>
        <span data-edutrack-field="student.fullName">Nguyễn Minh Anh</span>
        <img src="javascript:alert(1)" onerror="alert(1)" alt="Logo" />
      </div>
    `);

    expect(html).toContain('style="color: red; width: 100px"');
    expect(html).toContain('data-edutrack-field="student.fullName"');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('script');
    expect(html).not.toContain('iframe');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('onerror');
  });

  it('preserves serialized no-wrap and overflow rules used by receipt headings', () => {
    const css = sanitizeTemplateCss(
      '.info-pill span:last-child { overflow-x: hidden; overflow-y: hidden; white-space-collapse: collapse; text-wrap-mode: nowrap; text-overflow: ellipsis; }',
    );
    expect(css).toContain('span:last-child');
    expect(css).toContain('overflow-x: hidden');
    expect(css).toContain('overflow-y: hidden');
    expect(css).toContain('white-space-collapse: collapse');
    expect(css).toContain('text-wrap-mode: nowrap');
  });

  it('keeps safe print css and drops dangerous declarations', () => {
    const css = sanitizeTemplateCss(`
      @import url("https://example.com/font.css");
      @page { size: A4; margin: 0; }
      .page { color: #111827; background: url(javascript:alert(1)); width: 210mm; }
    `);

    expect(css).toContain('@page { size: A4; margin: 0 }');
    expect(css).toContain('.page { color: #111827; width: 210mm }');
    expect(css).not.toContain('@import');
    expect(css).not.toContain('javascript:');
  });

  it('rejects unknown dynamic fields', () => {
    expect(() =>
      assertWhitelistedDynamicFields(
        '<span data-edutrack-field="student.password">Secret</span>',
      ),
    ).toThrow(BadRequestException);
  });
});

describe('invoice template renderer', () => {
  it('resolves whitelisted dynamic fields and removes field metadata', () => {
    const html = renderInvoiceTemplateHtml(
      '<span class="student-name" data-edutrack-field="student.fullName">Nguyễn Minh Anh</span>',
      {
        student: {
          fullName: 'Trần Văn Nam',
        },
      },
    );

    expect(html).toBe('<span class="student-name">Trần Văn Nam</span>');
  });

  it('uses formatter-aware preview values when data is missing', () => {
    const html = renderInvoiceTemplateHtml(
      '<span data-edutrack-field="tuition.totalAmount">800.000 VND</span>',
      {},
    );

    expect(html).toBe('<span>800.000 VND</span>');
  });
});
