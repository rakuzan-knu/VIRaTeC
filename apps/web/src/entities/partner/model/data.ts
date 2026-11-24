import { useLocalized } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import { HOME_PARTNERS, NETWORK_PARTNERS } from './data.generated';
import { PARTNER_PROFILES } from './profiles';
import { toPartnerSlug } from './slug';
import type { PartnerLogo, PartnerProfile } from './types';

const INVISIBLE_MARKERS = /[​-‍⁠-⁤﻿]/g;

export const findPartnerProfile = (name: string): PartnerProfile | undefined => {
  const cleanName = name.replace(INVISIBLE_MARKERS, '');
  return PARTNER_PROFILES.find((profile) => profile.aliases.includes(cleanName));
};

export const useHomePartners = () =>
  useLocalized(useLiveContent('partner', 'HOME_PARTNERS', HOME_PARTNERS));

export const useNetworkPartners = () =>
  useLocalized(useLiveContent('partner', 'NETWORK_PARTNERS', NETWORK_PARTNERS));

export const getPartnerSlug = (name: string): string | undefined => {
  const canonicalName = findPartnerProfile(name)?.aliases[0];
  return canonicalName === undefined ? undefined : toPartnerSlug(canonicalName);
};

export const usePartnerNames = () => {
  const partners = useNetworkPartners();
  return (name: string): string => {
    const profile = findPartnerProfile(name);
    const match = partners.find(
      (partner) => profile !== undefined && findPartnerProfile(partner.name) === profile,
    );
    return match?.name ?? name;
  };
};

export const usePartnerLogos = (): PartnerLogo[] => {
  const networkPartners = useNetworkPartners();
  const homePartners = useHomePartners();
  const logos = new Map<string, PartnerLogo>();

  for (const partner of [...networkPartners, ...homePartners]) {
    const profile = findPartnerProfile(partner.name);
    const logo = profile?.mark ?? partner.logo;
    const key = profile?.website ?? partner.name;
    if (!logo || logos.has(key)) continue;
    logos.set(key, {
      name: partner.name,
      logo,
      isMark: profile !== undefined,
      showName: profile?.showNameBesideMark ?? false,
      website: profile?.website,
    });
  }

  return [...logos.values()];
};
