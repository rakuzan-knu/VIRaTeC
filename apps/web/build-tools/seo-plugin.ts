import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer, type Plugin, type ResolvedConfig, type Rollup } from 'vite';
import type { PublicationDto } from '@viratec/contracts';
import { INTL_LOCALE, pickLocalized, type Locale } from '../src/shared/i18n/model/types';
import type { Publication } from '../src/entities/publication/model/types';
import type { Project } from '../src/entities/project/model/types';
import { localizeProject } from '../src/entities/project/lib/localize';
import {
  ROUTES,
  buildProjectPath,
  buildPublicationPath,
  toEnglishPath,
} from '../src/shared/config/routes';
import {
  DEFAULT_SEO,
  OG_IMAGE,
  PAGE_SEO,
  ROBOTS_INDEX,
  SITE_NAME,
  SOCIAL_LOCALE,
  absoluteUrl,
  formatTitle,
  toMetaDescription,
} from '../src/shared/config/seo';
import { fetchRecords, saveRecords } from './prerender-records';

const HEAD_PLACEHOLDER = '<!--seo-head-->';
const SEO_LOCALE: Locale = 'uk';
const SEO_LOCALES = ['uk', 'en'] as const;
const HTML_LANG = /<html lang="[^"]*"/;
const SPA_FALLBACK_FILE = 'spa.html';
const PUBLICATIONS_MODULE = '/src/entities/publication/model/data.ts';

interface HeadImage {
  url: string;
  alt: string;
  type?: string;
  width?: number;
  height?: number;
}

interface Site {
  url: (pathname: string) => string;
  websiteId: string;
  organizationId: string;
  defaultImage: HeadImage;
}

interface PageHead {
  path?: string;
  base?: string;
  locale: Locale;
  title: string;
  description: string;
  type: 'website' | 'article';
  image: HeadImage;
  jsonLd?: Record<string, unknown>;
}

type Page = PageHead & { path: string; base: string };

interface SitemapEntry {
  path: string;
  base: string;
  priority: string;
  changefreq: 'weekly' | 'monthly' | 'yearly';
}

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeText = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const meta = (attribute: 'name' | 'property', key: string, content: string) =>
  `<meta ${attribute}="${key}" content="${escapeAttribute(content)}" />`;

const localePath = (base: string, locale: Locale) => (locale === 'en' ? toEnglishPath(base) : base);

const otherLocale = (locale: Locale): Locale => (locale === 'en' ? 'uk' : 'en');

const createSite = (siteUrl: string): Site => {
  const url = (pathname: string) => absoluteUrl(pathname, siteUrl);
  return {
    url,
    websiteId: `${url('/')}#website`,
    organizationId: `${url('/')}#organization`,
    defaultImage: {
      url: url(OG_IMAGE.path),
      alt: OG_IMAGE.alt,
      type: OG_IMAGE.type,
      width: OG_IMAGE.width,
      height: OG_IMAGE.height,
    },
  };
};

const alternateLinks = (site: Site, base: string) =>
  [
    ...SEO_LOCALES.map((locale) => [locale, site.url(localePath(base, locale))]),
    ['x-default', site.url(base)],
  ].map(
    ([hreflang, href]) =>
      `<link rel="alternate" hreflang="${hreflang}" href="${escapeAttribute(href)}" />`,
  );

const renderHead = (
  site: Site,
  { path, base, locale, title, description, type, image, jsonLd }: PageHead,
) => {
  const url = path === undefined ? undefined : site.url(path);
  const tags = [
    `<title>${escapeText(title)}</title>`,
    meta('name', 'description', description),
    meta('name', 'robots', ROBOTS_INDEX),
    url && `<link rel="canonical" href="${escapeAttribute(url)}" />`,
    ...(base === undefined ? [] : alternateLinks(site, base)),
    meta('property', 'og:type', type),
    url && meta('property', 'og:url', url),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:image', image.url),
    image.type && meta('property', 'og:image:type', image.type),
    image.width && meta('property', 'og:image:width', String(image.width)),
    image.height && meta('property', 'og:image:height', String(image.height)),
    meta('property', 'og:image:alt', image.alt),
    meta('property', 'og:locale', SOCIAL_LOCALE[locale]),
    meta('property', 'og:locale:alternate', SOCIAL_LOCALE[otherLocale(locale)]),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:description', description),
    meta('name', 'twitter:image', image.url),
    meta('name', 'twitter:image:alt', image.alt),
    jsonLd &&
      `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ];

  return tags.filter(Boolean).join('\n    ');
};

const webPageJsonLd = (
  site: Site,
  path: string,
  title: string,
  description: string,
  locale: Locale,
) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${site.url(path)}#webpage`,
  url: site.url(path),
  name: title,
  description,
  inLanguage: INTL_LOCALE[locale],
  isPartOf: { '@id': site.websiteId },
  about: { '@id': site.organizationId },
  primaryImageOfPage: site.defaultImage.url,
});

