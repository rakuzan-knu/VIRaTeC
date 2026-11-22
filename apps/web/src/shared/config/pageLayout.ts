import { z } from 'zod';
import type { Locale } from '../i18n/model/types.ts';
import { ROUTES } from './routes.ts';

type LabelText = Record<Locale, string>;

interface BuiltinSection {
  key: string;
  label: LabelText;
}

const builtin = (key: string, label: LabelText): BuiltinSection => ({ key, label });

export const PAGE_SECTIONS = {
  HOME: [
    builtin('about', { en: 'About', uk: 'Про нас', de: 'Über uns', fr: 'À propos', ar: 'من نحن' }),
    builtin('research', {
      en: 'Research',
      uk: 'Дослідження',
      de: 'Forschung',
      fr: 'Recherche',
      ar: 'البحث',
    }),
    builtin('publications', {
      en: 'Latest publications',
      uk: 'Останні публікації',
      de: 'Neueste Publikationen',
      fr: 'Dernières publications',
      ar: 'أحدث المنشورات',
    }),
    builtin('getInvolved', {
      en: 'Get involved',
      uk: 'Долучитися',
      de: 'Mitmachen',
      fr: 'S’impliquer',
      ar: 'شارك معنا',
    }),
  ],
  ABOUT_INITIATIVE: [
    builtin('mission', { en: 'Mission', uk: 'Місія', de: 'Mission', fr: 'Mission', ar: 'المهمة' }),
    builtin('values', { en: 'Values', uk: 'Цінності', de: 'Werte', fr: 'Valeurs', ar: 'القيم' }),
    builtin('philosophy', {
      en: 'Philosophy',
      uk: 'Філософія',
      de: 'Philosophie',
      fr: 'Philosophie',
      ar: 'الفلسفة',
    }),
    builtin('founder', {
      en: 'Founder',
      uk: 'Засновниця',
      de: 'Gründerin',
      fr: 'Fondatrice',
      ar: 'المؤسِّسة',
    }),
    builtin('team', { en: 'Team', uk: 'Команда', de: 'Team', fr: 'Équipe', ar: 'الفريق' }),
    builtin('cta', {
      en: 'Call to action',
      uk: 'Заклик до дії',
      de: 'Handlungsaufruf',
      fr: 'Appel à l’action',
      ar: 'دعوة إلى العمل',
    }),
  ],
  VIRATEC: [
    builtin('whatIs', {
      en: 'What is VIRaTeC',
      uk: 'Що таке VIRaTeC',
      de: 'Was ist VIRaTeC',
      fr: 'Qu’est-ce que VIRaTeC',
      ar: 'ما هي VIRaTeC',
    }),
    builtin('journey', {
      en: 'Our journey',
      uk: 'Наш шлях',
      de: 'Unser Weg',
      fr: 'Notre parcours',
      ar: 'مسيرتنا',
    }),
    builtin('participants', {
      en: 'Participants',
      uk: 'Учасники',
      de: 'Teilnehmende',
      fr: 'Participants',
      ar: 'المشاركون',
    }),
    builtin('coil', { en: 'COIL', uk: 'COIL', de: 'COIL', fr: 'COIL', ar: 'COIL' }),
    builtin('join', {
      en: 'How to join',
      uk: 'Як долучитися',
      de: 'Mitmachen',
      fr: 'Comment nous rejoindre',
      ar: 'كيفية الانضمام',
    }),
    builtin('moments', { en: 'Moments', uk: 'Моменти', de: 'Momente', fr: 'Moments', ar: 'لحظات' }),
    builtin('cta', {
      en: 'Call to action',
      uk: 'Заклик до дії',
      de: 'Handlungsaufruf',
      fr: 'Appel à l’action',
      ar: 'دعوة إلى العمل',
    }),
  ],
  GLOBAL_COLLABORATION: [
    builtin('partners', {
      en: 'Partners',
      uk: 'Партнери',
      de: 'Partner',
      fr: 'Partenaires',
      ar: 'الشركاء',
    }),
    builtin('highlight', {
      en: 'Highlight',
      uk: 'Акцент',
      de: 'Schwerpunkt',
      fr: 'Temps fort',
      ar: 'أبرز ما لدينا',
    }),
    builtin('formats', { en: 'Formats', uk: 'Формати', de: 'Formate', fr: 'Formats', ar: 'الصيغ' }),
    builtin('partnership', {
      en: 'Partnership',
      uk: 'Партнерство',
      de: 'Partnerschaft',
      fr: 'Partenariat',
      ar: 'الشراكة',
    }),
    builtin('cta', {
      en: 'Call to action',
      uk: 'Заклик до дії',
      de: 'Handlungsaufruf',
      fr: 'Appel à l’action',
      ar: 'دعوة إلى العمل',
    }),
  ],
  OPPORTUNITIES: [
    builtin('events', {
      en: 'Upcoming events',
      uk: 'Найближчі події',
      de: 'Kommende Veranstaltungen',
      fr: 'Événements à venir',
      ar: 'الفعاليات القادمة',
    }),
    builtin('audiences', {
      en: 'Opportunities by role',
      uk: 'Можливості за ролями',
      de: 'Möglichkeiten nach Rolle',
      fr: 'Opportunités par profil',
      ar: 'الفرص حسب الدور',
    }),
    builtin('howItWorks', {
      en: 'How it works',
      uk: 'Як це працює',
      de: 'So funktioniert es',
      fr: 'Comment ça marche',
      ar: 'كيف يعمل',
    }),
    builtin('cta', {
      en: 'Call to action',
      uk: 'Заклик до дії',
      de: 'Handlungsaufruf',
      fr: 'Appel à l’action',
      ar: 'دعوة إلى العمل',
    }),
  ],
  RESEARCH_AREAS: [
    builtin('areas', {
      en: 'Research areas',
      uk: 'Напрями досліджень',
      de: 'Forschungsbereiche',
      fr: 'Domaines de recherche',
      ar: 'مجالات البحث',
    }),
    builtin('highlight', {
      en: 'Highlight',
      uk: 'Акцент',
      de: 'Schwerpunkt',
      fr: 'Temps fort',
      ar: 'أبرز ما لدينا',
    }),
    builtin('future', {
      en: 'Future directions',
      uk: 'Майбутні напрями',
      de: 'Künftige Richtungen',
      fr: 'Orientations futures',
      ar: 'التوجهات المستقبلية',
    }),
    builtin('cta', {
      en: 'Call to action',
      uk: 'Заклик до дії',
      de: 'Handlungsaufruf',
      fr: 'Appel à l’action',
      ar: 'دعوة إلى العمل',
    }),
  ],
  STUDENT_RESEARCH: [
    builtin('intro', {
      en: 'Overview',
      uk: 'Огляд',
      de: 'Überblick',
      fr: 'Aperçu',
      ar: 'نظرة عامة',
    }),
    builtin('projects', {
      en: 'Student projects',
      uk: 'Студентські проєкти',
      de: 'Studentische Projekte',
      fr: 'Projets étudiants',
      ar: 'مشاريع الطلاب',
    }),
    builtin('start', {
      en: 'How to start',
      uk: 'Як почати',
      de: 'Erste Schritte',
      fr: 'Comment commencer',
      ar: 'كيف تبدأ',
    }),
    builtin('cta', {
      en: 'Call to action',
      uk: 'Заклик до дії',
      de: 'Handlungsaufruf',
      fr: 'Appel à l’action',
      ar: 'دعوة إلى العمل',
    }),
  ],
  EXPERIENTIAL_LEARNING: [
    builtin('formats', { en: 'Formats', uk: 'Формати', de: 'Formate', fr: 'Formats', ar: 'الصيغ' }),
    builtin('approach', {
      en: 'Approach',
      uk: 'Підхід',
      de: 'Ansatz',
      fr: 'Approche',
      ar: 'النهج',
    }),
    builtin('outcomes', {
      en: 'Outcomes',
      uk: 'Результати',
      de: 'Ergebnisse',
      fr: 'Résultats',
      ar: 'النتائج',
    }),
    builtin('cta', {
      en: 'Call to action',
      uk: 'Заклик до дії',
      de: 'Handlungsaufruf',
      fr: 'Appel à l’action',
      ar: 'دعوة إلى العمل',
    }),
  ],
  CONTACT: [
    builtin('contact', {
      en: 'Contact details',
      uk: 'Контакти',
      de: 'Kontaktdaten',
      fr: 'Coordonnées',
      ar: 'بيانات الاتصال',
    }),
  ],
} as const satisfies Partial<Record<keyof typeof ROUTES, readonly BuiltinSection[]>>;

