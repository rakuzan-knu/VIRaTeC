import { z } from 'zod';
import {
  LAYOUT_PAGES,
  pageSectionsSchema,
  type PageLayouts,
} from '../../../src/shared/config/pageLayout.ts';
import { field, type ContentTypeDefinition } from '../content-types.ts';
import { createReader } from '../entry-reader.ts';
import type { ContentDomain } from '../domain.ts';

const TYPE_ID = 'pageLayout';

const PAGE_LAYOUT_TYPE: ContentTypeDefinition = {
  id: TYPE_ID,
  name: 'Page layout',
  description:
    'Order of the sections of a page, hidden built-in sections and added sections. Edit it in the site editor.',
  displayField: 'internalName',
  fields: [
    field('internalName', 'Internal name', 'Symbol', {
      required: true,
      help: 'Only shown in Contentful.',
    }),
    field('page', 'Page', 'Symbol', {
      required: true,
      validations: [{ unique: true }, { in: LAYOUT_PAGES }],
    }),
    field('sections', 'Sections', 'Object', {
      required: true,
      help: 'Managed by the site editor. Editing the JSON by hand can hide sections.',
    }),
  ],
};

export const pageLayoutsDomain: ContentDomain = {
  id: TYPE_ID,
  contentTypes: [PAGE_LAYOUT_TYPE],

  pull(context) {
    const layouts: PageLayouts = {};
    for (const entry of context.collection.byType.get(TYPE_ID) ?? []) {
      const label = `page layout ${entry.sys.id}`;
      const reader = createReader(entry, context.locales, context.diagnostics, label);
      const page = reader.require('page', z.enum(LAYOUT_PAGES as [string, ...string[]]));
      const sections = reader.require('sections', pageSectionsSchema);
      if (!page || !sections) continue;
      if (page in layouts) {
        context.diagnostics.report(`${label}: another layout already exists for ${page}`);
        continue;
      }
      layouts[page as keyof PageLayouts] = { entryId: entry.sys.id, sections };
    }

    return [
      {
        file: 'src/shared/config/pageLayouts.generated.ts',
        typeImports: [{ from: './pageLayout', names: ['PageLayouts'] }],
        exports: [{ name: 'PAGE_LAYOUTS', type: 'PageLayouts', value: layouts }],
      },
    ];
  },
};
