import { useEffect } from 'react';
import { LOCALES, useLocale } from '@/shared/i18n';
import {
  DEFAULT_SEO,
  NOINDEX_PATHS,
  OG_IMAGE,
  PAGE_SEO,
  ROBOTS_INDEX,
  ROBOTS_NOINDEX,
  SOCIAL_LOCALE,
  absoluteUrl,
  formatTitle,
  normalizePath,
  toMetaDescription,
} from '@/shared/config/seo';
import { ENV } from '@/shared/config/env';
import { hasEnglishPage, stripEnglishPrefix, toEnglishPath } from '@/shared/config/routes';

interface SeoOptions {
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

type MetaAttribute = 'name' | 'property';

const setMeta = (attribute: MetaAttribute, key: string, content: string | null) => {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (content === null) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
};

const setCanonical = (href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.append(element);
  }
  element.href = href;
};

const ALTERNATE_LOCALES = ['uk', 'en', 'x-default'] as const;

const setAlternates = (base: string | null) => {
  for (const hreflang of ALTERNATE_LOCALES) {
    const selector = `link[rel="alternate"][hreflang="${hreflang}"]`;
    let element = document.head.querySelector<HTMLLinkElement>(selector);
    if (base === null) {
      element?.remove();
      continue;
    }
    if (!element) {
      element = document.createElement('link');
      element.rel = 'alternate';
      element.hreflang = hreflang;
      document.head.append(element);
    }
    element.href = absoluteUrl(hreflang === 'en' ? toEnglishPath(base) : base, ENV.SITE_URL);
  }
};

export function useSeo(
  title?: string,
  { description, image, type = 'website', noindex = false }: SeoOptions = {},
) {
  const locale = useLocale();

  useEffect(() => {
    const path = normalizePath(window.location.pathname);
    const base = stripEnglishPrefix(path);
    const fullTitle = formatTitle(PAGE_SEO[base]?.[locale].title ?? title, locale);
    const pageDescription = toMetaDescription(
      description ?? PAGE_SEO[base]?.[locale].description ?? DEFAULT_SEO[locale].description,
    );
    const url = absoluteUrl(path, ENV.SITE_URL);
    const imageUrl = absoluteUrl(image ?? OG_IMAGE.path, ENV.SITE_URL);
    const isDefaultImage = !image;
    const imageAlt = isDefaultImage ? OG_IMAGE.alt : fullTitle;

    document.title = fullTitle;
    setCanonical(url);
    setAlternates(!noindex && hasEnglishPage(base) ? base : null);
    setMeta('name', 'description', pageDescription);
    setMeta(
      'name',
      'robots',
      noindex || NOINDEX_PATHS.includes(path) ? ROBOTS_NOINDEX : ROBOTS_INDEX,
    );
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', pageDescription);
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:image:type', isDefaultImage ? OG_IMAGE.type : null);
    setMeta('property', 'og:image:width', isDefaultImage ? String(OG_IMAGE.width) : null);
    setMeta('property', 'og:image:height', isDefaultImage ? String(OG_IMAGE.height) : null);
    setMeta('property', 'og:image:alt', imageAlt);
    setMeta('property', 'og:locale', SOCIAL_LOCALE[locale]);
    setMeta(
      'property',
      'og:locale:alternate',
      SOCIAL_LOCALE[LOCALES.find((item) => item !== locale) ?? locale],
    );
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', pageDescription);
    setMeta('name', 'twitter:image', imageUrl);
    setMeta('name', 'twitter:image:alt', imageAlt);
  }, [title, description, image, type, noindex, locale]);
}
