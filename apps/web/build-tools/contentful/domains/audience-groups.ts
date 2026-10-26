import { z } from 'zod';
import type { Locale } from '../../../src/shared/i18n/model/types.ts';
import type { AudienceGroup, Opportunity } from '../../../src/pages/opportunities/model/types.ts';
import { AUDIENCE_SECTION_IDS } from '../../../src/pages/opportunities/model/sections.ts';
import {
  entryListField,
  field,
  localizedField,
  type ContentTypeDefinition,
} from '../content-types.ts';
import { createReader, entryLinksSchema, nonEmpty } from '../entry-reader.ts';
import { type ContentDomain } from '../domain.ts';
import { CARD_TYPE_ID, createCardReader, resolveEntry } from './blocks.ts';

const TYPE_ID = 'audienceGroup';

const AUDIENCE_GROUP_TYPE: ContentTypeDefinition = {
  id: TYPE_ID,
  name: 'Audience group',
  description: 'A role tab on the Opportunities page with its opportunity cards.',
  displayField: 'tab',
  fields: [
    field('sectionId', 'Section', 'Symbol', {
      required: true,
      validations: [{ unique: true }, { in: AUDIENCE_SECTION_IDS }],
      help: 'Anchor of the section on the page. Each section can be used once.',
    }),
    localizedField('tab', 'Tab label', 'Symbol', { required: true }),
    localizedField('title', 'Title', 'Symbol', { required: true }),
    localizedField('description', 'Description', 'Text', { required: true }),
    entryListField('opportunities', 'Opportunities', [CARD_TYPE_ID], {
      required: true,
      validations: [{ size: { min: 1, max: 12 } }],
      help: 'Cards with meta, title, description, link label and link. They are shown in this order.',
    }),
    field('order', 'Order', 'Integer', {
      required: true,
      validations: [{ range: { min: 1, max: 99 } }],
    }),
  ],
};

export const audienceGroupsDomain: ContentDomain = {
  id: TYPE_ID,
  contentTypes: [AUDIENCE_GROUP_TYPE],

  pull(context) {
    const groups = (context.collection.byType.get(TYPE_ID) ?? [])
      .map((entry) => {
        const label = `audience group ${entry.sys.id}`;
        const reader = createReader(entry, context.locales, context.diagnostics, label);
        const sectionId = reader.require('sectionId', z.enum(AUDIENCE_SECTION_IDS));
        const cards = (reader.require('opportunities', entryLinksSchema) ?? []).flatMap((link) => {
          const card = resolveEntry(link.sys.id, CARD_TYPE_ID, context, label);
          return card ? [createCardReader(card, context, `${label} card ${card.sys.id}`)] : [];
        });
        return { reader, sectionId, cards, order: reader.require('order', z.number().int()) ?? 0 };
      })
      .sort((a, b) => a.order - b.order);

    const build = (locale: Locale) =>
      groups.flatMap(({ reader, sectionId, cards }): AudienceGroup[] => {
        const tab = reader.require('tab', nonEmpty, locale);
        const title = reader.require('title', nonEmpty, locale);
        const description = reader.require('description', nonEmpty, locale);
        const opportunities = cards.flatMap((card): Opportunity[] => {
          const meta = card.text('meta', locale);
          const cardTitle = card.text('title', locale);
          const cardDescription = card.text('description', locale);
          const actionLabel = card.text('linkLabel', locale);
          if (!meta || !cardTitle || !cardDescription || !actionLabel) return [];
          return [
            { meta, title: cardTitle, description: cardDescription, actionLabel, ...card.target },
          ];
        });
        if (!sectionId || !tab || !title || !description) return [];
        return [{ id: sectionId, tab, title, description, opportunities }];
      });

    return [
      {
        file: 'src/pages/opportunities/model/audience-groups.generated.ts',
        typeImports: [
          { from: '@/shared/i18n/model/types', names: ['Localized'] },
          { from: './types', names: ['AudienceGroup'] },
        ],
        exports: [
          {
            name: 'AUDIENCE_GROUPS',
            type: 'Localized<AudienceGroup[]>',
            value: { en: build('en'), uk: build('uk') },
          },
        ],
      },
    ];
  },
};
