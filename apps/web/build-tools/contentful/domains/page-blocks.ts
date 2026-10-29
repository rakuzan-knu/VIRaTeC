import { z } from 'zod';
import type { Locale } from '../../../src/shared/i18n/model/types.ts';
import {
  IMAGE_SIDES,
  PAGE_BLOCK_KINDS,
  PAGE_BLOCK_TYPE_ID,
  type BlockCard,
  type BlockStat,
  type PageBlock,
  type PageBlocks,
} from '../../../src/shared/config/pageBlock.ts';
import {
  entryField,
  entryListField,
  field,
  imageField,
  localizedField,
  type ContentTypeDefinition,
} from '../content-types.ts';
import {
  assetLinkSchema,
  createReader,
  entryLinkSchema,
  entryLinksSchema,
  nonEmpty,
  type EntryReader,
  type RawEntry,
  entryTarget,
} from '../entry-reader.ts';
import type { ContentDomain, PullContext } from '../domain.ts';
import {
  CARD_TYPE_ID,
  LINK_TYPE_ID,
  STAT_TYPE_ID,
  createCardReader,
  readLinkTarget,
  resolveEntry,
} from './blocks.ts';

const MAX_STATS = 6;

const PAGE_BLOCK_TYPE: ContentTypeDefinition = {
  id: PAGE_BLOCK_TYPE_ID,
  name: 'Page block',
  description:
    'A section built from the site UI kit. Add it to a page in the site editor. The kind decides which fields are used.',
  displayField: 'internalName',
  fields: [
    field('internalName', 'Internal name', 'Symbol', {
      required: true,
      help: 'Only shown in Contentful.',
    }),
    field('kind', 'Kind', 'Symbol', {
      required: true,
      validations: [{ in: PAGE_BLOCK_KINDS }],
      help: 'text, media (image and text), cards, stats (numbers) or cta (call to action).',
    }),
    localizedField('eyebrow', 'Eyebrow', 'Symbol', {
      help: 'Small line above the title. Text, media and cards.',
    }),
    localizedField('title', 'Title', 'Symbol', { required: true }),
    localizedField('description', 'Description', 'Text', { help: 'Cards, stats and cta.' }),
    localizedField('body', 'Body', 'Text', {
      help: 'Text and media. Separate paragraphs with an empty line.',
    }),
    imageField('image', 'Image', { help: 'Media only.' }),
    localizedField('imageAlt', 'Image description', 'Symbol', {
      help: 'Media only. Describes the image for screen readers.',
    }),
    field('imageSide', 'Image side', 'Symbol', {
      validations: [{ in: IMAGE_SIDES }],
      help: 'Media only. Left when empty.',
    }),
    entryListField('items', 'Items', [CARD_TYPE_ID, STAT_TYPE_ID], {
      validations: [{ size: { max: 12 } }],
      help: 'Cards for the cards kind, stats for the stats kind.',
    }),
    localizedField('actionLabel', 'Button label', 'Symbol', { help: 'Cta only.' }),
    entryField('link', 'Button link', [LINK_TYPE_ID], { help: 'Cta only.' }),
  ],
};

const linkedEntries = (
  reader: EntryReader,
  contentTypeId: string,
  context: PullContext,
  label: string,
): RawEntry[] =>
  (reader.read('items', entryLinksSchema) ?? []).flatMap((link) => {
    const entry = resolveEntry(link.sys.id, contentTypeId, context, label);
    return entry ? [entry] : [];
  });

