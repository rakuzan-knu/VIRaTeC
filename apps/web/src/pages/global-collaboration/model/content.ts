import { useLocalized } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import type { StepItem } from '@/shared/ui/steps-list';
import { PAGE_TEXT } from './page.generated';

interface Stat {
  value: string;
  label: string;
}

interface Format {
  title: string;
  description: string;
  to: string;
  image?: string;
}

export interface GlobalCollaborationContent {
  documentTitle: string;
  breadcrumb: string[];
  title: string;
  accent: string;
  description: string;
  partnersEyebrow: string;
  partnersTitle: string;
  inviteTitle: string;
  inviteDescription: string;
  bannerTitle: string;
  bannerDescription: string;
  stats: Stat[];
  formatsEyebrow: string;
  formatsTitle: string;
  formatsDescription: string;
  formats: Format[];
  partnershipEyebrow: string;
  partnershipTitle: string;
  partnershipAccent: string;
  partnershipSteps: StepItem[];
  ctaTitle: string;
  ctaDescription: string;
  ctaAction: string;
}

export const useGlobalCollaborationContent = () =>
  useLocalized(useLiveContent('globalCollaborationPage', 'PAGE_TEXT', PAGE_TEXT));
