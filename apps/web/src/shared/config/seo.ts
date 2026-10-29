import type { Localized } from '../i18n/model/types';
import { ROUTES } from './routes';
import { DEFAULT_SEO, PAGE_SEO_ENTRIES } from './seo.generated';

export const SITE_NAME = 'VIRaTeC';
export const DEFAULT_TITLE = 'VIRaTeC — Virtual Innovating Research & Technology Community (КНУ)';

export const OG_IMAGE = {
  path: '/og-image.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'VIRaTeC — Virtual Innovative Research & Technology Community, КНУ імені Тараса Шевченка',
} as const;

export interface PageSeo {
  title?: string;
  description: string;
}

export interface PageSeoEntry {
  route: string;
  seo: Localized<PageSeo>;
}

export { DEFAULT_SEO };

export const PAGE_SEO: Partial<Record<string, Localized<PageSeo>>> = Object.fromEntries(
  PAGE_SEO_ENTRIES.map(({ route, seo }) => [route, seo]),
);

export const NOINDEX_PATHS: readonly string[] = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.VERIFY_EMAIL,
  ROUTES.ACCOUNT,
];

export const ROBOTS_INDEX =
  'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
export const ROBOTS_NOINDEX = 'noindex, follow';

export const SOCIAL_LOCALE: Localized<string> = { en: 'en_GB', uk: 'uk_UA' };

const DESCRIPTION_LIMIT = 160;

export const normalizePath = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

export const absoluteUrl = (pathname: string, siteUrl: string) =>
  new URL(normalizePath(pathname), siteUrl).href;

export const formatTitle = (title?: string) => (title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE);

export const toMetaDescription = (text: string) => {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= DESCRIPTION_LIMIT) return collapsed;
  const cut = collapsed.slice(0, DESCRIPTION_LIMIT - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:—-]+$/, '')}…`;
};
