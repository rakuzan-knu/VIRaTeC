import { useMemo } from 'react';
import { useLocale } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import type { StepItem } from '@/shared/ui/steps-list';
import { FOUNDER, TEAM } from './team.generated';
import type { TeamMember } from './types';
import { PAGE_TEXT } from './page.generated';

export type { TeamMember, Founder } from './types';

interface LabeledText {
  label: string;
  text: string;
}

interface TitledText {
  title: string;
  description: string;
}

export interface AboutInitiativeContent {
  documentTitle: string;
  breadcrumb: string[];
  title: string;
  accent: string;
  description: string;
  missionEyebrow: string;
  missionTitle: string;
  missionVision: LabeledText[];
  valuesEyebrow: string;
  valuesTitle: string;
  values: TitledText[];
  philosophyEyebrow: string;
  philosophyTitle: string;
  philosophy: StepItem[];
  founderEyebrow: string;
  founderName: string;
  founderRole: string;
  founderBio: string[];
  teamEyebrow: string;
  teamTitle: string;
  teamAccent: string;
  team: TeamMember[];
  ctaTitle: string;
  ctaDescription: string;
  ctaAction: string;
}

export type AboutInitiativeText = Omit<
  AboutInitiativeContent,
  'founderName' | 'founderRole' | 'founderBio' | 'team'
>;

export const useAboutInitiativeContent = (): AboutInitiativeContent & { founderPhoto: string } => {
  const locale = useLocale();
  const text = useLiveContent('aboutInitiativePage', 'PAGE_TEXT', PAGE_TEXT)[locale];
  const founder = useLiveContent('person', 'FOUNDER', FOUNDER);
  const team = useLiveContent('person', 'TEAM', TEAM)[locale];
  return useMemo(
    () => ({
      ...text,
      founderName: founder[locale].name,
      founderRole: founder[locale].role,
      founderBio: founder[locale].bio,
      founderPhoto: founder.en.photo,
      team,
    }),
    [text, founder, team, locale],
  );
};
