import { useLocalized } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import type { StepItem } from '@/shared/ui/steps-list';
import type { HighlightStat } from '@/shared/ui/highlight-banner';
import { PAGE_TEXT } from './page.generated';

interface TitledText {
  title: string;
  description: string;
}

export interface StudentProject extends TitledText {
  image?: string;
  imageAlt?: string;
}

export interface StudentResearchContent {
  documentTitle: string;
  breadcrumb: string[];
  title: string;
  accent: string;
  description: string;
  bannerTitle: string;
  bannerDescription: string;
  stats: HighlightStat[];
  projectsEyebrow: string;
  projectsTitle: string;
  projectsDescription: string;
  projects: StudentProject[];
  startEyebrow: string;
  startTitle: string;
  startAccent: string;
  startSteps: StepItem[];
  ctaTitle: string;
  ctaDescription: string;
  ctaAction: string;
}

export const useStudentResearchContent = () =>
  useLocalized(useLiveContent('studentResearchPage', 'PAGE_TEXT', PAGE_TEXT));
