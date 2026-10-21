import { useId } from 'react';
import { BRAND_COLORS } from '@/shared/config/brand';

const CENTER = { x: 450, y: 680 } as const;
const TILT = -22;
const TILT_TRANSFORM = `rotate(${TILT} ${CENTER.x} ${CENTER.y})`;

const ORBITS = [
  { rx: 430, ry: 138, opacity: 0.1, dash: '2 10' },
  { rx: 290, ry: 94, opacity: 0.14, dash: undefined },
  { rx: 135, ry: 44, opacity: 0.22, dash: undefined },
] as const;

const NODES = [
  { orbit: 0, angle: 196, r: 5, color: BRAND_COLORS.cyan },
  { orbit: 0, angle: 292, r: 4, color: '#ffffff' },
  { orbit: 1, angle: 238, r: 6, color: BRAND_COLORS.cyan },
  { orbit: 1, angle: 28, r: 5, color: BRAND_COLORS.lime },
  { orbit: 2, angle: 0, r: 10, color: BRAND_COLORS.lime },
] as const;

const LINKS = [
  [0, 2],
  [2, 1],
  [1, 3],
  [3, 4],
] as const;

const nodePoint = ({ orbit, angle }: (typeof NODES)[number]) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER.x + ORBITS[orbit].rx * Math.cos(radians),
    y: CENTER.y + ORBITS[orbit].ry * Math.sin(radians),
  };
};

const POINTS = NODES.map(nodePoint);

export function AuthBannerArt() {
  const id = useId();
  const ids = {
    dots: `${id}-dots`,
    fade: `${id}-fade`,
    mask: `${id}-mask`,
    cyanGlow: `${id}-cyan`,
    limeGlow: `${id}-lime`,
    v: `${id}-v`,
    front: `${id}-front`,
  };
  const inner = ORBITS[2];

  return (
    <svg
      viewBox="0 0 600 800"
      preserveAspectRatio="xMaxYMax slice"
      className="pointer-events-none absolute inset-0 size-full"
      aria-hidden="true"
    >
      <defs>
        <pattern id={ids.dots} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="1" fill="#ffffff" fillOpacity="0.14" />
        </pattern>
        <linearGradient id={ids.fade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.25" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>
        <mask id={ids.mask}>
          <rect width="600" height="800" fill={`url(#${ids.fade})`} />
        </mask>
        <radialGradient id={ids.cyanGlow}>
          <stop offset="0" stopColor={BRAND_COLORS.cyan} stopOpacity="0.42" />
          <stop offset="1" stopColor={BRAND_COLORS.cyan} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={ids.limeGlow}>
          <stop offset="0" stopColor={BRAND_COLORS.lime} stopOpacity="0.3" />
          <stop offset="1" stopColor={BRAND_COLORS.lime} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.v} x1="380" y1="0" x2="520" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={BRAND_COLORS.cyan} />
          <stop offset="1" stopColor={BRAND_COLORS.lime} />
        </linearGradient>
        <clipPath id={ids.front}>
          <rect x="0" y={CENTER.y} width="1000" height={inner.ry + 8} />
        </clipPath>
      </defs>

      <rect width="600" height="800" fill={`url(#${ids.dots})`} mask={`url(#${ids.mask})`} />
      <g className="motion-safe:animate-hero-drift">
        <circle cx="90" cy="760" r="380" fill={`url(#${ids.cyanGlow})`} />
        <circle cx="560" cy="520" r="300" fill={`url(#${ids.limeGlow})`} />
      </g>

      <g transform={TILT_TRANSFORM} fill="none" stroke="#ffffff">
        {ORBITS.map(({ rx, ry, opacity, dash }) => (
          <ellipse
            key={rx}
            cx={CENTER.x}
            cy={CENTER.y}
            rx={rx}
            ry={ry}
            strokeOpacity={opacity}
            strokeWidth="1.5"
            strokeDasharray={dash}
          />
        ))}
        {LINKS.map(([from, to]) => (
          <line
            key={`${from}-${to}`}
            x1={POINTS[from].x}
            y1={POINTS[from].y}
            x2={POINTS[to].x}
            y2={POINTS[to].y}
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        ))}
      </g>

      <path
        d="M392 540 450 690 508 540"
        fill="none"
        stroke={`url(#${ids.v})`}
        strokeWidth="38"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g transform={TILT_TRANSFORM}>
        <ellipse
          cx={CENTER.x}
          cy={CENTER.y}
          rx={inner.rx}
          ry={inner.ry}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.85"
          strokeWidth="4"
          clipPath={`url(#${ids.front})`}
        />
        {NODES.map((nodeItem, index) => (
          <g key={`${nodeItem.orbit}-${nodeItem.angle}`}>
            <circle
              cx={POINTS[index].x}
              cy={POINTS[index].y}
              r={nodeItem.r * 3}
              fill={nodeItem.color}
              fillOpacity="0.12"
            />
            <circle
              cx={POINTS[index].x}
              cy={POINTS[index].y}
              r={nodeItem.r}
              fill={nodeItem.color}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
