import type { DeviceCutout as Cutout } from '../model/devicePresets';

interface DeviceCutoutProps {
  cutout: Cutout;
  scale: number;
}

const SIZES = {
  island: { width: 124, height: 36, top: 11, radius: 18 },
  notch: { width: 160, height: 32, top: 0, radius: 18 },
  punch: { width: 12, height: 12, top: 12, radius: 6 },
} as const;

export function DeviceCutout({ cutout, scale }: DeviceCutoutProps) {
  if (cutout === 'none') return null;
  const size = SIZES[cutout];
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 bg-viratec-night"
      style={{
        top: size.top * scale,
        width: size.width * scale,
        height: size.height * scale,
        borderRadius:
          cutout === 'notch'
            ? `0 0 ${size.radius * scale}px ${size.radius * scale}px`
            : size.radius * scale,
      }}
    />
  );
}
