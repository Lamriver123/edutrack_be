import { load } from 'cheerio';
import { InvoiceRegionKey } from '../constants/invoice-regions';
import {
  assertWhitelistedDynamicFields,
  sanitizeTemplateCss,
  sanitizeTemplateHtml,
} from './sanitize-template';

// Region fragments come only from the receipt renderer, never from request bodies.
export function renderRegionTemplate(
  html: string,
  css: string,
  fragments: Record<InvoiceRegionKey, string>,
) {
  assertWhitelistedDynamicFields(html);
  const $ = load(sanitizeTemplateHtml(html), {}, false);
  $('[data-edutrack-region]').each((_index, node) => {
    const key = $(node).attr('data-edutrack-region') as InvoiceRegionKey;
    $(node)
      .html(fragments[key])
      .css('height', 'auto')
      .removeAttr('data-edutrack-region');
  });
  $('[data-edutrack-image-id]').removeAttr('data-edutrack-image-id');
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Bản xem trước mẫu hóa đơn</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;700;800;900&display=swap"><style>${sanitizeTemplateCss(css)}</style></head><body>${$.html()}</body></html>`;
}
