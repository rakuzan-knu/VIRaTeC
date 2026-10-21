import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLocalized } from '@/shared/i18n';
import { HOME_CONTENT, PARTNERS } from '../model/content';

const ARC_HEIGHT = 112;
const DRAW_DELAY_MS = 1000;
const DRAW_STAGGER_MS = 90;
const REVEAL_DELAY_MS = 1080;
const REVEAL_STAGGER_MS = 70;
const REVEAL_CLASS = 'motion-safe:animate-hero-reveal motion-reduce:animate-hero-fade';

function delay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

function buildArc(startX: number, endX: number, maxDistance: number) {
  const peak = 24 + (ARC_HEIGHT - 32) * ((endX - startX) / maxDistance);
  const controlY = ARC_HEIGHT - peak * 2;
  return `M${startX} ${ARC_HEIGHT} Q${(startX + endX) / 2} ${controlY} ${endX} ${ARC_HEIGHT}`;
}

interface NodeLayout {
  width: number;
  centers: number[];
}

function useNodeLayout<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [layout, setLayout] = useState<NodeLayout>({ width: 0, centers: [] });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const items = Array.from(element.children) as HTMLElement[];
      setLayout({
        width: element.clientWidth,
        centers: items.map((item) => Math.round(item.offsetLeft + item.offsetWidth / 2)),
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    Array.from(element.children).forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return [ref, layout] as const;
}

export function PartnerNetwork() {
  const [listRef, { width, centers }] = useNodeLayout<HTMLUListElement>();
  const [originX = 0, ...partnerXs] = centers;
  const maxDistance = (partnerXs.at(-1) ?? 0) - originX;
  const hasLayout = width > 0 && originX > 0 && maxDistance > 0;
  const { hero } = useLocalized(HOME_CONTENT);

  return (
    <div className="flex flex-col items-center gap-8 lg:items-stretch lg:gap-0">
      <p
        className={`text-sm leading-5 text-viratec-muted lg:mb-2 ${REVEAL_CLASS}`}
        style={delay(REVEAL_DELAY_MS - 80)}
      >
        {hero.partnersCaption}
      </p>

      <div className="relative w-full lg:pt-[112px]">
        {hasLayout && (
          <svg
            aria-hidden="true"
            width={width}
            height={ARC_HEIGHT}
            viewBox={`0 0 ${width} ${ARC_HEIGHT}`}
            className="absolute top-0 left-0 hidden overflow-visible lg:block"
          >
            <defs>
              <linearGradient
                id="partner-arc"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2={width}
                y2="0"
              >
                <stop offset="0" stopColor="var(--color-viratec-lime)" />
                <stop offset="1" stopColor="#e9fdff" />
              </linearGradient>
            </defs>
            {partnerXs.map((endX, index) => {
              const path = buildArc(originX, endX, maxDistance);
              const style = delay(DRAW_DELAY_MS + index * DRAW_STAGGER_MS);

              return (
                <g key={PARTNERS[index]?.name ?? endX} fill="none" strokeLinecap="round">
                  <path
                    d={path}
                    pathLength={1}
                    stroke="var(--color-viratec-bg)"
                    strokeOpacity={0.55}
                    strokeWidth={5}
                    strokeDasharray="1"
                    className="motion-safe:animate-hero-draw"
                    style={style}
                  />
                  <path
                    d={path}
                    pathLength={1}
                    stroke="url(#partner-arc)"
                    strokeWidth={1.75}
                    strokeDasharray="1"
                    className="motion-safe:animate-hero-draw"
                    style={style}
                  />
                </g>
              );
            })}
          </svg>
        )}

        <ul
          ref={listRef}
          className="relative grid w-full grid-cols-2 gap-x-3 gap-y-9 lg:flex lg:items-start lg:justify-between"
        >
          <li
            className={`relative hidden flex-col items-center gap-2 pt-5 lg:flex ${REVEAL_CLASS}`}
            style={delay(REVEAL_DELAY_MS - 40)}
          >
            <span
              aria-hidden="true"
              className="absolute -top-[5px] size-2.5 rounded-full bg-viratec-lime ring-4 ring-viratec-lime/20"
            />
            <span className="text-[15px] leading-5 font-medium text-white">{hero.knu}</span>
            <span className="text-[13px] leading-[18px] text-viratec-subtle">{hero.kyiv}</span>
          </li>
          {PARTNERS.map((partner, index) => (
            <li
              key={partner.name}
              className={`relative flex h-[60px] items-center justify-center gap-2 lg:h-auto lg:gap-3 lg:pt-5 ${REVEAL_CLASS}`}
              style={delay(REVEAL_DELAY_MS + index * REVEAL_STAGGER_MS)}
            >
              <span
                aria-hidden="true"
                className="absolute -top-1 hidden size-2 rounded-full bg-white ring-2 ring-viratec-bg/60 lg:block"
              />
              <img
                src={partner.logo}
                alt={partner.caption ? '' : partner.name}
                loading="lazy"
                className={`object-contain ${partner.logoClassName}`}
              />
              {partner.caption && (
                <span className="text-xs leading-[15px] font-medium whitespace-nowrap text-white/88 lg:text-[15px] lg:leading-[18px]">
                  {partner.caption[0]}
                  <br />
                  {partner.caption[1]}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
