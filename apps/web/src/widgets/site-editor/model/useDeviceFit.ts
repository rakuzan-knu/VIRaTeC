import { useEffect, useState } from 'react';

const MIN_SCALE = 0.2;

interface Size {
  width: number;
  height: number;
}

export function useDeviceFit(stage: HTMLElement | null, screen: Size, bezel: number) {
  const [box, setBox] = useState<Size | null>(null);

  useEffect(() => {
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stage]);

  if (!box) return null;
  const fit = Math.min(
    (box.width - bezel * 2) / screen.width,
    (box.height - bezel * 2) / screen.height,
  );
  return Math.max(MIN_SCALE, Math.min(1, fit));
}
