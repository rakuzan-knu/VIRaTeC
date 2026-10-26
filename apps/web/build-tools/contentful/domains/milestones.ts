import { z } from 'zod';
import type { Locale } from '../../../src/shared/i18n/model/types.ts';
import type { Milestone } from '../../../src/pages/viratec/model/types.ts';
import { field, localizedField, type ContentTypeDefinition } from '../content-types.ts';
import { createReader, nonEmpty } from '../entry-reader.ts';
import { type ContentDomain } from '../domain.ts';

const TYPE_ID = 'milestone';

const MILESTONE_TYPE: ContentTypeDefinition = {
  id: TYPE_ID,
  name: 'Milestone',
  description: 'A step of the "Our journey" timeline on the VIRaTeC page.',
  displayField: 'title',
  fields: [
    localizedField('dateLabel', 'Date', 'Symbol', {
      required: true,
      help: 'Shown as written, e.g. "April 2025" or "Spring 2026".',
    }),
    localizedField('title', 'Title', 'Symbol', { required: true }),
    localizedField('description', 'Description', 'Text', { required: true }),
    field('isUpcoming', 'Upcoming', 'Boolean', {
      help: 'Marks a planned event with the upcoming dot. Switch it off once it has happened.',
    }),
    field('order', 'Order', 'Integer', {
      required: true,
      validations: [{ range: { min: 1, max: 999 } }],
      help: 'Position on the timeline, from oldest to newest.',
    }),
  ],
};

export const milestonesDomain: ContentDomain = {
  id: TYPE_ID,
  contentTypes: [MILESTONE_TYPE],

  pull(context) {
    const milestones = (context.collection.byType.get(TYPE_ID) ?? [])
      .map((entry) => {
        const reader = createReader(
          entry,
          context.locales,
          context.diagnostics,
          `milestone ${entry.sys.id}`,
        );
        return {
          reader,
          order: reader.require('order', z.number().int()) ?? 0,
          isUpcoming: reader.read('isUpcoming', z.boolean()) ?? false,
        };
      })
      .sort((a, b) => a.order - b.order);

    const build = (locale: Locale) =>
      milestones.flatMap(({ reader, isUpcoming }): Milestone[] => {
        const date = reader.require('dateLabel', nonEmpty, locale);
        const title = reader.require('title', nonEmpty, locale);
        const description = reader.require('description', nonEmpty, locale);
        if (!date || !title || !description) return [];
        return [{ date, title, description, ...(isUpcoming && { isUpcoming }) }];
      });

    return [
      {
        file: 'src/pages/viratec/model/milestones.generated.ts',
        typeImports: [
          { from: '@/shared/i18n/model/types', names: ['Localized'] },
          { from: './types', names: ['Milestone'] },
        ],
        exports: [
          {
            name: 'MILESTONES',
            type: 'Localized<Milestone[]>',
            value: { en: build('en'), uk: build('uk') },
          },
        ],
      },
    ];
  },
};
