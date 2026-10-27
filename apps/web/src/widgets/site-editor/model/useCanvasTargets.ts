import { useEffect, useState } from 'react';
import {
  decodeFieldMarks,
  findAssetAddress,
  stripFieldMarks,
  type ContentAssetAddress,
  type ContentFieldAddress,
} from '@/shared/lib';
import { isContainerType } from './contentModel';

export const EDITOR_ROOT_ATTRIBUTE = 'data-site-editor';

const SECTION_ATTRIBUTE = 'data-page-section';

const MAX_ANCESTORS = 6;
const ASSET_HOST = 'images.ctfassets.net';

export interface ContentEntryAddress {
  entryId: string;
  contentTypeId: string;
}

export interface SectionTarget {
  kind: 'section';
  sectionId: string;
  element: Element;
}

export type CanvasTarget =
  | { kind: 'field'; address: ContentFieldAddress; element: Element; range?: Range }
  | { kind: 'entry'; address: ContentEntryAddress; element: Element }
  | { kind: 'asset'; address: ContentAssetAddress; element: Element }
  | SectionTarget;

const assetIdFromImage = (image: HTMLImageElement) => {
  try {
    const url = new URL(image.currentSrc || image.src);
    return url.hostname === ASSET_HOST ? (url.pathname.split('/')[2] ?? null) : null;
  } catch {
    return null;
  }
};

const visibleText = (text: string | null) => stripFieldMarks(text ?? '').trim();

const isInline = (element: Element) => {
  const { display } = getComputedStyle(element);
  return display.startsWith('inline') || display === 'contents';
};

const hasForeignText = (element: Element) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? '';
    if (decodeFieldMarks(text).length === 0 && visibleText(text)) return true;
  }
  return false;
};

const isInlinePath = (start: Element, element: Element) => {
  for (let node: Element | null = start; node && node !== element; node = node.parentElement) {
    if (!isInline(node) && visibleText(node.textContent)) return false;
  }
  return true;
};

const ownsField = (start: Element, element: Element) =>
  element === start ? !hasForeignText(element) : isInlinePath(start, element);

export interface CanvasPoint {
  x: number;
  y: number;
}

const containsPoint = (node: Node, point: CanvasPoint) => {
  const range = document.createRange();
  range.selectNodeContents(node);
  return [...range.getClientRects()].some(
    (rect) =>
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom,
  );
};

const textAtPoint = (element: Element, point: CanvasPoint | undefined) => {
  if (!point) return null;
  const node = document.caretPositionFromPoint?.(point.x, point.y)?.offsetNode;
  return node instanceof Text && node.parentElement === element && containsPoint(node, point)
    ? node
    : null;
};

const fieldSegment = (start: Element, element: Element, point: CanvasPoint | undefined) => {
  const anchor: Node | null = start === element ? textAtPoint(element, point) : start;
  if (!anchor || (start !== element && !isInlinePath(start, element))) return null;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let previous: Text | null = null;
  let reached = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!(node instanceof Text)) continue;
    if (!reached && (node === anchor || anchor.contains(node))) reached = true;
    const [address] = decodeFieldMarks(node.data);
    if (!address) continue;
    if (reached) {
      const range = document.createRange();
      if (previous) range.setStartAfter(previous);
      else range.setStart(element, 0);
      range.setEndAfter(node);
      return { address, range };
    }
    previous = node;
  }
  return null;
};

const MAX_CONTAINER_MARKS = 1;

const childEntry = (marks: readonly ContentFieldAddress[]): ContentEntryAddress | null => {
  const children = marks.filter((mark) => !isContainerType(mark.contentTypeId));
  if (marks.length - children.length > MAX_CONTAINER_MARKS) return null;
  const [first] = children;
  if (!first || children.some((mark) => mark.entryId !== first.entryId)) return null;
  return { entryId: first.entryId, contentTypeId: first.contentTypeId };
};

const resolveSection = (start: Element): SectionTarget | null => {
  const section = start.closest(`[${SECTION_ATTRIBUTE}]`);
  const sectionId = section?.getAttribute(SECTION_ATTRIBUTE);
  return section && sectionId ? { kind: 'section', sectionId, element: section } : null;
};

