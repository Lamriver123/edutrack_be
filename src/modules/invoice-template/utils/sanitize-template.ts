import { BadRequestException } from '@nestjs/common';
import { INVOICE_DYNAMIC_FIELD_MAP } from '../constants/invoice-fields';
import { load } from 'cheerio';
import { INVOICE_REGION_KEYS } from '../constants/invoice-regions';

const FORBIDDEN_BLOCK_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'style',
  'textarea',
] as const;

const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'br',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'header',
  'hr',
  'img',
  'i',
  'main',
  'p',
  'section',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
]);

const VOID_TAGS = new Set(['br', 'hr', 'img']);
const GLOBAL_ATTRIBUTES = new Set([
  'class',
  'id',
  'data-edutrack-field',
  'data-edutrack-region',
  'data-edutrack-image-id',
  'style',
]);
const TAG_ATTRIBUTES = new Map<string, Set<string>>([
  ['a', new Set(['href', 'rel', 'target', 'title'])],
  ['img', new Set(['alt', 'height', 'src', 'title', 'width'])],
  ['td', new Set(['colspan', 'rowspan'])],
  ['th', new Set(['colspan', 'rowspan'])],
]);

const ALLOWED_CSS_PROPERTIES = new Set([
  'align-items',
  'background',
  'background-color',
  'background-image',
  'border',
  'border-bottom',
  'border-collapse',
  'border-color',
  'border-left',
  'border-radius',
  'border-right',
  'border-style',
  'border-top',
  'border-width',
  'bottom',
  'box-sizing',
  'color',
  'display',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'gap',
  'grid-template-columns',
  'grid-template-rows',
  'grid-column',
  'grid-column-start',
  'grid-column-end',
  'grid-row',
  'grid-row-start',
  'grid-row-end',
  'flex',
  'flex-basis',
  'flex-shrink',
  'overflow',
  'text-overflow',
  'box-shadow',
  'height',
  'justify-content',
  'left',
  'letter-spacing',
  'line-height',
  'margin',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'margin-top',
  'max-height',
  'max-width',
  'min-height',
  'min-width',
  'object-fit',
  'padding',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'place-items',
  'position',
  'right',
  'size',
  'text-align',
  'text-decoration',
  'text-transform',
  'top',
  'transform',
  'vertical-align',
  'white-space',
  'width',
  'z-index',
]);

// GrapesJS serializes shorthand borders and spacing into these CSS longhands.
for (const side of ['top', 'right', 'bottom', 'left']) {
  for (const part of ['width', 'style', 'color']) {
    ALLOWED_CSS_PROPERTIES.add(`border-${side}-${part}`);
  }
}
for (const property of [
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'row-gap',
  'column-gap',
  'justify-items',
  'overflow-x',
  'overflow-y',
  'white-space-collapse',
  'text-wrap-mode',
  'text-wrap-style',
]) {
  ALLOWED_CSS_PROPERTIES.add(property);
}

