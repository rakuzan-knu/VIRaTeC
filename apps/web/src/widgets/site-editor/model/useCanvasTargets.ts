import { useEffect, useState } from 'react';
import {
  decodeFieldMarks,
  findAssetAddress,
  type ContentAssetAddress,
  type ContentFieldAddress,
} from '@/shared/lib';

export const EDITOR_ROOT_ATTRIBUTE = 'data-site-editor';

const SECTION_ATTRIBUTE = 'data-page-section';

const MAX_ANCESTORS = 6;
const ASSET_HOST = 'images.ctfassets.net';

export type CanvasTarget =
  | { kind: 'field'; address: ContentFieldAddress; element: Element }
  | { kind: 'asset'; address: ContentAssetAddress; element: Element }
  | { kind: 'section'; sectionId: string; element: Element };

const assetIdFromImage = (image: HTMLImageElement) => {
  try {
    const url = new URL(image.currentSrc || image.src);
    return url.hostname === ASSET_HOST ? (url.pathname.split('/')[2] ?? null) : null;
  } catch {
    return null;
  }
};

export const resolveCanvasTarget = (start: EventTarget | null): CanvasTarget | null => {
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
    if (marks.length > 1) break;
    const [address] = marks;
    if (address) return { kind: 'field', address, element };
    element = element.parentElement;
  }

  const section = start.closest(`[${SECTION_ATTRIBUTE}]`);
  const sectionId = section?.getAttribute(SECTION_ATTRIBUTE);
  return section && sectionId ? { kind: 'section', sectionId, element: section } : null;
};

export const targetKey = (target: CanvasTarget | null) => {
  if (!target) return '';
  if (target.kind === 'section') return `section:${target.sectionId}`;
  const locale = target.kind === 'field' ? target.address.locale : '';
  return `${target.kind}:${target.address.entryId}:${target.address.fieldId}:${locale}`;
};

export function useCanvasTargets(enabled: boolean, onPick: (target: CanvasTarget) => void) {
  const [hovered, setHovered] = useState<CanvasTarget | null>(null);

  useEffect(() => {
    if (!enabled) {
      setHovered(null);
      return;
    }

    let frame = 0;
    const handleMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = event.altKey ? null : resolveCanvasTarget(event.target);
        setHovered((current) => (targetKey(current) === targetKey(next) ? current : next));
      });
    };
    const handleLeave = () => setHovered(null);
    const handleClick = (event: MouseEvent) => {
      if (event.altKey || event.button !== 0) return;
      const target = resolveCanvasTarget(event.target);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      onPick(target);
    };

    document.addEventListener('pointermove', handleMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handleLeave);
    document.addEventListener('click', handleClick, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', handleMove);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
      document.removeEventListener('click', handleClick, true);
    };
  }, [enabled, onPick]);

  return hovered;
}

export function useElementRect(element: Element | null) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!element) {
      setRect(null);
      return;
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setRect(element.isConnected ? element.getBoundingClientRect() : null),
      );
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
  }, [element]);

  return rect;
}
