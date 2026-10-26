import { useLocalized } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import { HOME_PARTNERS, NETWORK_PARTNERS } from './data.generated';

export const useHomePartners = () =>
  useLocalized(useLiveContent('partner', 'HOME_PARTNERS', HOME_PARTNERS));

export const useNetworkPartners = () =>
  useLocalized(useLiveContent('partner', 'NETWORK_PARTNERS', NETWORK_PARTNERS));
