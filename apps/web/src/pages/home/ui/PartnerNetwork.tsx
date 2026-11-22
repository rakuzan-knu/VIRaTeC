import type { CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { usePartnerLogos } from '@/entities/partner';
import { useLocalized } from '@/shared/i18n';
import { useHomeContent } from '../model/content';
import { PARTNER_MARQUEE_MESSAGES } from '../model/messages';
import { usePartnerMarquee } from '../model/usePartnerMarquee';
import { PartnerLogoTrack } from './PartnerLogoTrack';
import { PartnerMarqueeButton } from './PartnerMarqueeButton';

const REVEAL_DELAY_MS = 1080;
const REVEAL_CLASS = 'motion-safe:animate-hero-reveal motion-reduce:animate-hero-fade';
const SECONDS_PER_LOGO = 5;
const CAPTION_ID = 'partner-network-caption';
const ARROW_CLASS = 'hidden sm:flex';
const ICON_CLASS = 'size-5';
const TRACK_CLASS =
  'flex w-max animate-partner-marquee group-hover/marquee:[animation-play-state:paused] group-has-[:focus-visible]/marquee:[animation-play-state:paused] group-data-[paused]/marquee:[animation-play-state:paused] motion-reduce:[animation-play-state:paused]';

function delay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

function marqueeDuration(logoCount: number): CSSProperties {
  return { animationDuration: `${logoCount * SECONDS_PER_LOGO}s` };
}

export function PartnerNetwork() {
  const { hero } = useHomeContent();
  const messages = useLocalized(PARTNER_MARQUEE_MESSAGES);
  const partners = usePartnerLogos();
  const marquee = usePartnerMarquee();

  return (
    <div className="flex flex-col items-center gap-5 lg:gap-6">
      <div
        className={`flex items-center gap-2.5 ${REVEAL_CLASS}`}
        style={delay(REVEAL_DELAY_MS - 80)}
      >
        <p
          id={CAPTION_ID}
          className="text-center text-sm leading-5 text-viratec-muted lg:text-base lg:text-viratec-light"
        >
          {hero.partnersCaption}
        </p>
        <PartnerMarqueeButton
          label={marquee.isPausedByUser ? messages.resume : messages.pause}
          onClick={marquee.togglePaused}
          className="size-7 motion-reduce:hidden"
        >
          {marquee.isPausedByUser ? (
            <Play aria-hidden="true" className="size-3.5" />
          ) : (
            <Pause aria-hidden="true" className="size-3.5" />
          )}
        </PartnerMarqueeButton>
      </div>

      <div
        ref={marquee.rootRef}
        role="group"
        aria-labelledby={CAPTION_ID}
        dir="ltr"
        data-paused={marquee.isPaused || undefined}
        className={`group/marquee flex w-full items-center gap-3 lg:gap-5 ${REVEAL_CLASS}`}
        style={delay(REVEAL_DELAY_MS)}
      >
        <PartnerMarqueeButton
          label={messages.previous}
          onClick={marquee.showPrevious}
          className={ARROW_CLASS}
        >
          <ChevronLeft aria-hidden="true" className={ICON_CLASS} />
        </PartnerMarqueeButton>

        <div
          ref={marquee.viewportRef}
          className="partner-marquee-fade min-w-0 flex-1 touch-pan-y overflow-clip py-1"
          {...marquee.viewportProps}
        >
          <div
            ref={marquee.trackRef}
            className={TRACK_CLASS}
            style={marqueeDuration(partners.length)}
          >
            <PartnerLogoTrack partners={partners} />
            <PartnerLogoTrack partners={partners} isClone />
          </div>
        </div>

        <PartnerMarqueeButton
          label={messages.next}
          onClick={marquee.showNext}
          className={ARROW_CLASS}
        >
          <ChevronRight aria-hidden="true" className={ICON_CLASS} />
        </PartnerMarqueeButton>
      </div>
    </div>
  );
}
