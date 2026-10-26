import type { Locale } from '../../../src/shared/i18n/model/types.ts';
import type { PageSeo } from '../../../src/shared/config/seo.ts';
import { field, localizedField, type ContentTypeDefinition } from '../content-types.ts';
import { createReader, nonEmpty } from '../entry-reader.ts';
import { type ContentDomain } from '../domain.ts';
import { routeToken } from '../tokens.ts';
import { LINKABLE_ROUTES } from './blocks.ts';

const TYPE_ID = 'pageSeo';
const DESCRIPTION_LIMIT = 160;

const PAGE_SEO_TYPE: ContentTypeDefinition = {
  id: TYPE_ID,
  name: 'Page SEO',
  description: 'Search and social preview texts of one page. The home page entry is the default.',
  displayField: 'route',
  fields: [
    field('route', 'Page', 'Symbol', {
      required: true,
      validations: [{ unique: true }, { in: LINKABLE_ROUTES }],
    }),
    localizedField('title', 'Title', 'Symbol', {
      validations: [{ size: { max: 70 } }],
      help: 'Shown as "Title — VIRaTeC". Leave empty on the home page to use the full site name.',
    }),
    localizedField('description', 'Description', 'Text', {
      required: true,
      help: `Search snippet. Up to ${DESCRIPTION_LIMIT} characters are shown, longer text is cut.`,
    }),
  ],
};

export const pageSeoDomain: ContentDomain = {
  id: TYPE_ID,
  contentTypes: [PAGE_SEO_TYPE],

  pull({ collection, locales, diagnostics }) {
    const pages = (collection.byType.get(TYPE_ID) ?? []).flatMap((entry) => {
      const reader = createReader(entry, locales, diagnostics, `page SEO ${entry.sys.id}`);
      const route = LINKABLE_ROUTES.find((key) => key === reader.require('route', nonEmpty));
      if (!route) return [];
      const seo = (locale: Locale): PageSeo | undefined => {
        const description = reader.require('description', nonEmpty, locale);
        const title = reader.read('title', nonEmpty, locale);
        return description ? { ...(title && { title }), description } : undefined;
      };
      const en = seo('en');
      const uk = seo('uk');
      return en && uk ? [{ route, seo: { en, uk } }] : [];
    });

    pages.sort((a, b) => LINKABLE_ROUTES.indexOf(a.route) - LINKABLE_ROUTES.indexOf(b.route));
    const home = pages.find((page) => page.route === 'HOME');
    if (!home) {
      diagnostics.report('page SEO: the HOME entry is required, it is the default for all pages');
      return [];
    }

    return [
      {
        file: 'src/shared/config/seo.generated.ts',
        routesFrom: './routes',
        typeImports: [
          { from: '../i18n/model/types', names: ['Localized'] },
          { from: './seo', names: ['PageSeo', 'PageSeoEntry'] },
        ],
        exports: [
          { name: 'DEFAULT_SEO', type: 'Localized<PageSeo>', value: home.seo },
          {
            name: 'PAGE_SEO_ENTRIES',
            type: 'PageSeoEntry[]',
            value: pages.map(({ route, seo }) => ({ route: routeToken(route), seo })),
          },
        ],
      },
    ];
  },
};