export const resolveCanvasTarget = (
  start: EventTarget | null,
  point?: CanvasPoint,
): CanvasTarget | null => {
  if (!(start instanceof Element) || start.closest(`[${EDITOR_ROOT_ATTRIBUTE}]`)) return null;

  const image = start instanceof HTMLImageElement ? start : start.querySelector('img');
  if (image && (image === start || start.childElementCount === 1)) {
    const assetId = assetIdFromImage(image);
    const address = assetId ? findAssetAddress(assetId) : undefined;
    if (address) return { kind: 'asset', address, element: image };
  }

  let element: Element | null = start;
  for (let depth = 0; element && depth < MAX_ANCESTORS; depth += 1) {
    const marks = decodeFieldMarks(element.textContent ?? '');
    const [address] = marks;
    if (address && marks.length === 1 && ownsField(start, element)) {
      return { kind: 'field', address, element };
    }
    const entry = childEntry(marks);
    if (entry) return { kind: 'entry', address: entry, element };
    if (address) {
      const segment = fieldSegment(start, element, point);
      return segment ? { kind: 'field', ...segment, element } : resolveSection(start);
    }
    element = element.parentElement;
  }

  return resolveSection(start);
};

export const findSectionField = (sectionId: string): ContentFieldAddress | null => {
  const section = document.querySelector(`[${SECTION_ATTRIBUTE}="${CSS.escape(sectionId)}"]`);
  const [address] = decodeFieldMarks(section?.textContent ?? '');
  return address ?? null;
};

export const targetKey = (target: CanvasTarget | null) => {
  if (!target) return '';
  if (target.kind === 'section') return `section:${target.sectionId}`;
  if (target.kind === 'entry') return `entry:${target.address.entryId}`;
  const locale = target.kind === 'field' ? target.address.locale : '';
  return `${target.kind}:${target.address.entryId}:${target.address.fieldId}:${locale}`;
};

const isInsideEditor = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest(`[${EDITOR_ROOT_ATTRIBUTE}]`));

export function useCanvasTargets(
  enabled: boolean,
  onSelect: (target: CanvasTarget | null) => void,
  onOpen: (target: CanvasTarget) => void,
) {
  const [hovered, setHovered] = useState<CanvasTarget | null>(null);
  const [section, setSection] = useState<SectionTarget | null>(null);

  useEffect(() => {
    if (!enabled) {
      setHovered(null);
      setSection(null);
      return;
    }

    let frame = 0;
    const handleMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (isInsideEditor(event.target)) return;
        const target = event.target instanceof Element ? event.target : null;
        const nextSection = target ? resolveSection(target) : null;
        setSection((current) =>
          targetKey(current) === targetKey(nextSection) ? current : nextSection,
        );
        const resolved = event.altKey
          ? null
          : resolveCanvasTarget(event.target, { x: event.clientX, y: event.clientY });
        const next = resolved?.kind === 'section' ? null : resolved;
        setHovered((current) => (targetKey(current) === targetKey(next) ? current : next));
      });
    };
    const handleLeave = () => {
      setHovered(null);
      setSection(null);
    };
    const handleClick = (event: MouseEvent) => {
      if (event.altKey || event.button !== 0 || isInsideEditor(event.target)) return;
      const target = resolveCanvasTarget(event.target, { x: event.clientX, y: event.clientY });
      if (!target) {
        onSelect(null);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onSelect(target);
    };
    const handleDoubleClick = (event: MouseEvent) => {
      if (event.altKey || event.button !== 0) return;
      const target = resolveCanvasTarget(event.target, { x: event.clientX, y: event.clientY });
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      window.getSelection()?.removeAllRanges();
      onOpen(target);
    };
    const handleMouseDown = (event: MouseEvent) => {
      if (
        event.detail > 1 &&
        !event.altKey &&
        resolveCanvasTarget(event.target, { x: event.clientX, y: event.clientY })
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener('pointermove', handleMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handleLeave);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('dblclick', handleDoubleClick, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', handleMove);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('dblclick', handleDoubleClick, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [enabled, onSelect, onOpen]);

  return { hovered, section };
}

const NO_RECTS: DOMRect[] = [];

const visibleRects = (element: Element, range: Range | undefined) =>
  element.isConnected
    ? [...(range ?? element).getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0)
    : NO_RECTS;

export function useElementRects(element: Element | null, range?: Range) {
  const [rects, setRects] = useState<DOMRect[]>(NO_RECTS);

  useEffect(() => {
    if (!element) {
      setRects(NO_RECTS);
      return;
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRects(visibleRects(element, range)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('scroll', update, { capture: true, passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
    };
  }, [element, range]);

  return rects;
}
