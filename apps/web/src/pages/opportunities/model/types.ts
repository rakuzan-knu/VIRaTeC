import type { AudienceSectionId } from './sections';

export interface Opportunity {
  meta: string;
  title: string;
  description: string;
  actionLabel: string;
  to?: string;
  href?: string;
}

export interface AudienceGroup {
  id: AudienceSectionId;
  tab: string;
  title: string;
  description: string;
  opportunities: Opportunity[];
}
