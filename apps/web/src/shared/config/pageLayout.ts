import { z } from 'zod';
import type { Locale } from '../i18n/model/types.ts';
import { ROUTES } from './routes.ts';

type LabelText = Record<Locale, string>;

interface BuiltinSection {
  key: string;
  label: LabelText;
}

const builtin = (key: string, en: string, uk: string): BuiltinSection => ({
  key,
  label: { en, uk },
});

export const PAGE_SECTIONS = {
  HOME: [
    builtin('about', 'About', 'Про нас'),
    builtin('research', 'Research', 'Дослідження'),
    builtin('publications', 'Latest publications', 'Останні публікації'),
    builtin('getInvolved', 'Get involved', 'Долучитися'),
  ],
  ABOUT_INITIATIVE: [
    builtin('mission', 'Mission', 'Місія'),
    builtin('values', 'Values', 'Цінності'),
    builtin('philosophy', 'Philosophy', 'Філософія'),
    builtin('founder', 'Founder', 'Засновниця'),
    builtin('team', 'Team', 'Команда'),
    builtin('cta', 'Call to action', 'Заклик до дії'),
  ],
  VIRATEC: [
    builtin('whatIs', 'What is VIRaTeC', 'Що таке VIRaTeC'),
    builtin('journey', 'Our journey', 'Наш шлях'),
    builtin('participants', 'Participants', 'Учасники'),
    builtin('coil', 'COIL', 'COIL'),
    builtin('join', 'How to join', 'Як долучитися'),
    builtin('moments', 'Moments', 'Моменти'),
    builtin('cta', 'Call to action', 'Заклик до дії'),
  ],
  GLOBAL_COLLABORATION: [
    builtin('partners', 'Partners', 'Партнери'),
    builtin('highlight', 'Highlight', 'Акцент'),
    builtin('formats', 'Formats', 'Формати'),
    builtin('partnership', 'Partnership', 'Партнерство'),
    builtin('cta', 'Call to action', 'Заклик до дії'),
  ],
  OPPORTUNITIES: [
    builtin('events', 'Upcoming events', 'Найближчі події'),
    builtin('audiences', 'Opportunities by role', 'Можливості за ролями'),
    builtin('howItWorks', 'How it works', 'Як це працює'),
    builtin('cta', 'Call to action', 'Заклик до дії'),
  ],
  RESEARCH_AREAS: [
    builtin('areas', 'Research areas', 'Напрями досліджень'),
    builtin('highlight', 'Highlight', 'Акцент'),
    builtin('future', 'Future directions', 'Майбутні напрями'),
    builtin('cta', 'Call to action', 'Заклик до дії'),
  ],
  STUDENT_RESEARCH: [
    builtin('intro', 'Overview', 'Огляд'),
    builtin('projects', 'Student projects', 'Студентські проєкти'),
    builtin('start', 'How to start', 'Як почати'),
    builtin('cta', 'Call to action', 'Заклик до дії'),
  ],
  EXPERIENTIAL_LEARNING: [
    builtin('formats', 'Formats', 'Формати'),
    builtin('approach', 'Approach', 'Підхід'),
    builtin('outcomes', 'Outcomes', 'Результати'),
    builtin('cta', 'Call to action', 'Заклик до дії'),
  ],
  CONTACT: [builtin('contact', 'Contact details', 'Контакти')],
} as const satisfies Partial<Record<keyof typeof ROUTES, readonly BuiltinSection[]>>;

export type LayoutPage = keyof typeof PAGE_SECTIONS;

export const PAGE_LABELS: Record<LayoutPage, LabelText> = {
  HOME: { en: 'Home', uk: 'Головна' },
  ABOUT_INITIATIVE: { en: 'About', uk: 'Про ініціативу' },
  VIRATEC: { en: 'VIRaTeC', uk: 'VIRaTeC' },
  GLOBAL_COLLABORATION: { en: 'Global collaboration', uk: 'Глобальна співпраця' },
  OPPORTUNITIES: { en: 'Opportunities', uk: 'Можливості' },
  RESEARCH_AREAS: { en: 'Research areas', uk: 'Напрями досліджень' },
  STUDENT_RESEARCH: { en: 'Student research', uk: 'Студентські дослідження' },
  EXPERIENTIAL_LEARNING: { en: 'Experiential learning', uk: 'Практичне навчання' },
  CONTACT: { en: 'Contact', uk: 'Контакти' },
};

export const LAYOUT_PAGES = Object.keys(PAGE_SECTIONS) as LayoutPage[];

export type BuiltinSectionKey<P extends LayoutPage> = (typeof PAGE_SECTIONS)[P][number]['key'];

