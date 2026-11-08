import type { CSSProperties } from 'react';
import {
  PartnerLogoPlate,
  findPartnerProfile,
  useHomePartners,
  type HomePartner,
} from '@/entities/partner';
import { useHomeContent } from '../model/content';

const REVEAL_DELAY_MS = 1080;
const REVEAL_STAGGER_MS = 70;
const REVEAL_CLASS = 'motion-safe:animate-hero-reveal motion-reduce:animate-hero-fade';

function delay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

function logoSize(partner: HomePartner): CSSProperties {
  return {
    '--logo-h': `${partner.logoHeight}px`,
    '--logo-h-lg': `${partner.logoHeightLg}px`,
  } as CSSProperties;
}

export function PartnerNetwork() {
  const { hero } = useHomeContent();
  const partners = useHomePartners();

  return (
    <div className="flex flex-col items-center gap-8 lg:gap-10">
      <p
        className={`text-center text-sm leading-5 text-viratec-muted lg:text-base ${REVEAL_CLASS}`}
        style={delay(REVEAL_DELAY_MS - 80)}
      >
        {hero.partnersCaption}
      </p>

      <ul className="grid w-full grid-cols-2 items-center gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        {partners.map((partner, index) => {
          const profile = findPartnerProfile(partner.name);

          return (
            <li
              key={partner.name}
              className={`flex h-[64px] items-center justify-center gap-2 lg:gap-3 ${REVEAL_CLASS}`}
              style={delay(REVEAL_DELAY_MS + index * REVEAL_STAGGER_MS)}
            >
              {profile ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block size-full rounded-[14px] transition-opacity duration-300 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime motion-reduce:transition-none"
                >
                  <PartnerLogoPlate
                    logo={profile.logo}
                    alt={partner.name}
                    className="size-full rounded-[14px] px-3 py-1.5"
                  />
                </a>
              ) : (
                <>
                  <img
                    src={partner.logo}
                    alt={partner.caption ? '' : partner.name}
                    loading="lazy"
                    style={logoSize(partner)}
                    className="h-(--logo-h) w-auto object-contain brightness-0 invert lg:h-(--logo-h-lg)"
                  />
                  {partner.caption && (
                    <span className="text-xs leading-[15px] font-semibold whitespace-nowrap text-white lg:text-[15px] lg:leading-[18px]">
                      {partner.caption[0]} <br />
                      {partner.caption[1]}
                    </span>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
