import { useMemo } from 'react';
import { usePublications } from '@/entities/publication';
import { useLocale } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import {
  pickHomePublications,
  toPublicationCard,
} from '../../../../build-tools/contentful/records.ts';
import { PAGE_TEXT } from './page.generated';
import { HOME_PUBLICATIONS } from './publications.generated';

export interface Pillar {
  index: string;
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface ProjectCard {
  title: string;
  description: string;
  to: string;
}

export interface PublicationCard {
  year: string;
  title: string;
  source: string;
  to: string;
  isUpcoming?: boolean;
}

export interface Audience {
  title: string;
  description: string;
}

export interface HomeContent {
  hero: {
    eyebrow: string;
    titleLine: string;
    titleAccent: string;
    description: string;
    researchAction: string;
    collaborateAction: string;
    partnersCaption: string;
  };
  about: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    description: string;
    action: string;
    pillars: Pillar[];
    stats: Stat[];
  };
  research: {
    eyebrow: string;
    title: string;
    action: string;
    cardAction: string;
    projects: ProjectCard[];
    highlightTitle: string;
    highlightDescription: string;
    highlightNumbers: Stat[];
  };
  publications: {
    eyebrow: string;
    title: string;
    action: string;
    cardAction: string;
    items: PublicationCard[];
  };
  getInvolved: {
    eyebrow: string;
    titleLine: string;
    titleAccent: string;
    action: string;
    audiences: Audience[];
  };
}

export type HomeText = Omit<HomeContent, 'publications'> & {
  publications: Omit<HomeContent['publications'], 'items'> & { slugs?: string[] };
};

const NO_SLUGS: string[] = [];

export const useHomeContent = (): HomeContent => {
  const locale = useLocale();
  const text = useLiveContent('homePage', 'PAGE_TEXT', PAGE_TEXT)[locale];
  const live = usePublications();
  const slugs = text.publications.slugs ?? NO_SLUGS;
  const isLive = !live.isPending && !live.isError;
  return useMemo(
    () => ({
      ...text,
      publications: {
        ...text.publications,
        items: isLive
          ? pickHomePublications(live.publications, slugs).map(toPublicationCard)
          : HOME_PUBLICATIONS[locale],
      },
    }),
    [text, locale, isLive, live.publications, slugs],
  );
};
