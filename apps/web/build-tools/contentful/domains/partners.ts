import { z } from 'zod';
import type { Locale, Localized } from '../../../src/shared/i18n/model/types.ts';
import type { HomePartner, NetworkPartner } from '../../../src/entities/partner/model/types.ts';
import { field, imageField, localizedField, type ContentTypeDefinition } from '../content-types.ts';
import { assetLinkSchema, createReader, nonEmpty, type RawEntry } from '../entry-reader.ts';
import type { ContentDomain, PullContext } from '../domain.ts';

const TYPE_ID = 'partner';
const LOGO_HEIGHT_RANGE = { min: 16, max: 80 };

const PARTNER_TYPE: ContentTypeDefinition = {
  id: TYPE_ID,
  name: 'Partner',
  description:
    'Partner university. Shown on the Global Collaboration page and in the home page hero strip.',
  displayField: 'name',
  fields: [
    localizedField('name', 'Name', 'Symbol', {
      required: true,
      help: 'Full name. Also used as the logo alt text.',
    }),
    field('code', 'Country code', 'Symbol', {
      validations: [{ regexp: { pattern: '^[A-Z]{2}$' }, message: 'Two capital letters, e.g. UK' }],
      help: 'Two-letter country code on the Global Collaboration card, e.g. UK, US, UA.',
    }),
    localizedField('location', 'Location', 'Symbol', {
      help: 'Shown under the name on the Global Collaboration card, e.g. USA · Perimeter College.',
    }),
    imageField('logo', 'Logo', {
      help: 'Transparent PNG, WebP or SVG. The home strip shows it in white.',
    }),
    field('networkOrder', 'Order on Global Collaboration page', 'Integer', {
      validations: [{ range: { min: 1, max: 999 } }],
      help: 'Position in the partner network grid. Leave empty to hide the partner there.',
    }),
    field('homeOrder', 'Order on home page', 'Integer', {
      validations: [{ range: { min: 1, max: 999 } }],
      help: 'Position in the home hero strip. Leave empty to hide the partner there.',
    }),
    field('homeLogoHeight', 'Home logo height, phone (px)', 'Integer', {
      validations: [{ range: LOGO_HEIGHT_RANGE }],
      help: 'Required when the partner is on the home page. The width follows the logo proportions.',
    }),
    field('homeLogoHeightLg', 'Home logo height, desktop (px)', 'Integer', {
      validations: [{ range: LOGO_HEIGHT_RANGE }],
      help: 'Required when the partner is on the home page.',
    }),
    localizedField('homeCaption', 'Home caption', 'Array', {
      items: { type: 'Symbol', validations: [] },
      validations: [{ size: { min: 2, max: 2 } }],
      help: 'Optional name in two lines next to the logo on the home page. When set, the logo alt text is empty.',
    }),
  ],
};

const captionSchema = z.tuple([nonEmpty, nonEmpty]);

const readPartner = (entry: RawEntry, context: PullContext) => {
  const name = entry.fields.name?.[context.locales.en];
  const reader = createReader(
    entry,
    context.locales,
    context.diagnostics,
    `partner ${typeof name === 'string' ? name : entry.sys.id}`,
  );
  const logoId = reader.read('logo', assetLinkSchema)?.sys.id;
  return {
    reader,
    logo: () => logoId && context.assets.reference(logoId),
    networkOrder: reader.read('networkOrder', z.number().int()),
    homeOrder: reader.read('homeOrder', z.number().int()),
  };
};

const byOrder =
  (key: 'networkOrder' | 'homeOrder') =>
  (a: ReturnType<typeof readPartner>, b: ReturnType<typeof readPartner>) =>
    (a[key] ?? 0) - (b[key] ?? 0);

export const partnersDomain: ContentDomain = {
  id: TYPE_ID,
  contentTypes: [PARTNER_TYPE],

  pull(context) {
    const partners = (context.collection.byType.get(TYPE_ID) ?? []).map((entry) =>
      readPartner(entry, context),
    );

    const localized = <T>(build: (locale: Locale) => T[]): Localized<T[]> => ({
      en: build('en'),
      uk: build('uk'),
    });

    const homePartners = localized((locale) =>
      partners
        .filter((partner) => partner.homeOrder !== undefined)
        .sort(byOrder('homeOrder'))
        .flatMap(({ reader, ...partner }): HomePartner[] => {
          const logo = partner.logo();
          const name = reader.require('name', nonEmpty, locale);
          const logoHeight = reader.require('homeLogoHeight', z.number().int());
          const logoHeightLg = reader.require('homeLogoHeightLg', z.number().int());
          const caption = reader.read('homeCaption', captionSchema, locale);
          if (!logo) reader.require('logo', assetLinkSchema);
          if (!name || !logo || logoHeight === undefined || logoHeightLg === undefined) return [];
          return [{ name, logo, logoHeight, logoHeightLg, ...(caption && { caption }) }];
        }),
    );

    const networkPartners = localized((locale) =>
      partners
        .filter((partner) => partner.networkOrder !== undefined)
        .sort(byOrder('networkOrder'))
        .flatMap(({ reader, ...partner }): NetworkPartner[] => {
          const logo = partner.logo();
          const name = reader.require('name', nonEmpty, locale);
          const code = reader.require('code', nonEmpty);
          const location = reader.require('location', nonEmpty, locale);
          if (!name || !code || !location) return [];
          return [{ code, name, location, ...(logo && { logo }) }];
        }),
    );

    return [
      {
        file: 'src/entities/partner/model/data.generated.ts',
        typeImports: [
          { from: '@/shared/i18n/model/types', names: ['Localized'] },
          { from: './types', names: ['HomePartner', 'NetworkPartner'] },
        ],
        exports: [
          { name: 'HOME_PARTNERS', type: 'Localized<HomePartner[]>', value: homePartners },
          { name: 'NETWORK_PARTNERS', type: 'Localized<NetworkPartner[]>', value: networkPartners },
        ],
      },
    ];
  },
};
