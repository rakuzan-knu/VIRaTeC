import { useId } from 'react';
import { LINKS, PARTNERS } from '../lib/partners';
import { INITIAL_FRAME, RADIUS, fadeByDepth, toTranslate } from '../lib/projection';
import { useGlobeAnimation } from '../model/useGlobeAnimation';

export function IntroGlobe() {
  const id = useId();
  const sphereId = `${id}-sphere`;
  const haloId = `${id}-halo`;
  const rimId = `${id}-rim`;
  const { rootRef, gridRef, arcsRef, cometsRef, linksRef, partnersRef, hubRef } =
    useGlobeAnimation();

  return (
    <div ref={rootRef} aria-hidden="true" className="intro-globe">
      <svg viewBox="-135 -135 270 270" className="block size-full overflow-visible">
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
          <linearGradient id={rimId} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" className="intro-globe-glow" stopOpacity="0.9" />
            <stop offset="45%" className="intro-globe-glow" stopOpacity="0.25" />
            <stop offset="100%" className="intro-globe-glow" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle r="135" fill={`url(#${haloId})`} />
        <circle r={RADIUS} fill={`url(#${sphereId})`} />

        <g ref={gridRef} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.35">
          {INITIAL_FRAME.grid.map((path, index) => (
            <path key={index} d={path} />
          ))}
        </g>

        <circle r={RADIUS} fill="none" stroke={`url(#${rimId})`} strokeWidth="0.7" />

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
              style={{ opacity: INITIAL_FRAME.linkOpacity[index] }}
            />
          ))}
        </g>

        <g ref={partnersRef} fill="var(--color-viratec-cyan)">
          {INITIAL_FRAME.partners.map((point, index) => (
            <circle
              key={PARTNERS[index]?.name ?? index}
              r="1.15"
              transform={toTranslate(point)}
              style={{ opacity: fadeByDepth(point.depth) }}
            />
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
      </svg>
    </div>
  );
}
