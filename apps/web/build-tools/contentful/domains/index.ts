import type { ContentDomain } from '../domain.ts';
import { audienceGroupsDomain } from './audience-groups.ts';
import { blocksDomain } from './blocks.ts';
import { galleryDomain } from './gallery.ts';
import { legalDomain } from './legal.ts';
import { milestonesDomain } from './milestones.ts';
import { pageSeoDomain } from './page-seo.ts';
import { partnersDomain } from './partners.ts';
import { siteSettingsDomain } from './site-settings.ts';
import { teamDomain } from './team.ts';
import { pageDomain } from '../pages/engine.ts';
import { PAGE_SPECS } from '../pages/specs.ts';

export const DOMAINS: readonly ContentDomain[] = [
  blocksDomain,
  siteSettingsDomain,
  partnersDomain,
  teamDomain,
  milestonesDomain,
  galleryDomain,
  audienceGroupsDomain,
  pageSeoDomain,
  legalDomain,
  ...PAGE_SPECS.map((spec) => pageDomain(spec)),
];

export const CONTENT_TYPES = DOMAINS.flatMap((domain) => domain.contentTypes);