const ATTRIBUTE_PATTERN =
  /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const DATA_FIELD_PATTERN =
  /data-edutrack-field\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>`]+))/gi;

export function sanitizeTemplateHtml(html: string) {
  let sanitized = stripForbiddenBlocks(String(html || ''));

  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
  sanitized = sanitized.replace(/<\/?([a-zA-Z][\w:-]*)([^>]*)>/g, (match) =>
    sanitizeTag(match),
  );
  sanitized = sanitized.replace(/\s+javascript:/gi, '');

  return sanitized.trim();
}

export function sanitizeTemplateCss(css = '') {
  const source = String(css || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@import\b[^;]*;?/gi, '')
    .replace(/<\/?style\b[^>]*>/gi, '');

  let sanitized = '';
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(source)) !== null) {
    const selector = sanitizeCssSelector(match[1] ?? '');
    const declarations = sanitizeCssDeclarationBlock(match[2] ?? '');

    if (selector && declarations) {
      sanitized += `${selector} { ${declarations} }\n`;
    }
  }

  return sanitized.trim();
}

export function findDynamicFieldKeys(html: string) {
  const keys = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = DATA_FIELD_PATTERN.exec(html)) !== null) {
    keys.add((match[1] ?? match[2] ?? match[3] ?? '').trim());
  }

  return [...keys];
}

export function assertWhitelistedDynamicFields(html: string) {
  const $ = load(html, {}, false);
  $('[data-edutrack-region]').each((_index, node) => {
    const region = $(node).attr('data-edutrack-region') ?? '';
    if (
      !INVOICE_REGION_KEYS.has(region) ||
      $(node).parents('[data-edutrack-region]').length
    ) {
      throw new BadRequestException(
        'Vùng dữ liệu hóa đơn không hợp lệ hoặc bị lồng nhau.',
      );
    }
  });
  const unknownFields = findDynamicFieldKeys(html).filter(
    (fieldKey) => !INVOICE_DYNAMIC_FIELD_MAP.has(fieldKey),
  );

  if (unknownFields.length) {
    throw new BadRequestException(
      `Trường động hóa đơn không hợp lệ: ${unknownFields.join(', ')}.`,
    );
  }
}

function stripForbiddenBlocks(html: string) {
  return FORBIDDEN_BLOCK_TAGS.reduce((result, tagName) => {
    const pattern = new RegExp(`<${tagName}\\b[\\s\\S]*?<\\/${tagName}>`, 'gi');

    return result.replace(pattern, '');
  }, html);
}

function sanitizeTag(tag: string) {
  const parsed = tag.match(/^<\/?\s*([a-zA-Z][\w:-]*)([^>]*)>$/);

  if (!parsed) {
    return '';
  }

  const [, rawTagName, rawAttributes = ''] = parsed;
  const tagName = rawTagName.toLowerCase();
  const isClosingTag = /^<\//.test(tag);

  if (!ALLOWED_TAGS.has(tagName)) {
    return '';
  }

  if (isClosingTag) {
    return VOID_TAGS.has(tagName) ? '' : `</${tagName}>`;
  }

  const attributes = sanitizeAttributes(tagName, rawAttributes);

  return `<${tagName}${attributes}${VOID_TAGS.has(tagName) ? ' /' : ''}>`;
}

function sanitizeAttributes(tagName: string, attributes: string) {
  const allowedTagAttributes = TAG_ATTRIBUTES.get(tagName) ?? new Set<string>();
  const safeAttributes: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = ATTRIBUTE_PATTERN.exec(attributes)) !== null) {
    const attributeName = match[1].toLowerCase();
    const rawValue = match[2] ?? match[3] ?? match[4] ?? '';

    if (attributeName.startsWith('on')) {
      continue;
    }

    if (
      !GLOBAL_ATTRIBUTES.has(attributeName) &&
      !allowedTagAttributes.has(attributeName)
    ) {
      continue;
    }

    const safeValue = sanitizeAttributeValue(attributeName, rawValue);

    if (safeValue === null) {
      continue;
    }

    safeAttributes.push(`${attributeName}="${escapeAttribute(safeValue)}"`);
  }

  return safeAttributes.length ? ` ${safeAttributes.join(' ')}` : '';
}

function sanitizeAttributeValue(attributeName: string, value: string) {
  const trimmedValue = value.trim();

  if (/javascript:/i.test(trimmedValue)) {
    return null;
  }

  if (attributeName === 'style') {
    return sanitizeCssDeclarationBlock(trimmedValue);
  }

  if (attributeName === 'data-edutrack-field') {
    return INVOICE_DYNAMIC_FIELD_MAP.has(trimmedValue) ? trimmedValue : null;
  }

  if (attributeName === 'href' || attributeName === 'src') {
    return isSafeUrl(trimmedValue) ? trimmedValue : null;
  }

  if (attributeName === 'target') {
    return trimmedValue === '_blank' ? trimmedValue : null;
  }

  if (attributeName === 'rel') {
    return trimmedValue
      .split(/\s+/)
      .filter((item) => ['noopener', 'noreferrer'].includes(item))
      .join(' ');
  }

  if (attributeName === 'colspan' || attributeName === 'rowspan') {
    const parsed = Number(trimmedValue);

    return Number.isInteger(parsed) && parsed > 0 && parsed <= 24
      ? String(parsed)
      : null;
  }

  if (attributeName === 'width' || attributeName === 'height') {
    return /^[\d.%pxremem\s-]+$/i.test(trimmedValue) ? trimmedValue : null;
  }

  return trimmedValue.slice(0, 500);
}

function sanitizeCssDeclarationBlock(css: string) {
  return css
    .split(';')
    .map((declaration) => sanitizeCssDeclaration(declaration))
    .filter(Boolean)
    .join('; ');
}

function sanitizeCssDeclaration(declaration: string) {
  const separatorIndex = declaration.indexOf(':');

  if (separatorIndex <= 0) {
    return '';
  }

  const property = declaration.slice(0, separatorIndex).trim().toLowerCase();
  const value = declaration.slice(separatorIndex + 1).trim();

  if (!ALLOWED_CSS_PROPERTIES.has(property)) {
    return '';
  }

  if (isDangerousCssValue(value)) {
    return '';
  }

  return `${property}: ${value.slice(0, 500)}`;
}

function sanitizeCssSelector(selector: string) {
  const trimmedSelector = selector.trim();

  if (!trimmedSelector) {
    return '';
  }

  if (trimmedSelector === '@page') {
    return '@page';
  }

  if (
    /[@<>{}]|javascript:|expression\s*\(/i.test(trimmedSelector) ||
    !/^[#.:[\]\w\s>+~*,="'()-]+$/.test(trimmedSelector)
  ) {
    return '';
  }

  return trimmedSelector.slice(0, 500);
}

function isDangerousCssValue(value: string) {
  return (
    /javascript:|expression\s*\(|behavior\s*:|-moz-binding|@import/i.test(
      value,
    ) || /url\s*\(\s*(?!['"]?(?:https?:\/\/|\/))/i.test(value)
  );
}

function isSafeUrl(value: string) {
  return /^(https:\/\/|\/(?!\/)|http:\/\/localhost(?::\d+)?\/|http:\/\/127\.0\.0\.1(?::\d+)?\/)/i.test(
    value,
  );
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
