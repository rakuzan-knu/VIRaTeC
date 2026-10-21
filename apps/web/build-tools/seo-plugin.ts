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
  SITE_URL,
  SOCIAL_LOCALE,
  absoluteUrl,
  formatTitle,
  toMetaDescription,
} from '../src/shared/config/seo';

const HEAD_PLACEHOLDER = '<!--seo-head-->';
const SEO_LOCALE = 'uk';
const SPA_FALLBACK_FILE = 'spa.html';
const PUBLICATIONS_MODULE = '/src/entities/publication/model/data.ts';
const WEBSITE_ID = `${SITE_URL}/#website`;
const ORGANIZATION_ID = `${SITE_URL}/#organization`;

interface HeadImage {
  url: string;
  alt: string;
  type?: string;
  width?: number;
  height?: number;
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

const DEFAULT_IMAGE: HeadImage = {
  url: absoluteUrl(OG_IMAGE.path),
  alt: OG_IMAGE.alt,
  type: OG_IMAGE.type,
  width: OG_IMAGE.width,
  height: OG_IMAGE.height,
};

const renderHead = ({ path, title, description, type, image, jsonLd }: PageHead) => {
  const url = path === undefined ? undefined : absoluteUrl(path);
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

const webPageJsonLd = (path: string, title: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${absoluteUrl(path)}#webpage`,
  url: absoluteUrl(path),
  name: title,
  description,
  inLanguage: 'uk-UA',
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ORGANIZATION_ID },
  primaryImageOfPage: DEFAULT_IMAGE.url,
});

const publicationJsonLd = (
  publication: Publication,
  path: string,
  description: string,
  image: string,
) => ({
  '@context': 'https://schema.org',
  '@type': publication.type === 'paper' ? 'ScholarlyArticle' : 'Article',
  '@id': `${absoluteUrl(path)}#article`,
  url: absoluteUrl(path),
  mainEntityOfPage: absoluteUrl(path),
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
  publisher: { '@id': ORGANIZATION_ID },
  isPartOf: { '@id': WEBSITE_ID },
});

const staticPages = (): (PageHead & { path: string })[] =>
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
        image: DEFAULT_IMAGE,
        jsonLd: path === ROUTES.HOME ? undefined : webPageJsonLd(path, fullTitle, metaDescription),
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

const findEmittedAsset = (bundle: Rollup.OutputBundle, source: string | undefined) => {
  if (!source) return undefined;
  const relative = source.replace(/^\//, '');
  const asset = Object.values(bundle).find(
    (output): output is Rollup.OutputAsset =>
      output.type === 'asset' && output.originalFileNames.some((name) => name.endsWith(relative)),
  );
  return asset && absoluteUrl(`/${asset.fileName}`);
};

const publicationPages = (publications: Publication[], bundle: Rollup.OutputBundle) =>
  publications.map((publication): PageHead & { path: string } => {
    const path = buildPublicationPath(publication.slug);
    const title = formatTitle(publication.title);
    const description = toMetaDescription(publication.detail?.lead ?? publication.excerpt);
    const coverUrl = findEmittedAsset(bundle, publication.image);
    const image = coverUrl ? { url: coverUrl, alt: publication.title } : DEFAULT_IMAGE;

    return {
      path,
      title,
      description,
      type: 'article',
      image,
      jsonLd: publicationJsonLd(publication, path, description, image.url),
    };
  });

const renderSitemap = (entries: SitemapEntry[], lastmod: string) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      ({ path, priority, changefreq }) =>
        `  <url><loc>${escapeText(absoluteUrl(path))}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
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

const homeHead = (): PageHead => ({
  path: ROUTES.HOME,
  title: formatTitle(),
  description: toMetaDescription(DEFAULT_SEO[SEO_LOCALE].description),
  type: 'website',
  image: DEFAULT_IMAGE,
});

export function seoPlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'viratec-seo',
    enforce: 'post',
    configResolved(resolved) {
      config = resolved;
    },
    transformIndexHtml(html) {
      return config.command === 'serve'
        ? html.replace(HEAD_PLACEHOLDER, renderHead(homeHead()))
        : html;
    },
    async generateBundle(_, bundle) {
      const template = bundle['index.html'];
      if (template?.type !== 'asset' || typeof template.source !== 'string') return;
      const html = template.source;
      if (!html.includes(HEAD_PLACEHOLDER)) {
        this.error(`index.html must contain ${HEAD_PLACEHOLDER}`);
      }

      const pages = [...staticPages(), ...publicationPages(await loadPublications(config), bundle)];

      for (const page of pages) {
        const source = html.replace(HEAD_PLACEHOLDER, renderHead(page));
        if (page.path === ROUTES.HOME) {
          template.source = source;
        } else {
          this.emitFile({ type: 'asset', fileName: toHtmlFileName(page.path), source });
        }
      }

      const fallbackHead = { ...homeHead(), path: undefined, title: SITE_NAME };
      this.emitFile({
        type: 'asset',
        fileName: SPA_FALLBACK_FILE,
        source: html.replace(HEAD_PLACEHOLDER, renderHead(fallbackHead)),
      });

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: renderSitemap(
          pages.map((page) => sitemapEntry(page.path)),
          new Date().toISOString().slice(0, 10),
        ),
      });
    },
  };
}
