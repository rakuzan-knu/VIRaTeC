import type { PartnerLogo } from '@/entities/partner';
import { cn } from '@/shared/lib';

const ITEM_CLASS =
  'flex h-full items-center justify-center gap-2 rounded opacity-90 transition-opacity duration-300 hover:opacity-100 lg:gap-3';

interface PartnerLogoTrackProps {
  partners: PartnerLogo[];
  isClone?: boolean;
}

export function PartnerLogoTrack({ partners, isClone = false }: PartnerLogoTrackProps) {
  return (
    <ul aria-hidden={isClone || undefined} className="flex shrink-0">
      {partners.map((partner) => {
        const content = (
          <>
            <img
              src={partner.logo}
              alt={partner.showName ? '' : partner.name}
              decoding="async"
              className={cn(
                partner.showName
                  ? 'h-full w-auto shrink-0'
                  : 'max-h-full max-w-full object-contain',
                !partner.isMark && 'brightness-0 invert',
              )}
            />
            {partner.showName && (
              <span
                dir="auto"
                className="text-start text-xs leading-[15px] font-semibold text-white lg:text-[15px] lg:leading-[18px]"
              >
                {partner.name}
              </span>
            )}
          </>
        );

        return (
          <li
            key={partner.name}
            className="h-14 w-[188px] shrink-0 px-2 lg:h-[72px] lg:w-[252px] lg:px-4"
          >
            {partner.website ? (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isClone ? -1 : undefined}
                className={cn(
                  ITEM_CLASS,
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
                )}
              >
                {content}
              </a>
            ) : (
              <div className={ITEM_CLASS}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