export const isLayoutPage = (value: unknown): value is LayoutPage =>
  typeof value === 'string' && value in PAGE_SECTIONS;

export const SECTION_ROUTE_KEYS = [
  'HOME',
  'ABOUT_INITIATIVE',
  'VIRATEC',
  'GLOBAL_COLLABORATION',
  'RESEARCH_AREAS',
  'PROJECTS',
  'EXPERIENTIAL_LEARNING',
  'STUDENT_RESEARCH',
  'PUBLICATIONS',
  'OPPORTUNITIES',
  'CONTACT',
  'PEOPLE',
  'REGISTER',
] as const satisfies readonly (keyof typeof ROUTES)[];

export type SectionRouteKey = (typeof SECTION_ROUTE_KEYS)[number];

const text = z.object({ en: z.string().max(4000), uk: z.string().max(4000) });
const routeKey = z.enum(SECTION_ROUTE_KEYS);
const externalUrl = z
  .string()
  .max(2048)
  .regex(/^https:\/\/\S+$/);

export const SECTION_IMAGE_HOST = 'https://images.ctfassets.net/';

const image = z.object({
  assetId: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  url: z
    .string()
    .max(2048)
    .refine((value) => value.startsWith(SECTION_IMAGE_HOST) && !/\s/.test(value)),
  alt: text,
});

const base = { id: z.string().regex(/^[a-z0-9-]{4,40}$/), hidden: z.boolean().optional() };

export const pageSectionSchema = z.discriminatedUnion('type', [
  z.object({ ...base, type: z.literal('builtin'), key: z.string().max(40) }),
  z.object({
    ...base,
    type: z.literal('block'),
    blockId: z.string().regex(/^[A-Za-z0-9_.-]{1,64}$/),
  }),
  z.object({
    ...base,
    type: z.literal('text'),
    eyebrow: text,
    title: text,
    body: text,
  }),
  z.object({
    ...base,
    type: z.literal('cards'),
    eyebrow: text,
    title: text,
    description: text,
    items: z
      .array(
        z.object({
          title: text,
          description: text,
          linkLabel: text,
          link: routeKey.nullable(),
          image: image.nullable().optional(),
        }),
      )
      .max(12),
  }),
  z.object({
    ...base,
    type: z.literal('media'),
    eyebrow: text,
    title: text,
    body: text,
    image: image.nullable(),
    imageSide: z.enum(['left', 'right']),
  }),
  z.object({
    ...base,
    type: z.literal('stats'),
    title: text,
    description: text,
    items: z.array(z.object({ value: z.string().max(24), label: text })).max(6),
  }),
  z.object({
    ...base,
    type: z.literal('cta'),
    title: text,
    description: text,
    actionLabel: text,
    link: z.union([routeKey, externalUrl]),
  }),
]);

export const pageSectionsSchema = z.array(pageSectionSchema).max(40);

export type PageSectionItem = z.infer<typeof pageSectionSchema>;

export type CustomSectionItem = Exclude<PageSectionItem, { type: 'builtin' | 'block' }>;

export type CustomSectionType = CustomSectionItem['type'];

export type SectionImage = z.infer<typeof image>;

export const CUSTOM_SECTION_TYPES = [
  'text',
  'media',
  'cards',
  'stats',
  'cta',
] as const satisfies readonly CustomSectionType[];

export interface PageLayoutData {
  entryId: string;
  sections: PageSectionItem[];
}

export type PageLayouts = Partial<Record<LayoutPage, PageLayoutData>>;

export const defaultSections = (page: LayoutPage): PageSectionItem[] =>
  PAGE_SECTIONS[page].map(({ key }) => ({
    id: `builtin-${key.toLowerCase()}`,
    type: 'builtin',
    key,
  }));

export const resolveSections = (
  page: LayoutPage,
  stored: readonly PageSectionItem[] | undefined,
): PageSectionItem[] => {
  if (!stored) return defaultSections(page);
  const keys = new Set<string>(PAGE_SECTIONS[page].map(({ key }) => key));
  const seen = new Set<string>();
  const sections = stored.filter((section) => {
    if (section.type !== 'builtin') return true;
    if (!keys.has(section.key) || seen.has(section.key)) return false;
    seen.add(section.key);
    return true;
  });
  const missing = defaultSections(page).filter(
    (section) => section.type === 'builtin' && !seen.has(section.key),
  );
  return [...sections, ...missing];
};

export const builtinLabel = (page: LayoutPage, key: string, locale: Locale) =>
  PAGE_SECTIONS[page].find((section) => section.key === key)?.label[locale] ?? key;
