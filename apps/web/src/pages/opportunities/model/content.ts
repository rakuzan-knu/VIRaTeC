import { useMemo } from 'react';
import { useLocale } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import type { StepItem } from '@/shared/ui/steps-list';
import type { AudienceSectionId } from './sections';
import { AUDIENCE_GROUPS } from './audience-groups.generated';
import type { AudienceGroup } from './types';
import { PAGE_TEXT } from './page.generated';

export type { Opportunity, AudienceGroup } from './types';

export { AUDIENCE_SECTION_IDS, type AudienceSectionId } from './sections';

export interface OpportunitiesContent {
  documentTitle: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  tabsLabel: string;
  eventsTitle: string;
  eventsDescription: string;
  audienceGroups: AudienceGroup[];
  howItWorksTitle: string;
  howItWorks: StepItem[];
  ctaTitle: string;
  ctaDescription: string;
}

export type OpportunitiesText = Omit<OpportunitiesContent, 'audienceGroups'>;

export const useOpportunitiesContent = (): OpportunitiesContent => {
  const locale = useLocale();
  const text = useLiveContent('opportunitiesPage', 'PAGE_TEXT', PAGE_TEXT)[locale];
  const audienceGroups = useLiveContent('audienceGroup', 'AUDIENCE_GROUPS', AUDIENCE_GROUPS)[
    locale
  ];
  return useMemo(() => ({ ...text, audienceGroups }), [text, audienceGroups]);
};
