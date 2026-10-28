import { useLocalized } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import type { HighlightStat } from '@/shared/ui/highlight-banner';
import { PAGE_TEXT } from './page.generated';

interface TitledText {
  title: string;
  description: string;
}

export interface ResearchArea extends TitledText {
  image?: string;
  imageAlt?: string;
}

export interface ResearchAreasContent {
  documentTitle: string;
  breadcrumb: string[];
  title: string;
  accent: string;
  description: string;
  areasEyebrow: string;
  areasTitle: string;
  areasDescription: string;
  areas: ResearchArea[];
  bannerTitle: string;
  bannerDescription: string;
  stats: HighlightStat[];
  futureEyebrow: string;
  futureTitle: string;
  futureDescription: string;
  futureDirections: TitledText[];
  discussProject: string;
  ctaTitle: string;
  ctaDescription: string;
}

export const useResearchAreasContent = () =>
  useLocalized(useLiveContent('researchAreasPage', 'PAGE_TEXT', PAGE_TEXT));
