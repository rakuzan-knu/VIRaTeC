import { useEffect, useState } from 'react';
import { collectCollectionGrids, type CollectionGrid } from './collections';
import { EDITOR_ROOT_ATTRIBUTE } from './useCanvasTargets';

const RECOMPUTE_DELAY_MS = 250;
const NO_GRIDS: CollectionGrid[] = [];

const isEditorNode = (node: Node) => {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest(`[${EDITOR_ROOT_ATTRIBUTE}]`));
};

export function useCollectionGrids(enabled: boolean) {
  const [grids, setGrids] = useState<CollectionGrid[]>(NO_GRIDS);
  const [, setLayoutTick] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setGrids(NO_GRIDS);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    const recompute = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setGrids(collectCollectionGrids()), RECOMPUTE_DELAY_MS);
    };
    const relayout = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setLayoutTick((tick) => tick + 1));
    };
    const observer = new MutationObserver((records) => {
      if (records.some((record) => !isEditorNode(record.target))) recompute();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('scroll', relayout, { capture: true, passive: true });
    window.addEventListener('resize', recompute, { passive: true });
    recompute();
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', relayout, { capture: true });
      window.removeEventListener('resize', recompute);
    };
  }, [enabled]);

  return grids;
}
