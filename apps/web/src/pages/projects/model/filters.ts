import { ProjectStatus } from '@viratec/contracts';
import { defineMessages, mapLocalized, useLocalized } from '@/shared/i18n';

export const ALL = 'all';

const AREA_VALUES = [
  ALL,
  'Cybersecurity',
  'AI & NLP',
  'Data Analytics',
  'Education & EdTech',
  'Cross-cultural',
  'Experiential',
] as const;

export type AreaFilter = (typeof AREA_VALUES)[number];

const STATUS_VALUES = [
  ALL,
  ProjectStatus.IN_PROGRESS,
  ProjectStatus.COMPLETED,
  ProjectStatus.IDEA,
] as const;

export type StatusFilter = (typeof STATUS_VALUES)[number];

const SORT_VALUES = ['newest', 'oldest', 'az'] as const;

export type SortOrder = (typeof SORT_VALUES)[number];

interface FilterLabels {
  area: Record<AreaFilter, string>;
  status: Record<StatusFilter, string>;
  sort: Record<SortOrder, string>;
}

const FILTER_LABELS = defineMessages<FilterLabels>({
  en: {
    area: {
      [ALL]: 'All areas',
      Cybersecurity: 'Cybersecurity',
      'AI & NLP': 'AI & NLP',
      'Data Analytics': 'Data Analytics',
      'Education & EdTech': 'Education & EdTech',
      'Cross-cultural': 'Cross-cultural',
      Experiential: 'Experiential',
    },
    status: {
      [ALL]: 'All',
      [ProjectStatus.IN_PROGRESS]: 'Ongoing',
      [ProjectStatus.COMPLETED]: 'Completed',
      [ProjectStatus.IDEA]: 'Planned',
    },
    sort: { newest: 'Newest first', oldest: 'Oldest first', az: 'A–Z' },
  },
  uk: {
    area: {
      [ALL]: 'Усі напрями',
      Cybersecurity: 'Кібербезпека',
      'AI & NLP': 'ШІ та NLP',
      'Data Analytics': 'Аналітика даних',
      'Education & EdTech': 'Освіта та EdTech',
      'Cross-cultural': 'Міжкультурна співпраця',
      Experiential: 'Навчання через досвід',
    },
    status: {
      [ALL]: 'Усі',
      [ProjectStatus.IN_PROGRESS]: 'Триває',
      [ProjectStatus.COMPLETED]: 'Завершено',
      [ProjectStatus.IDEA]: 'Заплановано',
    },
    sort: { newest: 'Спочатку нові', oldest: 'Спочатку старі', az: 'А–Я' },
  },
  de: {
    area: {
      [ALL]: 'Alle Bereiche',
      Cybersecurity: 'Cybersicherheit',
      'AI & NLP': 'KI & NLP',
      'Data Analytics': 'Datenanalyse',
      'Education & EdTech': 'Bildung & EdTech',
      'Cross-cultural': 'Interkulturell',
      Experiential: 'Erfahrungsbasiert',
    },
    status: {
      [ALL]: 'Alle',
      [ProjectStatus.IN_PROGRESS]: 'Laufend',
      [ProjectStatus.COMPLETED]: 'Abgeschlossen',
      [ProjectStatus.IDEA]: 'Geplant',
    },
    sort: { newest: 'Neueste zuerst', oldest: 'Älteste zuerst', az: 'A–Z' },
  },
  fr: {
    area: {
      [ALL]: 'Tous les domaines',
      Cybersecurity: 'Cybersécurité',
      'AI & NLP': 'IA & TAL',
      'Data Analytics': 'Analyse de données',
      'Education & EdTech': 'Éducation & EdTech',
      'Cross-cultural': 'Interculturel',
      Experiential: 'Expérientiel',
    },
    status: {
      [ALL]: 'Tous',
      [ProjectStatus.IN_PROGRESS]: 'En cours',
      [ProjectStatus.COMPLETED]: 'Terminés',
      [ProjectStatus.IDEA]: 'Prévus',
    },
    sort: { newest: 'Plus récents d’abord', oldest: 'Plus anciens d’abord', az: 'A–Z' },
  },
  ar: {
    area: {
      [ALL]: 'جميع المجالات',
      Cybersecurity: 'الأمن السيبراني',
      'AI & NLP': 'الذكاء الاصطناعي ومعالجة اللغة',
      'Data Analytics': 'تحليل البيانات',
      'Education & EdTech': 'التعليم وتقنياته',
      'Cross-cultural': 'بين الثقافات',
      Experiential: 'تجريبي',
    },
    status: {
      [ALL]: 'الكل',
      [ProjectStatus.IN_PROGRESS]: 'جارية',
      [ProjectStatus.COMPLETED]: 'مكتملة',
      [ProjectStatus.IDEA]: 'مخطط لها',
    },
    sort: { newest: 'الأحدث أولًا', oldest: 'الأقدم أولًا', az: 'أ–ي' },
  },
});

const toOptions = <T extends string>(values: readonly T[], labels: Record<T, string>) =>
  values.map((value) => ({ value, label: labels[value] }));

const FILTER_OPTIONS = mapLocalized(FILTER_LABELS, (labels) => ({
  area: toOptions(AREA_VALUES, labels.area),
  status: toOptions(STATUS_VALUES, labels.status),
  sort: toOptions(SORT_VALUES, labels.sort),
}));

export const useFilterOptions = () => useLocalized(FILTER_OPTIONS);

export const PAGE_SIZE = 6;

const pickValue = <T extends string>(values: readonly [T, ...T[]], raw: string | null) =>
  values.find((value) => value === raw) ?? values[0];

export const parseArea = (raw: string | null): AreaFilter =>
  pickValue<AreaFilter>(AREA_VALUES, raw);
export const parseStatus = (raw: string | null): StatusFilter =>
  pickValue<StatusFilter>(STATUS_VALUES, raw);
export const parseSort = (raw: string | null): SortOrder => pickValue<SortOrder>(SORT_VALUES, raw);
