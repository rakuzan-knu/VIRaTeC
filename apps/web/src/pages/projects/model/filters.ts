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