export type LayoutPage = keyof typeof PAGE_SECTIONS;

export const PAGE_LABELS: Record<LayoutPage, LabelText> = {
  HOME: { en: 'Home', uk: 'Головна', de: 'Startseite', fr: 'Accueil', ar: 'الرئيسية' },
  ABOUT_INITIATIVE: {
    en: 'About',
    uk: 'Про ініціативу',
    de: 'Über die Initiative',
    fr: 'À propos de l’initiative',
    ar: 'عن المبادرة',
  },
  VIRATEC: { en: 'VIRaTeC', uk: 'VIRaTeC', de: 'VIRaTeC', fr: 'VIRaTeC', ar: 'VIRaTeC' },
  GLOBAL_COLLABORATION: {
    en: 'Global collaboration',
    uk: 'Глобальна співпраця',
    de: 'Globale Zusammenarbeit',
    fr: 'Collaboration mondiale',
    ar: 'التعاون العالمي',
  },
  OPPORTUNITIES: {
    en: 'Opportunities',
    uk: 'Можливості',
    de: 'Möglichkeiten',
    fr: 'Opportunités',
    ar: 'الفرص',
  },
  RESEARCH_AREAS: {
    en: 'Research areas',
    uk: 'Напрями досліджень',
    de: 'Forschungsbereiche',
    fr: 'Domaines de recherche',
    ar: 'مجالات البحث',
  },
  STUDENT_RESEARCH: {
    en: 'Student research',
    uk: 'Студентські дослідження',
    de: 'Studentische Forschung',
    fr: 'Recherche étudiante',
    ar: 'البحث الطلابي',
  },
  EXPERIENTIAL_LEARNING: {
    en: 'Experiential learning',
    uk: 'Практичне навчання',
    de: 'Erfahrungsbasiertes Lernen',
    fr: 'Apprentissage expérientiel',
    ar: 'التعلم التجريبي',
  },
  CONTACT: { en: 'Contact', uk: 'Контакти', de: 'Kontakt', fr: 'Contact', ar: 'اتصل بنا' },
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

const localeText = z.string().max(4000);
const text = z.object({
  en: localeText,
  uk: localeText.optional(),
  de: localeText.optional(),
  fr: localeText.optional(),
  ar: localeText.optional(),
});
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
