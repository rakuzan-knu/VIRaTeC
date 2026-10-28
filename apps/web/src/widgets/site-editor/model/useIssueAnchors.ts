import { useEffect, useRef, useState } from 'react';
import { decodeFieldMarks } from '@/shared/lib';
import { EDITOR_ROOT_ATTRIBUTE } from './useCanvasTargets';
import type { IssueAddress, IssueTarget } from './useIssueTargets';

const RECOMPUTE_DELAY_MS = 300;

export interface IssueAnchor {
  element: Element;
  targets: IssueTarget[];
}

const matches = (address: IssueAddress, strict: boolean) => (text: string) =>
  decodeFieldMarks(text).some(
    (mark) =>
      mark.entryId === address.entryId &&
      (!strict ||
        ((!address.fieldId || mark.fieldId === address.fieldId) &&
          (!address.locale || mark.locale === address.locale))),
  );

const findElement = (address: IssueAddress) => {
  const strict = matches(address, true);
  const loose = matches(address, false);
  let fallback: Element | null = null;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const element = node.parentElement;
    if (!element || element.closest(`[${EDITOR_ROOT_ATTRIBUTE}]`)) continue;
    const text = node.textContent ?? '';
    if (strict(text)) return element;
    if (!fallback && loose(text)) fallback = element;
  }
  return fallback;
};

const collectAnchors = (targets: readonly IssueTarget[]) => {
  const anchors = new Map<Element, IssueTarget[]>();
  for (const target of targets) {
    const element = findElement(target.address);
    if (!element) continue;
    anchors.set(element, [...(anchors.get(element) ?? []), target]);
  }
  return [...anchors.entries()].map(([element, list]) => ({ element, targets: list }));
};

export function useIssueAnchors(enabled: boolean, targets: readonly IssueTarget[]) {
  const [anchors, setAnchors] = useState<IssueAnchor[]>([]);
  const [, setTick] = useState(0);
  const targetsKey = targets.map((target) => target.key).join('|');
  const targetsRef = useRef(targets);
  targetsRef.current = targets;

  useEffect(() => {
    if (!enabled || !targetsKey) {
      setAnchors([]);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    const recompute = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setAnchors(collectAnchors(targetsRef.current)), RECOMPUTE_DELAY_MS);
    };
    const relayout = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setTick((tick) => tick + 1));
    };
    const observer = new MutationObserver((records) => {
      const isPageChange = records.some((record) => {
        const element =
          record.target instanceof Element ? record.target : record.target.parentElement;
        return !element?.closest(`[${EDITOR_ROOT_ATTRIBUTE}]`);
      });
      if (isPageChange) recompute();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('scroll', relayout, { capture: true, passive: true });
    window.addEventListener('resize', relayout, { passive: true });
    recompute();
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', relayout, { capture: true });
      window.removeEventListener('resize', relayout);
    };
  }, [enabled, targetsKey]);

  return anchors;
}
