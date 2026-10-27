import type { Localized } from '@/shared/i18n/model/types';
import type { PublicationCard } from './content';

export const HOME_PUBLICATIONS: Localized<PublicationCard[]> = {
  en: [
    {
      year: '2026',
      title: 'Big Data and AI: the foundation of the digital economy',
      source: 'K. Kravets, A. Mekshun, A. Loban, L. Liashenko · Grail of Science, No. 67',
      to: '/publications/big-data-and-ai-digital-economy',
    },
    {
      year: '2026',
      title: 'The economic efficiency of AI-driven talent acquisition',
      source: 'M. Artemenko, S. Vasylyeva, M. Tymoshenko, L. Liashenko · Grail of Science, No. 67',
      to: '/publications/ai-driven-talent-acquisition',
    },
    {
      year: '2026',
      title: 'Human-AI interaction in multilingual professional teams: a pragmatic analysis',
      source: 'K. Matukh, K. Liashenko, L. Liashenko, L. Budanova · Studia Linguistica, Vol. 28',
      to: '/publications/human-ai-interaction-multilingual-teams-2026',
    },
  ],
  uk: [
    {
      year: '2026',
      title: 'Big Data and AI: the foundation of the digital economy',
      source: 'К. Кравець, А. Мекшун, А. Лобан, Л. Ляшенко · Grail of Science, № 67',
      to: '/publications/big-data-and-ai-digital-economy',
    },
    {
      year: '2026',
      title: 'The economic efficiency of AI-driven talent acquisition',
      source: 'М. Артеменко, С. Васильєва, М. Тимошенко, Л. Ляшенко · Grail of Science, № 67',
      to: '/publications/ai-driven-talent-acquisition',
    },
    {
      year: '2026',
      title: 'Human-AI interaction in multilingual professional teams: a pragmatic analysis',
      source: 'К. Матух, К. Ляшенко, Л. Ляшенко, Л. Буданова · Studia Linguistica, т. 28',
      to: '/publications/human-ai-interaction-multilingual-teams-2026',
    },
  ],
};
