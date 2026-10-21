import type { CSSProperties } from 'react';
import { useLocalized } from '@/shared/i18n';
import { HOME_CONTENT, PARTNERS } from '../model/content';

const REVEAL_DELAY_MS = 1080;
const REVEAL_STAGGER_MS = 70;
const REVEAL_CLASS = 'motion-safe:animate-hero-reveal motion-reduce:animate-hero-fade';

function delay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

export function PartnerNetwork() {
  const { hero } = useLocalized(HOME_CONTENT);

  return (
    <div className="flex flex-col items-center gap-8 lg:gap-10">
      <p
        className={`text-center text-sm leading-5 text-viratec-muted lg:text-base ${REVEAL_CLASS}`}
        style={delay(REVEAL_DELAY_MS - 80)}
      >
        {hero.partnersCaption}
      </p>

      <ul className="grid w-full grid-cols-2 items-center gap-x-6 gap-y-9 sm:grid-cols-3 lg:flex lg:justify-between lg:gap-8">
        {PARTNERS.map((partner, index) => (
          <li
            key={partner.name}
            className={`flex h-[60px] items-center justify-center gap-2 opacity-80 transition-opacity duration-300 hover:opacity-100 lg:gap-3 ${REVEAL_CLASS}`}
            style={delay(REVEAL_DELAY_MS + index * REVEAL_STAGGER_MS)}
          >
            <img
              src={partner.logo}
              alt={partner.caption ? '' : partner.name}
              loading="lazy"
              className={`object-contain brightness-0 invert ${partner.logoClassName}`}
            />
            {partner.caption && (
              <span className="text-xs leading-[15px] font-semibold whitespace-nowrap text-white lg:text-[15px] lg:leading-[18px]">
                {partner.caption[0]}
                <br />
                {partner.caption[1]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
