import { buildPublicationPath } from '@/shared/config/routes';
import { useMemo } from 'react';
import { defineMessages, useLocale } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import { PAGE_TEXT } from './page.generated';

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
  publications: Omit<HomeContent['publications'], 'items'>;
};

const PUBLICATION_ITEMS = defineMessages<PublicationCard[]>({
  en: [
    {
      year: '2026',
      title: 'Big Data and AI: the foundation of the digital economy',
      source: 'K. Kravets, A. Mekshun, A. Loban, L. Liashenko · Grail of Science, No. 67',
      to: buildPublicationPath('big-data-and-ai-digital-economy'),
    },
    {
      year: '2026',
      title: 'The economic efficiency of AI-driven talent acquisition',
      source: 'M. Artemenko, S. Vasylyeva, M. Tymoshenko, L. Liashenko · Grail of Science, No. 67',
      to: buildPublicationPath('ai-driven-talent-acquisition'),
    },
    {
      year: '2026',
      title: 'Digital Narratives: AI and IT in Multidisciplinary Research 2026',
      source: 'Conference · KNU, 8 June 2026',
      to: buildPublicationPath('digital-narratives-2026'),
    },
  ],
  uk: [
    {
      year: '2026',
      title: 'Big Data and AI: the foundation of the digital economy',
      source: 'К. Кравець, А. Мекшун, А. Лобан, Л. Ляшенко · Grail of Science, № 67',
      to: buildPublicationPath('big-data-and-ai-digital-economy'),
    },
    {
      year: '2026',
      title: 'The economic efficiency of AI-driven talent acquisition',
      source: 'М. Артеменко, С. Васильєва, М. Тимошенко, Л. Ляшенко · Grail of Science, № 67',
      to: buildPublicationPath('ai-driven-talent-acquisition'),
    },
    {
      year: '2026',
      title: 'Digital Narratives: ШІ та ІТ у мультидисциплінарних дослідженнях 2026',
      source: 'Конференція · КНУ, 8 червня 2026',
      to: buildPublicationPath('digital-narratives-2026'),
    },
  ],
});

export const useHomeContent = (): HomeContent => {
  const locale = useLocale();
  const text = useLiveContent('homePage', 'PAGE_TEXT', PAGE_TEXT)[locale];
  return useMemo(
    () => ({ ...text, publications: { ...text.publications, items: PUBLICATION_ITEMS[locale] } }),
    [text, locale],
  );
};