const publicationJsonLd = (
  site: Site,
  publication: Publication,
  path: string,
  description: string,
  image: string,
  locale: Locale,
) => ({
  '@context': 'https://schema.org',
  '@type': publication.type === 'paper' ? 'ScholarlyArticle' : 'Article',
  '@id': `${site.url(path)}#article`,
  url: site.url(path),
  mainEntityOfPage: site.url(path),
  headline: publication.title,
  description,
  image,
  datePublished: String(publication.year),
  inLanguage: INTL_LOCALE[locale],
  ...(publication.detail?.authors && {
    author: publication.detail.authors.split(/,\s*/).map((name) => ({ '@type': 'Person', name })),
  }),
  ...((publication.detail?.sourceUrl ?? publication.sourceUrl) && {
    sameAs: publication.detail?.sourceUrl ?? publication.sourceUrl,
  }),
  publisher: { '@id': site.organizationId },
  isPartOf: { '@id': site.websiteId },
});

const projectJsonLd = (
  site: Site,
  project: Project,
  path: string,
  description: string,
  locale: Locale,
) => ({
  '@context': 'https://schema.org',
  '@type': 'ResearchProject',
  '@id': `${site.url(path)}#project`,
  url: site.url(path),
  name: project.title,
  description,
  inLanguage: INTL_LOCALE[locale],
  ...(project.tags.length > 0 && { keywords: project.tags.join(', ') }),
  parentOrganization: { '@id': site.organizationId },
  isPartOf: { '@id': site.websiteId },
});

const staticPages = (site: Site, locale: Locale): Page[] =>
  Object.entries(PAGE_SEO).flatMap(([base, seo]) => {
    if (!seo) return [];
    const path = localePath(base, locale);
    const { title, description } = pickLocalized(seo, locale);
    const fullTitle = formatTitle(title, locale);
    const metaDescription = toMetaDescription(description);
    return [
      {
        path,
        base,
        locale,
        title: fullTitle,
        description: metaDescription,
        type: 'website' as const,
        image: site.defaultImage,
        jsonLd:
          base === ROUTES.HOME
            ? undefined
            : webPageJsonLd(site, path, fullTitle, metaDescription, locale),
      },
    ];
  });

const localizePublications = async (
  config: ResolvedConfig,
  publications: PublicationDto[],
): Promise<Record<(typeof SEO_LOCALES)[number], Publication[]>> => {
  if (publications.length === 0) return { uk: [], en: [] };
  const server = await createServer({
    configFile: false,
    root: config.root,
    logLevel: 'error',
    resolve: { alias: config.resolve.alias },
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  });

  try {
    const module = (await server.ssrLoadModule(PUBLICATIONS_MODULE)) as {
      toPublication: (dto: PublicationDto, locale: Locale) => Publication;
    };
    return {
      uk: publications.map((dto) => module.toPublication(dto, 'uk')),
      en: publications.map((dto) => module.toPublication(dto, 'en')),
    };
  } finally {
    await server.close();
  }
};

