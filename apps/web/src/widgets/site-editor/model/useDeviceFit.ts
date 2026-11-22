import { useEffect, useState } from 'react';

const MIN_SCALE = 0.2;

interface Size {
  width: number;
  height: number;
}

export function useDeviceFit(
  stage: HTMLElement | null,
  screens: readonly Size[],
  bezel: number,
  gap: number,
) {
  const [box, setBox] = useState<Size | null>(null);

  useEffect(() => {
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stage]);

  if (!box || screens.length === 0) return null;
  const totalWidth = screens.reduce((sum, screen) => sum + screen.width, 0);
  const maxHeight = Math.max(...screens.map((screen) => screen.height));
  const fit = Math.min(
    (box.width - bezel * 2 * screens.length - gap * (screens.length - 1)) / totalWidth,
    (box.height - bezel * 2) / maxHeight,
  );
  return Math.max(MIN_SCALE, Math.min(1, fit));
}
