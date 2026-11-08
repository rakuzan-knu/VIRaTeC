import type { Localized } from '@/shared/i18n';

export interface HomePartner {
  name: string;
  logo: string;
  logoHeight: number;
  logoHeightLg: number;
  caption?: [string, string];
}

export interface NetworkPartner {
  code: string;
  name: string;
  location: string;
  logo?: string;
}

export interface PartnerProfile {
  aliases: string[];
  logo: string;
  website: string;
  founded: Localized<string>;
  place: Localized<string>;
  kind: Localized<string>;
  summary: Localized<string>;
}
