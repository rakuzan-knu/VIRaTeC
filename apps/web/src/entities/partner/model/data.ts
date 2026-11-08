import { useLocalized } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import { HOME_PARTNERS, NETWORK_PARTNERS } from './data.generated';
import { PARTNER_PROFILES } from './profiles';
import type { PartnerProfile } from './types';

const INVISIBLE_MARKERS = /[​-‍⁠-⁤﻿]/g;

export const findPartnerProfile = (name: string): PartnerProfile | undefined => {
  const cleanName = name.replace(INVISIBLE_MARKERS, '');
  return PARTNER_PROFILES.find((profile) => profile.aliases.includes(cleanName));
};

export const useHomePartners = () =>
  useLocalized(useLiveContent('partner', 'HOME_PARTNERS', HOME_PARTNERS));

export const useNetworkPartners = () =>
  useLocalized(useLiveContent('partner', 'NETWORK_PARTNERS', NETWORK_PARTNERS));
