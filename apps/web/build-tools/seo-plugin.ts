import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer, type Plugin, type ResolvedConfig, type Rollup } from 'vite';
import type { Localized } from '../src/shared/i18n/model/types';
import type { Publication } from '../src/entities/publication/model/types';
import { ROUTES, buildPublicationPath } from '../src/shared/config/routes';
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

const HEAD_PLACEHOLDER = '<!--seo-head-->';
const SEO_LOCALE = 'uk';
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
  title: string;
  description: string;
  type: 'website' | 'article';
  image: HeadImage;
  jsonLd?: Record<string, unknown>;
}

interface SitemapEntry {
  path: string;
  priority: string;
  changefreq: 'weekly' | 'monthly' | 'yearly';
}

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeText = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const meta = (attribute: 'name' | 'property', key: string, content: string) =>
  `<meta ${attribute}="${key}" content="${escapeAttribute(content)}" />`;

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

const renderHead = (site: Site, { path, title, description, type, image, jsonLd }: PageHead) => {
  const url = path === undefined ? undefined : site.url(path);
  const tags = [
    `<title>${escapeText(title)}</title>`,
    meta('name', 'description', description),
    meta('name', 'robots', ROBOTS_INDEX),
    url && `<link rel="canonical" href="${escapeAttribute(url)}" />`,
    meta('property', 'og:type', type),
    url && meta('property', 'og:url', url),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:image', image.url),
    image.type && meta('property', 'og:image:type', image.type),
    image.width && meta('property', 'og:image:width', String(image.width)),
    image.height && meta('property', 'og:image:height', String(image.height)),
    meta('property', 'og:image:alt', image.alt),
    meta('property', 'og:locale', SOCIAL_LOCALE[SEO_LOCALE]),
    meta('property', 'og:locale:alternate', SOCIAL_LOCALE.en),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:description', description),
    meta('name', 'twitter:image', image.url),
    meta('name', 'twitter:image:alt', image.alt),
    jsonLd &&
      `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ];

  return tags.filter(Boolean).join('\n    ');
};

const webPageJsonLd = (site: Site, path: string, title: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${site.url(path)}#webpage`,
  url: site.url(path),
  name: title,
  description,
  inLanguage: 'uk-UA',
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
  inLanguage: 'uk-UA',
  ...(publication.detail?.authors && {
    author: publication.detail.authors.split(/,\s*/).map((name) => ({ '@type': 'Person', name })),
  }),
  ...((publication.detail?.sourceUrl ?? publication.sourceUrl) && {
    sameAs: publication.detail?.sourceUrl ?? publication.sourceUrl,
  }),
  publisher: { '@id': site.organizationId },
  isPartOf: { '@id': site.websiteId },
});

const staticPages = (site: Site): (PageHead & { path: string })[] =>
  Object.entries(PAGE_SEO).flatMap(([path, seo]) => {
    if (!seo) return [];
    const { title, description } = seo[SEO_LOCALE];
    const fullTitle = formatTitle(title);
    const metaDescription = toMetaDescription(description);
    return [
      {
        path,
        title: fullTitle,
        description: metaDescription,
        type: 'website' as const,
        image: site.defaultImage,
        jsonLd:
          path === ROUTES.HOME ? undefined : webPageJsonLd(site, path, fullTitle, metaDescription),
      },
    ];
  });

const loadPublications = async (config: ResolvedConfig) => {
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
      PUBLICATIONS: Localized<Publication[]>;
    };
    return module.PUBLICATIONS[SEO_LOCALE];
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

const publicationPages = (site: Site, publications: Publication[], bundle: Rollup.OutputBundle) =>
  publications.map((publication): PageHead & { path: string } => {
    const path = buildPublicationPath(publication.slug);
    const title = formatTitle(publication.title);
    const description = toMetaDescription(publication.detail?.lead ?? publication.excerpt);
    const coverUrl = findEmittedAsset(site, bundle, publication.image);
    const image = coverUrl ? { url: coverUrl, alt: publication.title } : site.defaultImage;

    return {
      path,
      title,
      description,
      type: 'article',
      image,
      jsonLd: publicationJsonLd(site, publication, path, description, image.url),
    };
  });

const renderSitemap = (site: Site, entries: SitemapEntry[], lastmod: string) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      ({ path, priority, changefreq }) =>
        `  <url><loc>${escapeText(site.url(path))}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');

const sitemapEntry = (path: string): SitemapEntry => {
  if (path === ROUTES.HOME) return { path, priority: '1.0', changefreq: 'weekly' };
  if (path.startsWith(ROUTES.PUBLICATIONS + '/'))
    return { path, priority: '0.6', changefreq: 'yearly' };
  if (
    [ROUTES.TERMS, ROUTES.PRIVACY, ROUTES.COOKIES, ROUTES.GUIDELINES].some(
      (legal) => legal === path,
    )
  ) {
    return { path, priority: '0.2', changefreq: 'yearly' };
  }
  return { path, priority: '0.8', changefreq: 'monthly' };
};

const toHtmlFileName = (path: string) =>
  path === ROUTES.HOME ? 'index.html' : `${path.slice(1)}.html`;

const homeHead = (site: Site): PageHead => ({
  path: ROUTES.HOME,
  title: formatTitle(),
  description: toMetaDescription(DEFAULT_SEO[SEO_LOCALE].description),
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

      const pages = [
        ...staticPages(site),
        ...publicationPages(site, await loadPublications(config), bundle),
      ];

      for (const page of pages) {
        const source = html.replace(HEAD_PLACEHOLDER, renderHead(site, page));
        if (page.path === ROUTES.HOME) {
          template.source = source;
        } else {
          this.emitFile({ type: 'asset', fileName: toHtmlFileName(page.path), source });
        }
      }

      const fallbackHead = { ...homeHead(site), path: undefined, title: SITE_NAME };
      this.emitFile({
        type: 'asset',
        fileName: SPA_FALLBACK_FILE,
        source: html.replace(HEAD_PLACEHOLDER, renderHead(site, fallbackHead)),
      });

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: renderSitemap(
          site,
          pages.map((page) => sitemapEntry(page.path)),
          new Date().toISOString().slice(0, 10),
        ),
      });
    },
  };
}
