import { lazy, Suspense, useId, useRef, useState } from 'react';
import { toPartnerSlug } from '@/entities/partner';
import { cn } from '@/shared/lib';
import { ARC_TARGETS, LINKS, PARTNERS, findPartnerIndex, gatewayOf } from '../lib/partners';
import { INITIAL_FRAME, RADIUS, fadeByDepth, toTranslate } from '../lib/projection';
import { useGlobeMessages } from '../model/messages';
import { useGlobeAnimation } from '../model/useGlobeAnimation';
import { useGlobeTour } from '../model/useGlobeTour';
import { GlobeControls } from './GlobeControls';

const GlobePartnerCard = lazy(() =>
  import('./GlobePartnerCard').then((module) => ({ default: module.GlobePartnerCard })),
);
const GlobePartnerLabel = lazy(() =>
  import('./GlobePartnerLabel').then((module) => ({ default: module.GlobePartnerLabel })),
);

const GlobeSearch = lazy(() =>
  import('./GlobeSearch').then((module) => ({ default: module.GlobeSearch })),
);

export const GLOBE_ID = 'partner-globe';

export type GlobeMode = 'backdrop' | 'interactive' | 'featured';

interface IntroGlobeProps {
  mode: GlobeMode;
  partner?: string | null;
  onPartnerChange?: (slug: string | null) => void;
  onShowDetails?: (slug: string) => void;
}

