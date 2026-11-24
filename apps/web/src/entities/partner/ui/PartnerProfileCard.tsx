import { ArrowUpRight, Globe } from 'lucide-react';
import { pickLocalized, useLocale } from '@/shared/i18n';
import { usePartnerMessages } from '../model/messages';
import type { NetworkPartner, PartnerProfile } from '../model/types';
import { PartnerLogoPlate } from './PartnerLogoPlate';

interface PartnerProfileCardProps {
  partner: NetworkPartner;
  profile: PartnerProfile;
  onShowOnGlobe?: () => void;
}

export function PartnerProfileCard({ partner, profile, onShowOnGlobe }: PartnerProfileCardProps) {
  const t = usePartnerMessages();
  const locale = useLocale();

  return (
    <article className="atlas-card row-span-6 grid grid-rows-subgrid gap-y-3.5 rounded-[28px] border border-transparent p-6 lg:gap-y-4">
      <PartnerLogoPlate logo={profile.logo} alt="" className="h-[104px] rounded-2xl p-4" />
      <p className="text-sm leading-5 font-medium text-viratec-cyan">
        {partner.code} · {pickLocalized(profile.place, locale)}
      </p>
      <h3 className="font-display text-xl leading-[26px] font-medium tracking-[-0.02em] text-white">
        {partner.name}
      </h3>
      <p className="text-[15px] leading-[22px] text-viratec-muted">
        {pickLocalized(profile.summary, locale)}
      </p>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] content-start gap-x-2 gap-y-1 text-sm leading-5">
        <dt className="text-viratec-subtle">{t.founded}:</dt>
        <dd className="text-white">{pickLocalized(profile.founded, locale)}</dd>
        <dt className="text-viratec-subtle">{t.type}:</dt>
        <dd className="text-white">{pickLocalized(profile.kind, locale)}</dd>
      </dl>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 self-end pt-2">
        <a
          href={profile.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-6 items-center gap-1.5 rounded text-[15px] font-medium text-viratec-cyan underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
        >
          {t.website}
          <span className="sr-only"> ({t.opensInNewTab})</span>
          <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
        </a>
        {onShowOnGlobe && (
          <button
            type="button"
            onClick={onShowOnGlobe}
            className="inline-flex min-h-6 cursor-pointer items-center gap-1.5 rounded text-[15px] font-medium text-viratec-cyan underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
          >
            {t.showOnGlobe}
            <span className="sr-only">: {partner.name}</span>
            <Globe aria-hidden="true" className="size-4 shrink-0" />
          </button>
        )}
      </div>
    </article>
  );
}
