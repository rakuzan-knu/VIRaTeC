import { useMemo } from 'react';
import { useLocale } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import type { StepItem } from '@/shared/ui/steps-list';
import { MILESTONES } from './milestones.generated';
import { MOMENTS } from './moments.generated';
import type { Milestone, MomentItem } from './types';
import { PAGE_TEXT } from './page.generated';

export type { Milestone, MomentItem } from './types';

interface Stat {
  value: string;
  label: string;
}

interface TitledText {
  title: string;
  description: string;
}

interface Principle extends TitledText {
  to: string;
  image?: string;
}

export interface ViratecContent {
  documentTitle: string;
  breadcrumb: string[];
  title: string;
  accent: string;
  description: string;
  whatIsEyebrow: string;
  whatIsTitle: string;
  whatIsDescription: string;
  videoTitle: string;
  videoTranscriptLabel: string;
  videoTranscript: string[];
  stats: Stat[];
  journeyEyebrow: string;
  journeyTitle: string;
  journeyAccent: string;
  milestones: Milestone[];
  participantsEyebrow: string;
  participantsTitle: string;
  participants: TitledText[];
  coilEyebrow: string;
  coilTitle: string;
  coilDescription: string;
  principles: Principle[];
  joinEyebrow: string;
  joinTitle: string;
  joinAccent: string;
  joinSteps: StepItem[];
  momentsEyebrow: string;
  momentsTitle: string;
  momentsAccent: string;
  moments: MomentItem[];
  ctaTitle: string;
  ctaDescription: string;
}

export type ViratecText = Omit<ViratecContent, 'milestones' | 'moments'>;

export const useViratecContent = (): ViratecContent => {
  const locale = useLocale();
  const text = useLiveContent('viratecPage', 'PAGE_TEXT', PAGE_TEXT)[locale];
  const milestones = useLiveContent('milestone', 'MILESTONES', MILESTONES)[locale];
  const moments = useLiveContent('galleryItem', 'MOMENTS', MOMENTS)[locale];
  return useMemo(() => ({ ...text, milestones, moments }), [text, milestones, moments]);
};
