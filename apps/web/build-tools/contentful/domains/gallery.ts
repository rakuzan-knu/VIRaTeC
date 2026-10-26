import { z } from 'zod';
import type { Locale } from '../../../src/shared/i18n/model/types.ts';
import type { MomentItem } from '../../../src/pages/viratec/model/types.ts';
import { field, imageField, localizedField, type ContentTypeDefinition } from '../content-types.ts';
import { assetLinkSchema, createReader, nonEmpty } from '../entry-reader.ts';
import { type ContentDomain } from '../domain.ts';

const TYPE_ID = 'galleryItem';

const GALLERY_ITEM_TYPE: ContentTypeDefinition = {
  id: TYPE_ID,
  name: 'Gallery item',
  description: 'A photo of the "Moments" gallery on the VIRaTeC page.',
  displayField: 'caption',
  fields: [
    localizedField('caption', 'Caption', 'Symbol', {
      required: true,
      help: 'Shown over the photo and used as its alt text.',
    }),
    imageField('image', 'Photo', {
      required: true,
      help: 'Landscape photo, at least 1600 px wide. The first one is shown large.',
    }),
    field('order', 'Order', 'Integer', {
      required: true,
      validations: [{ range: { min: 1, max: 999 } }],
    }),
  ],
};

export const galleryDomain: ContentDomain = {
  id: TYPE_ID,
  contentTypes: [GALLERY_ITEM_TYPE],

  pull(context) {
    const items = (context.collection.byType.get(TYPE_ID) ?? [])
      .map((entry) => {
        const reader = createReader(
          entry,
          context.locales,
          context.diagnostics,
          `gallery item ${entry.sys.id}`,
        );
        return {
          reader,
          order: reader.require('order', z.number().int()) ?? 0,
          imageId: reader.require('image', assetLinkSchema)?.sys.id,
        };
      })
      .sort((a, b) => a.order - b.order);

    const build = (locale: Locale) =>
      items.flatMap(({ reader, imageId }): MomentItem[] => {
        const caption = reader.require('caption', nonEmpty, locale);
        if (!caption || !imageId) return [];
        return [{ image: context.assets.reference(imageId), caption }];
      });

    return [
      {
        file: 'src/pages/viratec/model/moments.generated.ts',
        typeImports: [
          { from: '@/shared/i18n/model/types', names: ['Localized'] },
          { from: './types', names: ['MomentItem'] },
        ],
        exports: [
          {
            name: 'MOMENTS',
            type: 'Localized<MomentItem[]>',
            value: { en: build('en'), uk: build('uk') },
          },
        ],
      },
    ];
  },
};
