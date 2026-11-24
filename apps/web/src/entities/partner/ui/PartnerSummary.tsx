import { ArrowUpRight } from 'lucide-react';
import { pickLocalized, useLocale } from '@/shared/i18n';
import { findPartnerProfile } from '../model/data';
import { usePartnerMessages } from '../model/messages';
import { PartnerLogoPlate } from './PartnerLogoPlate';

interface PartnerSummaryProps {
  name: string;
  coordinates: string;
}

export function PartnerSummary({ name, coordinates }: PartnerSummaryProps) {
  const t = usePartnerMessages();
  const locale = useLocale();
  const profile = findPartnerProfile(name);

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <PartnerLogoPlate
          logo={profile.logo}
          alt=""
          className="h-14 w-24 shrink-0 rounded-xl p-2"
        />
        <p className="flex min-w-0 flex-col text-sm leading-5 text-viratec-cyan">
          {pickLocalized(profile.place, locale)}
          <span dir="ltr" className="text-[13px] text-viratec-subtle tabular-nums">
            {coordinates}
          </span>
        </p>
      </div>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1 text-sm leading-5">
        <dt className="text-viratec-subtle">{t.founded}:</dt>
        <dd className="text-white">{pickLocalized(profile.founded, locale)}</dd>
        <dt className="text-viratec-subtle">{t.type}:</dt>
        <dd className="text-white">{pickLocalized(profile.kind, locale)}</dd>
      </dl>
      <a
        href={profile.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-6 items-center gap-1.5 self-start rounded text-[15px] font-medium text-viratec-cyan underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
      >
        {t.website}
        <span className="sr-only"> ({t.opensInNewTab})</span>
        <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
      </a>
    </div>
  );
}
