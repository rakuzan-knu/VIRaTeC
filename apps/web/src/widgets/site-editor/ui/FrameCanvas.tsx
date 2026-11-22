import { useEffect, useState } from 'react';
import { useSiteEditorMessages } from '../model/messages';
import { isTextInput } from '../model/shortcuts';
import { postFrameKey, postFrameTarget } from '../model/useFrameSync';
import { toFrameTarget, useCanvasTargets, type CanvasTarget } from '../model/useCanvasTargets';
import { EditorOutlines } from './EditorOutlines';

interface FrameCanvasProps {
  hasSelection: boolean;
}

const FORWARDED_KEYS = new Set(['z', 'y', 'k']);

const choose = (
  setSelected: (target: CanvasTarget | null) => void,
  target: CanvasTarget | null,
) => {
  setSelected(target);
  if (target) postFrameTarget(toFrameTarget(target));
};

export function FrameCanvas({ hasSelection }: FrameCanvasProps) {
  const t = useSiteEditorMessages();
  const [selected, setSelected] = useState<CanvasTarget | null>(null);
  const pick = (target: CanvasTarget | null) => choose(setSelected, target);
  const { hovered } = useCanvasTargets(true, pick, pick);
  const visibleSelected = hasSelection ? selected : null;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey;
      const isForwarded =
        event.key === 'Escape' ||
        (isModifier && FORWARDED_KEYS.has(event.key.toLowerCase()) && !isTextInput(event.target));
      if (!isForwarded) return;
      event.preventDefault();
      postFrameKey(event);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return <EditorOutlines hovered={hovered} selected={visibleSelected} t={t} />;
}