export function IntroGlobe({ mode, partner, onPartnerChange, onShowDetails }: IntroGlobeProps) {
  const id = useId();
  const sphereId = `${id}-sphere`;
  const haloId = `${id}-halo`;
  const rimId = `${id}-rim`;
  const clipId = `${id}-clip`;
  const isFeatured = mode === 'featured';
  const t = useGlobeMessages();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [localPartner, setLocalPartner] = useState<string | null>(null);
  const [hoveredIndices, setHoveredIndices] = useState<number[] | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const selectedIndex = findPartnerIndex(onPartnerChange ? (partner ?? null) : localPartner);

  const select = (index: number | null) => {
    const name = index === null ? undefined : PARTNERS[index]?.name;
    (onPartnerChange ?? setLocalPartner)(name === undefined ? null : toPartnerSlug(name));
    setIsSearching(false);
  };
  const step = (offset: 1 | -1) =>
    select(
      selectedIndex === null ? 0 : (selectedIndex + offset + PARTNERS.length) % PARTNERS.length,
    );
  const { isTouring, setIsTouring } = useGlobeTour(() => step(1));

  const interact = (action: () => void) => () => {
    setIsTouring(false);
    action();
  };
  const close = interact(() => {
    select(null);
    surfaceRef.current?.focus({ preventScroll: true });
  });

  const { refs, surfaceProps, zoomBy, flyTo } = useGlobeAnimation({
    selectedIndex,
    isPlaying: isPlaying && !isSearching,
    onSelect: select,
    onHover: setHoveredIndices,
    onInteract: () => setIsTouring(false),
  });
  const {
    rootRef,
    canvasRef,
    clipRef,
    gridRef,
    arcsRef,
    cometsRef,
    linksRef,
    partnersRef,
    hubRef,
    labelRef,
  } = refs;
  const selected = selectedIndex === null ? undefined : PARTNERS[selectedIndex];
  const gateway = selected && gatewayOf(selected);
  const hoveredIndex = hoveredIndices?.[0] ?? null;
  const isLabelVisible = hoveredIndex !== null && hoveredIndex !== selectedIndex;

  return (
    <div
      id={isFeatured ? GLOBE_ID : undefined}
      data-featured={isFeatured || undefined}
      className="intro-globe-frame"
    >
      <div ref={rootRef} aria-hidden="true" className="intro-globe">
        <svg viewBox="-135 -135 270 270" className="absolute inset-0 size-full overflow-visible">
          <defs>
            <radialGradient id={sphereId} cx="36%" cy="28%" r="80%">
              <stop offset="0%" stopColor="var(--color-viratec-globe-core)" stopOpacity="0.85" />
              <stop offset="55%" stopColor="var(--color-viratec-globe-mid)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--color-viratec-bg)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={haloId} r="50%">
              <stop offset="70%" className="intro-globe-glow" stopOpacity="0" />
              <stop offset="74.5%" className="intro-globe-glow" stopOpacity="0.32" />
              <stop offset="82%" className="intro-globe-glow" stopOpacity="0.08" />
              <stop offset="100%" className="intro-globe-glow" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle r="135" fill={`url(#${haloId})`} />
          <circle r={RADIUS} fill={`url(#${sphereId})`} />
        </svg>
        <canvas ref={canvasRef} className="intro-globe-land absolute inset-0 size-full" />
        <svg viewBox="-135 -135 270 270" className="absolute inset-0 size-full overflow-visible">
          <defs>
            <linearGradient id={rimId} x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" className="intro-globe-glow" stopOpacity="0.9" />
              <stop offset="45%" className="intro-globe-glow" stopOpacity="0.25" />
              <stop offset="100%" className="intro-globe-glow" stopOpacity="0" />
            </linearGradient>
            <clipPath id={clipId}>
              <circle ref={clipRef} r="135" />
            </clipPath>
          </defs>
          <circle r={RADIUS} fill="none" stroke={`url(#${rimId})`} strokeWidth="0.7" />

          <g clipPath={`url(#${clipId})`}>
            <g ref={gridRef} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.35">
              {INITIAL_FRAME.grid.map((path, index) => (
                <path key={index} d={path} />
              ))}
            </g>

            <g
              ref={arcsRef}
              fill="none"
              stroke="var(--color-viratec-lime)"
              strokeWidth="0.6"
              strokeLinecap="round"
            >
              {INITIAL_FRAME.arcs.map((path, index) => (
                <path
                  key={index}
                  d={path}
                  pathLength={1}
                  data-active={ARC_TARGETS[index] === gateway}
                  className="intro-globe-arc"
                  style={{
                    animationDelay: `${700 + index * 140}ms`,
                    opacity: INITIAL_FRAME.arcOpacity[index],
                  }}
                />
              ))}
            </g>

            <g
              ref={cometsRef}
              fill="none"
              stroke="var(--color-viratec-comet)"
              strokeWidth="1.3"
              strokeLinecap="round"
              className="intro-globe-comets"
            >
              {INITIAL_FRAME.arcs.map((path, index) => (
                <path
                  key={index}
                  d={path}
                  pathLength={1}
                  className="intro-globe-comet"
                  style={{
                    animationDelay: `${2200 + index * 700}ms`,
                    opacity: INITIAL_FRAME.arcOpacity[index],
                  }}
                />
              ))}
            </g>

            <g
              ref={linksRef}
              fill="none"
              stroke="var(--color-viratec-cyan)"
              strokeOpacity="0.55"
              strokeWidth="0.35"
              strokeLinecap="round"
            >
              {INITIAL_FRAME.links.map((path, index) => (
                <path
                  key={LINKS[index]?.to.name ?? index}
                  d={path}
                  data-active={LINKS[index]?.to === selected}
                  className="intro-globe-link"
                  style={{ opacity: INITIAL_FRAME.linkOpacity[index] }}
                />
              ))}
            </g>

            <g ref={partnersRef} fill="var(--color-viratec-cyan)">
              {INITIAL_FRAME.partners.map((point, index) => (
                <g
                  key={PARTNERS[index]?.name ?? index}
                  transform={toTranslate(point)}
                  data-active={index === selectedIndex || index === hoveredIndex}
                  className="intro-globe-point"
                  style={{ opacity: fadeByDepth(point.depth) }}
                >
                  <circle r="3.4" className="intro-globe-ring" />
                  <circle r="1.25" className="intro-globe-dot" />
                  <g className="intro-globe-badge">
                    <circle r="10" />
                    <text textAnchor="middle" dominantBaseline="central" />
                  </g>
                </g>
              ))}
            </g>

            <g ref={hubRef} transform={toTranslate(INITIAL_FRAME.hub)}>
              <circle
                r="4.5"
                fill="none"
                stroke="var(--color-viratec-lime)"
                strokeWidth="0.6"
                className="intro-globe-pulse"
              />
              <circle r="1.9" fill="var(--color-viratec-lime)" />
            </g>
          </g>
        </svg>
      </div>

      {mode !== 'backdrop' && (
        <>
          <div className="intro-globe-clip">
            <div className="intro-globe-stage">
              <div
                {...surfaceProps}
                ref={surfaceRef}
                role="group"
                tabIndex={0}
                aria-label={t.globe}
                aria-description={t.hint}
                className={cn(
                  'intro-globe-surface',
                  hoveredIndex === null ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
                )}
              />
            </div>
          </div>

          <div className="intro-globe-stage intro-globe-overlay">
            <div ref={labelRef} aria-hidden="true" className="intro-globe-label">
              {isLabelVisible && hoveredIndices && (
                <Suspense fallback={null}>
                  <GlobePartnerLabel indices={hoveredIndices} />
                </Suspense>
              )}
            </div>
            {isSearching && (
              <Suspense fallback={null}>
                <GlobeSearch
                  onSelect={select}
                  onFocusGroup={flyTo}
                  onClose={() => {
                    setIsSearching(false);
                    surfaceRef.current?.focus({ preventScroll: true });
                  }}
                />
              </Suspense>
            )}
            {!isSearching && selected && selectedIndex !== null && (
              <Suspense fallback={null}>
                <GlobePartnerCard
                  partner={selected}
                  position={selectedIndex + 1}
                  total={PARTNERS.length}
                  onStep={(offset) => interact(() => step(offset))()}
                  onShowDetails={
                    onShowDetails && interact(() => onShowDetails(toPartnerSlug(selected.name)))
                  }
                  onClose={close}
                />
              </Suspense>
            )}
          </div>

          <GlobeControls
            isFeatured={isFeatured}
            isPlaying={isPlaying}
            isTouring={isTouring}
            onExplore={interact(() => select(selectedIndex ?? 0))}
            onSearch={interact(() => setIsSearching(true))}
            onToggleTour={() => {
              if (!isTouring) step(1);
              setIsTouring(!isTouring);
            }}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onZoom={(direction) => interact(() => zoomBy(direction))()}
          />
        </>
      )}
    </div>
  );
}
