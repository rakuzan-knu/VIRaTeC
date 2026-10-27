import type { PageBlock } from '@/shared/config/pageBlock';
import {
  builtinLabel,
  type CustomSectionItem,
  type CustomSectionType,
  type LayoutPage,
  type PageSectionItem,
} from '@/shared/config/pageLayout';
import type { Locale } from '@/shared/i18n';
import type { SiteEditorMessages } from './messages';

export const LAYOUT_TYPE_ID = 'pageLayout';

const emptyText = () => ({ en: '', uk: '' });

const sectionId = () => `s-${Math.random().toString(36).slice(2, 10)}`;

export const newSection = (type: CustomSectionType): CustomSectionItem => {
  const id = sectionId();
  const title = { en: 'New section', uk: 'Нова секція' };
  if (type === 'cards') {
    return {
      id,
      type,
      eyebrow: emptyText(),
      title,
      description: emptyText(),
      items: [
        {
          title: { en: 'Card title', uk: 'Назва картки' },
          description: emptyText(),
          linkLabel: emptyText(),
          link: null,
          image: null,
        },
      ],
    };
  }
  if (type === 'stats') {
    return {
      id,
      type,
      title,
      description: emptyText(),
      items: [{ value: '10+', label: { en: 'Caption', uk: 'Підпис' } }],
    };
  }
  if (type === 'cta') {
    return {
      id,
      type,
      title,
      description: emptyText(),
      actionLabel: { en: 'Contact us', uk: 'Звʼязатися' },
      link: 'CONTACT',
    };
  }
  if (type === 'media') {
    return {
      id,
      type,
      eyebrow: emptyText(),
      title,
      body: emptyText(),
      image: null,
      imageSide: 'left',
    };
  }
  return { id, type, eyebrow: emptyText(), title, body: emptyText() };
};

export const sectionLabel = (
  section: PageSectionItem,
  page: LayoutPage,
  locale: Locale,
  t: SiteEditorMessages,
  blocks: Readonly<Record<string, PageBlock>>,
) => {
  if (section.type === 'builtin') return builtinLabel(page, section.key, locale);
  if (section.type === 'block') {
    return `${t.structure.block}: ${blocks[section.blockId]?.title ?? t.structure.missingBlock}`;
  }
  const title = section.title[locale].trim() || section.title.en.trim();
  return `${t.structure.types[section.type]}: ${title || t.structure.untitled}`;
};

export const moveItem = <T>(items: readonly T[], from: number, to: number): T[] => {
  if (to < 0 || to >= items.length) return [...items];
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
};
