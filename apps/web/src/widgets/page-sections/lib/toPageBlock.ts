import type { PageBlock } from '@/shared/config/pageBlock';
import type { CustomSectionItem } from '@/shared/config/pageLayout';
import { ROUTES } from '@/shared/config/routes';
import type { Locale } from '@/shared/i18n';

type Text = Record<Locale, string>;

const pick = (text: Text, locale: Locale) => text[locale].trim() || text.en.trim();

export const toPageBlock = (section: CustomSectionItem, locale: Locale): PageBlock => {
  const read = (text: Text) => pick(text, locale);

  switch (section.type) {
    case 'cta': {
      const label = read(section.actionLabel);
      return {
        kind: 'cta',
        title: read(section.title),
        description: read(section.description),
        action:
          section.link in ROUTES
            ? { label, to: ROUTES[section.link as keyof typeof ROUTES] }
            : { label, href: section.link },
      };
    }
    case 'stats':
      return {
        kind: 'stats',
        title: read(section.title),
        description: read(section.description),
        items: section.items.map((item) => ({ value: item.value, label: read(item.label) })),
      };
    case 'cards':
      return {
        kind: 'cards',
        eyebrow: read(section.eyebrow) || undefined,
        title: read(section.title),
        description: read(section.description) || undefined,
        items: section.items.map((item) => ({
          image: item.image?.url,
          title: read(item.title),
          description: read(item.description),
          linkLabel: item.link ? read(item.linkLabel) || undefined : undefined,
          to: item.link ? ROUTES[item.link] : undefined,
        })),
      };
    case 'media':
      return {
        kind: 'media',
        eyebrow: read(section.eyebrow) || undefined,
        title: read(section.title),
        body: read(section.body),
        image: section.image?.url,
        imageAlt: section.image ? read(section.image.alt) : '',
        imageSide: section.imageSide,
      };
    case 'text':
      return {
        kind: 'text',
        eyebrow: read(section.eyebrow) || undefined,
        title: read(section.title),
        body: read(section.body),
      };
  }
};
