import { recordResourceOf, type RecordResource } from '@viratec/contracts';
import { stripFieldMarks } from '@/shared/lib';
import {
  findContentType,
  isCollectionType,
  isContainerType,
  type FieldDefinition,
} from './contentModel';
import { collectCanvasTargets, resolveCanvasTarget, type CanvasTarget } from './useCanvasTargets';

export type EntryTarget = Extract<CanvasTarget, { kind: 'entry' }>;

export type CollectionKind =
  | { kind: 'record'; resource: RecordResource }
  | { kind: 'ordered'; orderFields: FieldDefinition[] }
  | { kind: 'linked' };

export interface CollectionItem {
  target: EntryTarget;
  cell: Element;
}

export interface CollectionGrid {
  key: string;
  contentTypeId: string;
  container: Element;
  items: CollectionItem[];
  collection: CollectionKind;
}

const MAX_CELL_DEPTH = 4;
const MAX_LABEL_LENGTH = 60;

const isOrderField = (field: FieldDefinition) =>
  field.type === 'Integer' && (field.id === 'order' || field.id.endsWith('Order'));

export const collectionKindOf = (contentTypeId: string): CollectionKind => {
  const resource = recordResourceOf(contentTypeId);
  if (resource) return { kind: 'record', resource };
  if (isCollectionType(contentTypeId)) {
    const orderFields = findContentType(contentTypeId)?.fields.filter(isOrderField) ?? [];
    return { kind: 'ordered', orderFields };
  }
  return { kind: 'linked' };
};

export const canReorder = (collection: CollectionKind) =>
  collection.kind === 'linked' ||
  (collection.kind === 'ordered' && collection.orderFields.length > 0);

export const removalOf = (collection: CollectionKind) => {
  if (collection.kind === 'record') return 'delete';
  if (collection.kind === 'linked') return 'remove';
  return collection.orderFields.some((field) => !field.required) ? 'hide' : null;
};

const isListContainer = (element: Element) => {
  if (element.tagName === 'UL' || element.tagName === 'OL') return true;
  const { display } = getComputedStyle(element);
  return display.includes('grid') || (display.includes('flex') && element.childElementCount > 1);
};

const cellOf = (element: Element) => {
  let cell = element;
  for (let depth = 0; depth < MAX_CELL_DEPTH && cell.parentElement; depth += 1) {
    if (isListContainer(cell.parentElement)) return cell;
    cell = cell.parentElement;
  }
  return element;
};

const MAX_ENTRY_DEPTH = 8;

const entryTargetOf = (target: CanvasTarget): EntryTarget | null => {
  if (target.kind === 'entry') return target;
  if (target.kind !== 'field' || isContainerType(target.address.contentTypeId)) return null;
  let element = target.element.parentElement;
  let found: EntryTarget | null = null;
  for (let depth = 0; element && depth < MAX_ENTRY_DEPTH; depth += 1) {
    const resolved = resolveCanvasTarget(element);
    const isSameEntry =
      resolved?.kind === 'entry' && resolved.address.entryId === target.address.entryId;
    const isOwnField =
      resolved?.kind === 'field' && resolved.address.entryId === target.address.entryId;
    if (isSameEntry) found = resolved;
    else if (!isOwnField) break;
    element = element.parentElement;
  }
  return found;
};

export const collectCollectionGrids = (): CollectionGrid[] => {
  const grids = new Map<Element, Map<string, CollectionItem[]>>();
  const seen = new Set<string>();
  for (const candidate of collectCanvasTargets()) {
    const target = entryTargetOf(candidate);
    if (!target || seen.has(target.address.entryId)) continue;
    seen.add(target.address.entryId);
    const cell = cellOf(target.element);
    const container = cell.parentElement;
    if (!container) continue;
    const byType = grids.get(container) ?? new Map<string, CollectionItem[]>();
    const items = byType.get(target.address.contentTypeId) ?? [];
    items.push({ target, cell });
    byType.set(target.address.contentTypeId, items);
    grids.set(container, byType);
  }
  let index = 0;
  return [...grids.entries()].flatMap(([container, byType]) =>
    [...byType.entries()].map(([contentTypeId, items]) => {
      index += 1;
      return {
        key: `${contentTypeId}:${index}:${items[0]?.target.address.entryId ?? ''}`,
        contentTypeId,
        container,
        items,
        collection: collectionKindOf(contentTypeId),
      };
    }),
  );
};

const LABEL_SELECTOR = 'h1, h2, h3, h4, h5, h6, strong, figcaption, img[alt]';

const cleanText = (text: string | null | undefined) =>
  stripFieldMarks(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();

export const itemLabel = (item: CollectionItem, fallback: string) => {
  const labelled = item.cell.querySelector(LABEL_SELECTOR);
  const text =
    cleanText(labelled instanceof HTMLImageElement ? labelled.alt : labelled?.textContent) ||
    cleanText(item.cell instanceof HTMLElement ? item.cell.innerText.split('\n')[0] : null);
  if (!text) return fallback;
  return text.length > MAX_LABEL_LENGTH ? `${text.slice(0, MAX_LABEL_LENGTH - 1)}…` : text;
};

export interface Slot {
  top: number;
  left: number;
  width: number;
  height: number;
  isCompact: boolean;
}

const COMPACT_HEIGHT = 48;
const DEFAULT_GAP = 16;

export const addSlotOf = (grid: CollectionGrid): Slot | null => {
  const rects = grid.items.map((item) => item.cell.getBoundingClientRect());
  const last = rects[rects.length - 1];
  if (!last) return null;
  const box = grid.container.getBoundingClientRect();
  const style = getComputedStyle(grid.container);
  const columnGap = Number.parseFloat(style.columnGap) || DEFAULT_GAP;
  const rowGap = Number.parseFloat(style.rowGap) || DEFAULT_GAP;
  const left = last.right + columnGap;
  if (rects.length > 1 && left + last.width <= box.right + 1) {
    return { top: last.top, left, width: last.width, height: last.height, isCompact: false };
  }
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  return {
    top: bottom + Math.min(rowGap, DEFAULT_GAP),
    left: box.left,
    width: box.width,
    height: COMPACT_HEIGHT,
    isCompact: true,
  };
};

export const isOnScreen = (element: Element) => {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0;
};
