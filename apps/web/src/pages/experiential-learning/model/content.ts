import { useLocalized } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import type { StepItem } from '@/shared/ui/steps-list';
import { PAGE_TEXT } from './page.generated';

interface LearningFormat {
  title: string;
  description: string;
  linkLabel: string;
  to: string;
}

interface TitledText {
  title: string;
  description: string;
}

export interface ExperientialLearningContent {
  documentTitle: string;
  breadcrumb: string[];
  title: string;
  accent: string;
  description: string;
  formatsEyebrow: string;
  formatsTitle: string;
  formats: LearningFormat[];
  approachEyebrow: string;
  approachTitle: string;
  approachAccent: string;
  principles: StepItem[];
  outcomesEyebrow: string;
  outcomesTitle: string;
  outcomes: TitledText[];
  ctaTitle: string;
  ctaDescription: string;
}

export const useExperientialLearningContent = () =>
  useLocalized(useLiveContent('experientialLearningPage', 'PAGE_TEXT', PAGE_TEXT));
