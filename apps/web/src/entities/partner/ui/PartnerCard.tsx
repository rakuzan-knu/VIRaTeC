import { InfoCard } from '@/shared/ui/info-card';
import { findPartnerProfile } from '../model/data';
import type { NetworkPartner } from '../model/types';
import { PartnerProfileCard } from './PartnerProfileCard';

interface PartnerCardProps {
  partner: NetworkPartner;
  onShowOnGlobe?: () => void;
}

export function PartnerCard({ partner, onShowOnGlobe }: PartnerCardProps) {
  const profile = findPartnerProfile(partner.name);

  if (profile)
    return <PartnerProfileCard partner={partner} profile={profile} onShowOnGlobe={onShowOnGlobe} />;

  return (
    <InfoCard
      index={partner.code}
      title={partner.name}
      description={partner.location}
      logo={partner.logo}
      className="row-span-6 lg:min-h-[184px]"
    />
  );
}
