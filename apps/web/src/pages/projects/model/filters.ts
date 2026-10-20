import { ProjectStatus } from '@viratec/contracts';

export const ALL = 'all';

export const AREA_OPTIONS = [
  { value: ALL, label: 'All areas' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'AI & NLP', label: 'AI & NLP' },
  { value: 'Data Analytics', label: 'Data Analytics' },
  { value: 'Education & EdTech', label: 'Education & EdTech' },
  { value: 'Cross-cultural', label: 'Cross-cultural' },
  { value: 'Experiential', label: 'Experiential' },
] as const;

export type AreaFilter = (typeof AREA_OPTIONS)[number]['value'];

export const STATUS_OPTIONS = [
  { value: ALL, label: 'All' },
  { value: ProjectStatus.IN_PROGRESS, label: 'Ongoing' },
  { value: ProjectStatus.COMPLETED, label: 'Completed' },
  { value: ProjectStatus.IDEA, label: 'Planned' },
] as const;

export type StatusFilter = (typeof STATUS_OPTIONS)[number]['value'];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az', label: 'A–Z' },
] as const;

export type SortOrder = (typeof SORT_OPTIONS)[number]['value'];

export const PAGE_SIZE = 6;

const pickOption = <T extends string>(options: readonly { value: T }[], raw: string | null) =>
  options.find((option) => option.value === raw)?.value ?? options[0].value;

export const parseArea = (raw: string | null): AreaFilter =>
  pickOption<AreaFilter>(AREA_OPTIONS, raw);
export const parseStatus = (raw: string | null): StatusFilter =>
  pickOption<StatusFilter>(STATUS_OPTIONS, raw);
export const parseSort = (raw: string | null): SortOrder =>
  pickOption<SortOrder>(SORT_OPTIONS, raw);
