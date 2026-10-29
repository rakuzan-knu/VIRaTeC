import { recordResourceOf, type RecordResource } from '@viratec/contracts';
import { allowedValues, findField } from './contentModel';
import { findRecordField } from './recordModel';
import type { CanvasTarget } from './useCanvasTargets';

export interface InlineField {
  target: Extract<CanvasTarget, { kind: 'field' }>;
  resource: RecordResource | null;
  multiline: boolean;
  localized: boolean;
}

const INLINE_RECORD_KINDS = new Set(['text', 'longText']);

export const inlineFieldOf = (target: CanvasTarget): InlineField | null => {
  if (target.kind !== 'field') return null;
  const { contentTypeId, fieldId } = target.address;
  const resource = recordResourceOf(contentTypeId);
  if (resource) {
    const field = findRecordField(resource, fieldId);
    if (!field?.localized || !INLINE_RECORD_KINDS.has(field.kind)) return null;
    return { target, resource, multiline: field.kind === 'longText', localized: true };
  }
  const field = findField(contentTypeId, fieldId);
  if (!field || (field.type !== 'Symbol' && field.type !== 'Text')) return null;
  if (allowedValues(field) || field.source === 'publication') return null;
  return { target, resource: null, multiline: field.type === 'Text', localized: field.localized };
};

const COPIED_STYLES = [
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'text-transform',
  'text-align',
  'font-feature-settings',
  'font-variant-numeric',
] as const;

const isTransparent = (color: string) =>
  color === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(color.replace(/\s+/g, ' '));

export const typographyOf = (element: Element) => {
  const style = getComputedStyle(element);
  const copied = Object.fromEntries(
    COPIED_STYLES.map((name) => [name, style.getPropertyValue(name)]),
  );
  const color = style.getPropertyValue('color');
  return { ...copied, ...(isTransparent(color) ? {} : { color }) };
};

export const contentBox = (element: Element) => {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  const left =
    rect.left + Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.borderLeftWidth);
  const right =
    rect.right - Number.parseFloat(style.paddingRight) - Number.parseFloat(style.borderRightWidth);
  return { left, width: Math.max(right - left, 0) };
};

export const targetRange = (target: InlineField['target']) => {
  if (target.range) return target.range;
  const range = document.createRange();
  range.selectNodeContents(target.element);
  return range;
};

const HIGHLIGHT_NAME = 'site-editor-inline';

export const hideRange = (range: Range, element: Element) => {
  if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
    CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(range));
    return () => {
      CSS.highlights.delete(HIGHLIGHT_NAME);
    };
  }
  if (!(element instanceof HTMLElement)) return () => undefined;
  const previous = element.style.visibility;
  element.style.visibility = 'hidden';
  return () => {
    element.style.visibility = previous;
  };
};