const createBlockBuilder = (entry: RawEntry, context: PullContext) => {
  const label = `page block ${entry.sys.id}`;
  const reader = createReader(entry, context.locales, context.diagnostics, label);
  const kind = reader.require('kind', z.enum(PAGE_BLOCK_KINDS));
  const optional = (id: string, locale: Locale) => reader.read(id, nonEmpty, locale);
  const required = (id: string, locale: Locale) => reader.require(id, nonEmpty, locale);

  if (kind === 'cards') {
    const cards = linkedEntries(reader, CARD_TYPE_ID, context, label).map((card) =>
      createCardReader(card, context, `${label} card ${card.sys.id}`),
    );
    for (const card of cards) {
      if (card.target?.href) {
        context.diagnostics.warn(`${label}: cards link only to site pages, the URL is ignored`);
      }
    }
    return (locale: Locale): PageBlock | undefined => {
      const title = required('title', locale);
      const description = optional('description', locale);
      const eyebrow = optional('eyebrow', locale);
      const items = cards.flatMap((card): BlockCard[] => {
        const cardTitle = card.text('title', locale);
        if (!cardTitle) return [];
        const meta = card.reader.read('meta', nonEmpty, locale);
        const linkLabel = card.reader.read('linkLabel', nonEmpty, locale);
        const imageId = card.reader.read('image', assetLinkSchema)?.sys.id;
        const imageAlt = card.reader.read('imageAlt', nonEmpty, locale);
        return [
          {
            title: cardTitle,
            description: card.reader.read('description', nonEmpty, locale) ?? '',
            ...(meta && { meta }),
            ...(card.target?.to && { to: card.target.to, ...(linkLabel && { linkLabel }) }),
            ...(imageId && { image: context.assets.reference(imageId) }),
            ...(imageAlt && { imageAlt }),
          },
        ];
      });
      if (!title) return undefined;
      return {
        kind,
        title,
        items,
        ...(eyebrow && { eyebrow }),
        ...(description && { description }),
      };
    };
  }

  if (kind === 'stats') {
    const stats = linkedEntries(reader, STAT_TYPE_ID, context, label).map((stat) =>
      createReader(stat, context.locales, context.diagnostics, `${label} stat ${stat.sys.id}`),
    );
    if (stats.length > MAX_STATS) {
      context.diagnostics.report(`${label}: at most ${MAX_STATS} stats fit in one block`, {
        kind: 'tooManyStats',
        target: entryTarget(entry, 'items'),
        count: MAX_STATS,
      });
    }
    return (locale: Locale): PageBlock | undefined => {
      const title = required('title', locale);
      const items = stats.flatMap((stat): BlockStat[] => {
        const value = stat.require('value', nonEmpty);
        const statLabel = stat.require('label', nonEmpty, locale);
        return value && statLabel ? [{ value, label: statLabel }] : [];
      });
      if (!title) return undefined;
      return { kind, title, description: optional('description', locale) ?? '', items };
    };
  }

  if (kind === 'cta') {
    const linkId = reader.require('link', entryLinkSchema)?.sys.id;
    const target = linkId ? readLinkTarget(linkId, context, label) : undefined;
    return (locale: Locale): PageBlock | undefined => {
      const title = required('title', locale);
      const actionLabel = required('actionLabel', locale);
      if (!title || !actionLabel || !target) return undefined;
      return {
        kind,
        title,
        description: optional('description', locale) ?? '',
        action: { label: actionLabel, ...target },
      };
    };
  }

  if (kind === 'media') {
    const imageId = reader.read('image', assetLinkSchema)?.sys.id;
    const imageSide = reader.read('imageSide', z.enum(IMAGE_SIDES)) ?? 'left';
    return (locale: Locale): PageBlock | undefined => {
      const title = required('title', locale);
      const body = required('body', locale);
      const eyebrow = optional('eyebrow', locale);
      const imageAlt = imageId ? required('imageAlt', locale) : '';
      if (!title || !body || imageAlt === undefined) return undefined;
      return {
        kind,
        title,
        body,
        imageAlt,
        imageSide,
        ...(eyebrow && { eyebrow }),
        ...(imageId && { image: context.assets.reference(imageId) }),
      };
    };
  }

  if (kind === 'text') {
    return (locale: Locale): PageBlock | undefined => {
      const title = required('title', locale);
      const body = required('body', locale);
      const eyebrow = optional('eyebrow', locale);
      if (!title || !body) return undefined;
      return { kind, title, body, ...(eyebrow && { eyebrow }) };
    };
  }

  return () => undefined;
};

export const pageBlocksDomain: ContentDomain = {
  id: PAGE_BLOCK_TYPE_ID,
  contentTypes: [PAGE_BLOCK_TYPE],

  pull(context) {
    const builders = (context.collection.byType.get(PAGE_BLOCK_TYPE_ID) ?? []).map(
      (entry) => [entry.sys.id, createBlockBuilder(entry, context)] as const,
    );

    const build = (locale: Locale) =>
      Object.fromEntries(
        builders.flatMap(([id, builder]) => {
          const block = builder(locale);
          return block ? [[id, block]] : [];
        }),
      );

    const blocks: PageBlocks = { en: build('en'), uk: build('uk') };

    return [
      {
        file: 'src/shared/config/pageBlocks.generated.ts',
        typeImports: [{ from: './pageBlock', names: ['PageBlocks'] }],
        exports: [{ name: 'PAGE_BLOCKS', type: 'PageBlocks', value: blocks }],
      },
    ];
  },
};
