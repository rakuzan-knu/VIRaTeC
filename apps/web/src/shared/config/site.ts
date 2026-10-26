import type { Localized } from '@/shared/i18n/model/types';

export type SocialLinkKey =
  'linkedinGroup' | 'linkedinChair' | 'orcid' | 'facebookGroup' | 'scopus' | 'googleScholar';

export interface SiteFooterText {
  tagline: string;
  copyright: string;
}

export interface SiteSettings {
  contactEmail: string;
  socialLinks: Record<SocialLinkKey, string | null>;
  footer: Localized<SiteFooterText>;
}

export { SITE_SETTINGS } from './site.generated';
