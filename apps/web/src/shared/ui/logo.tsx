import { useId } from 'react';
import { cn } from '@/shared/lib';
import { BRAND_COLORS, BRAND_MARK, BRAND_WORDMARK } from '@/shared/config/brand';

type LogoTone = 'light' | 'dark';

const TONES = {
  light: { ink: '#ffffff', accent: BRAND_COLORS.lime, gradientEnd: BRAND_COLORS.lime },
  dark: {
    ink: BRAND_COLORS.inkOnLight,
    accent: BRAND_COLORS.limeOnLight,
    gradientEnd: BRAND_COLORS.limeOnLight,
  },
} as const;

const { orbit, node, gradient } = BRAND_MARK;
const ORBIT_TRANSFORM = `rotate(${orbit.rotate} ${orbit.cx} ${orbit.cy})`;

function MarkShapes({ tone }: { tone: LogoTone }) {
  const id = useId();
  const colors = TONES[tone];
  const gradientId = `${id}-v`;
  const clipId = `${id}-front`;

  return (
    <>
      <defs>
        <linearGradient
          id={gradientId}
          x1={gradient.x1}
          y1="0"
          x2={gradient.x2}
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={BRAND_COLORS.cyan} />
          <stop offset="1" stopColor={colors.gradientEnd} />
        </linearGradient>
        <clipPath id={clipId}>
          <rect
            x="0"
            y={orbit.cy}
            width={BRAND_MARK.size}
            height={orbit.ry + orbit.frontStroke * 2}
          />
        </clipPath>
      </defs>
      <ellipse
        cx={orbit.cx}
        cy={orbit.cy}
        rx={orbit.rx}
        ry={orbit.ry}
        transform={ORBIT_TRANSFORM}
        fill="none"
        stroke={colors.ink}
        strokeOpacity={orbit.backOpacity}
        strokeWidth={orbit.backStroke}
      />
      <path
        d={BRAND_MARK.vPath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={BRAND_MARK.vStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform={ORBIT_TRANSFORM}>
        <ellipse
          cx={orbit.cx}
          cy={orbit.cy}
          rx={orbit.rx}
          ry={orbit.ry}
          fill="none"
          stroke={colors.ink}
          strokeWidth={orbit.frontStroke}
          clipPath={`url(#${clipId})`}
        />
        <circle cx={node.cx} cy={node.cy} r={node.r} fill={colors.accent} />
      </g>
    </>
  );
}

interface LogoProps {
  className?: string;
  tone?: LogoTone;
}

export function LogoMark({ className, tone = 'light' }: LogoProps) {
  return (
    <svg
      viewBox={`0 0 ${BRAND_MARK.size} ${BRAND_MARK.size}`}
      className={cn('block aspect-square', className)}
      aria-hidden="true"
    >
      <MarkShapes tone={tone} />
    </svg>
  );
}

export function Logo({ className, tone = 'light' }: LogoProps) {
  const colors = TONES[tone];
  const [before, accent, after] = BRAND_WORDMARK.parts;

  return (
    <svg
      viewBox={`0 0 ${BRAND_WORDMARK.width} ${BRAND_WORDMARK.height}`}
      className={cn('block aspect-[190/48]', className)}
      aria-hidden="true"
    >
      <MarkShapes tone={tone} />
      <text
        x={BRAND_WORDMARK.textX}
        y={BRAND_WORDMARK.baseline}
        textLength={BRAND_WORDMARK.textLength}
        lengthAdjust="spacingAndGlyphs"
        fontFamily={BRAND_WORDMARK.fontFamily}
        fontWeight={BRAND_WORDMARK.fontWeight}
        fontSize={BRAND_WORDMARK.fontSize}
        fill={colors.ink}
      >
        {before}
        <tspan fill={colors.accent}>{accent}</tspan>
        {after}
      </text>
    </svg>
  );
}