const findEmittedAsset = (site: Site, bundle: Rollup.OutputBundle, source: string | undefined) => {
  if (!source) return undefined;
  const relative = source.replace(/^\//, '');
  const asset = Object.values(bundle).find(
    (output): output is Rollup.OutputAsset =>
      output.type === 'asset' && output.originalFileNames.some((name) => name.endsWith(relative)),
  );
  return asset && site.url(`/${asset.fileName}`);
};

const publicationPages = (
  site: Site,
  publications: Publication[],
  bundle: Rollup.OutputBundle,
  locale: Locale,
) =>
  publications.map((publication): Page => {
    const base = buildPublicationPath(publication.slug);
    const path = localePath(base, locale);
    const title = formatTitle(publication.title, locale);
    const description = toMetaDescription(publication.detail?.lead ?? publication.excerpt);
    const coverUrl = findEmittedAsset(site, bundle, publication.image);
    const image = coverUrl ? { url: coverUrl, alt: publication.title } : site.defaultImage;

    return {
      path,
      base,
      locale,
      title,
      description,
      type: 'article',
      image,
      jsonLd: publicationJsonLd(site, publication, path, description, image.url, locale),
    };
  });

const projectPages = (site: Site, projects: Project[], locale: Locale) =>
  projects.map((source): Page => {
    const project = localizeProject(source, locale);
    const base = buildProjectPath(project.id);
    const path = localePath(base, locale);
    const description = toMetaDescription(project.description);
    const image = project.coverUrl?.startsWith('https://')
      ? { url: project.coverUrl, alt: project.coverAlt ?? project.title }
      : site.defaultImage;

    return {
      path,
      base,
      locale,
      title: formatTitle(project.title, locale),
      description,
      type: 'article',
      image,
      jsonLd: projectJsonLd(site, project, path, description, locale),
    };
  });

const renderSitemap = (site: Site, entries: SitemapEntry[], lastmod: string) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(({ path, base, priority, changefreq }) =>
      [
        `  <url><loc>${escapeText(site.url(path))}</loc>`,
        ...SEO_LOCALES.map(
          (locale) =>
            `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeText(site.url(localePath(base, locale)))}" />`,
        ),
        `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeText(site.url(base))}" />`,
        `<lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
      ].join(''),
    ),
    '</urlset>',
    '',
  ].join('\n');

const sitemapEntry = ({ path, base }: Page): SitemapEntry => {
  if (base === ROUTES.HOME) return { path, base, priority: '1.0', changefreq: 'weekly' };
  if (base.startsWith(ROUTES.PUBLICATIONS + '/'))
    return { path, base, priority: '0.6', changefreq: 'yearly' };
  if (base.startsWith(ROUTES.PROJECTS + '/'))
    return { path, base, priority: '0.6', changefreq: 'monthly' };
  if (
    [ROUTES.TERMS, ROUTES.PRIVACY, ROUTES.COOKIES, ROUTES.GUIDELINES].some(
      (legal) => legal === base,
    )
  ) {
    return { path, base, priority: '0.2', changefreq: 'yearly' };
  }
  return { path, base, priority: '0.8', changefreq: 'monthly' };
};

const toHtmlFileName = (path: string) =>
  path === ROUTES.HOME ? 'index.html' : `${path.slice(1)}.html`;

const homeHead = (site: Site): PageHead => ({
  path: ROUTES.HOME,
  base: ROUTES.HOME,
  locale: SEO_LOCALE,
  title: formatTitle(undefined, SEO_LOCALE),
  description: toMetaDescription(pickLocalized(DEFAULT_SEO, SEO_LOCALE).description),
  type: 'website',
  image: site.defaultImage,
});

export function seoPlugin(siteUrl: string): Plugin {
  const site = createSite(siteUrl);
  let config: ResolvedConfig;

  return {
    name: 'viratec-seo',
    enforce: 'post',
    configResolved(resolved) {
      config = resolved;
    },
    transformIndexHtml(html) {
      return config.command === 'serve'
        ? html.replace(HEAD_PLACEHOLDER, renderHead(site, homeHead(site)))
        : html;
    },
    async writeBundle({ dir }) {
      if (!dir) return;
      const robotsPath = join(dir, 'robots.txt');
      const robots = await readFile(robotsPath, 'utf8');
      await writeFile(
        robotsPath,
        robots.replace(/^Sitemap:.*$/m, `Sitemap: ${site.url('/sitemap.xml')}`),
      );
    },
    async generateBundle(_, bundle) {
      const template = bundle['index.html'];
      if (template?.type !== 'asset' || typeof template.source !== 'string') return;
      const html = template.source;
      if (!html.includes(HEAD_PLACEHOLDER)) {
        this.error(`index.html must contain ${HEAD_PLACEHOLDER}`);
      }

      const records = await fetchRecords(site.url, (message) => this.warn(message));
      await saveRecords(config.root, records);
      const publications = await localizePublications(config, records.publications);
      const pages = SEO_LOCALES.flatMap((locale) => [
        ...staticPages(site, locale),
        ...publicationPages(site, publications[locale], bundle, locale),
        ...projectPages(site, records.projects, locale),
      ]);

      for (const page of pages) {
        const source = html
          .replace(HEAD_PLACEHOLDER, renderHead(site, page))
          .replace(HTML_LANG, `<html lang="${page.locale}"`);
        if (page.path === ROUTES.HOME) {
          template.source = source;
        } else {
          this.emitFile({ type: 'asset', fileName: toHtmlFileName(page.path), source });
        }
      }

      const fallbackHead = {
        ...homeHead(site),
        path: undefined,
        base: undefined,
        title: SITE_NAME,
      };
      this.emitFile({
        type: 'asset',
        fileName: SPA_FALLBACK_FILE,
        source: html.replace(HEAD_PLACEHOLDER, renderHead(site, fallbackHead)),
      });

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: renderSitemap(site, pages.map(sitemapEntry), new Date().toISOString().slice(0, 10)),
      });
    },
  };
}
