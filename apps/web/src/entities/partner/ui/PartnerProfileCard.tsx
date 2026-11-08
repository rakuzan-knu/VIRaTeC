import { ArrowUpRight } from 'lucide-react';
import { useLocale } from '@/shared/i18n';
import { usePartnerMessages } from '../model/messages';
import type { NetworkPartner, PartnerProfile } from '../model/types';
import { PartnerLogoPlate } from './PartnerLogoPlate';

interface PartnerProfileCardProps {
  partner: NetworkPartner;
  profile: PartnerProfile;
}

export function PartnerProfileCard({ partner, profile }: PartnerProfileCardProps) {
  const t = usePartnerMessages();
  const locale = useLocale();

  return (
    <article className="atlas-card flex h-full flex-col gap-3.5 rounded-[28px] border border-transparent p-6 lg:gap-4">
      <PartnerLogoPlate logo={profile.logo} alt="" className="h-[104px] rounded-2xl p-4" />
      <p className="text-sm leading-5 font-medium text-viratec-cyan">
        {partner.code} · {profile.place[locale]}
      </p>
      <h3 className="font-display text-xl leading-[26px] font-medium tracking-[-0.02em] text-white">
        {partner.name}
      </h3>
      <p className="text-[15px] leading-[22px] text-viratec-muted">{profile.summary[locale]}</p>
      <dl className="grid gap-1 text-sm leading-5">
        <div className="flex gap-1.5">
          <dt className="text-viratec-subtle">{t.founded}:</dt>
          <dd className="text-white">{profile.founded[locale]}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-viratec-subtle">{t.type}:</dt>
          <dd className="text-white">{profile.kind[locale]}</dd>
        </div>
      </dl>
      <a
        href={profile.website}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex min-h-6 items-center gap-1.5 self-start rounded pt-2 text-[15px] font-medium text-viratec-cyan underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
      >
        {t.website}
        <span className="sr-only"> ({t.opensInNewTab})</span>
        <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
      </a>
    </article>
  );
}
