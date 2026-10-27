import type { Locale } from '../../../src/shared/i18n/model/types.ts';
import { ROUTES } from '../../../src/shared/config/routes.ts';
import {
  URL_VALIDATION,
  entryField,
  field,
  imageField,
  localizedField,
  type ContentTypeDefinition,
} from '../content-types.ts';
import {
  createReader,
  entryLinkSchema,
  entryTarget,
  nonEmpty,
  type RawEntry,
} from '../entry-reader.ts';
import type { ContentDomain, PullContext } from '../domain.ts';
import { routeToken } from '../tokens.ts';

export const LINK_TYPE_ID = 'link';
export const CARD_TYPE_ID = 'card';
export const STAT_TYPE_ID = 'stat';
export const STEP_TYPE_ID = 'step';

type RouteKey = keyof typeof ROUTES;

export const LINKABLE_ROUTES = [
  'HOME',
  'ABOUT_INITIATIVE',
  'VIRATEC',
  'GLOBAL_COLLABORATION',
  'RESEARCH_AREAS',
  'PROJECTS',
  'EXPERIENTIAL_LEARNING',
  'STUDENT_RESEARCH',
  'PUBLICATIONS',
  'OPPORTUNITIES',
  'CONTACT',
  'PEOPLE',
  'REGISTER',
  'LOGIN',
  'TERMS',
  'PRIVACY',
  'COOKIES',
  'GUIDELINES',
] as const satisfies readonly RouteKey[];

const LINK_TYPE: ContentTypeDefinition = {
  id: LINK_TYPE_ID,
  name: 'Link',
  description: 'A link to a page of the site or to an external address.',
  displayField: 'title',
  fields: [
    field('title', 'Internal name', 'Symbol', {
      required: true,
      help: 'Only shown in Contentful, e.g. "Contact page".',
    }),
    field('route', 'Site page', 'Symbol', {
      validations: [{ in: LINKABLE_ROUTES }],
      help: 'Page of this site. Fill either this or the external URL.',
    }),
    field('url', 'External URL', 'Symbol', {
      validations: [URL_VALIDATION],
      help: 'Full address of another site. Fill either this or the site page.',
    }),
  ],
};

const CARD_TYPE: ContentTypeDefinition = {
  id: CARD_TYPE_ID,
  name: 'Card',
  description: 'Reusable card with a title, text, optional label, link and image.',
  displayField: 'title',
  fields: [
    localizedField('title', 'Title', 'Symbol', { required: true }),
    localizedField('description', 'Description', 'Text'),
    localizedField('meta', 'Meta', 'Symbol', {
      help: 'Small line above the title, e.g. "Online · 8 weeks".',
    }),
    localizedField('linkLabel', 'Link label', 'Symbol', {
      help: 'Text of the button or link, e.g. "Apply".',
    }),
    entryField('link', 'Link', [LINK_TYPE_ID]),
    imageField('image', 'Image'),
  ],
};

const STAT_TYPE: ContentTypeDefinition = {
  id: STAT_TYPE_ID,
  name: 'Stat',
  description: 'A number with a caption, e.g. "15+ partner universities".',
  displayField: 'value',
  fields: [
    field('value', 'Value', 'Symbol', { required: true, help: 'E.g. 15+, 500+, 10.' }),
    localizedField('label', 'Label', 'Symbol', { required: true }),
  ],
};

const STEP_TYPE: ContentTypeDefinition = {
  id: STEP_TYPE_ID,
  name: 'Step',
  description: 'One step of a numbered list. The number comes from its position.',
  displayField: 'title',
  fields: [
    localizedField('title', 'Title', 'Symbol', { required: true }),
    localizedField('description', 'Description', 'Text', { required: true }),
  ],
};

export const blocksDomain: ContentDomain = {
  id: 'blocks',
  contentTypes: [LINK_TYPE, CARD_TYPE, STAT_TYPE, STEP_TYPE],
  pull: () => [],
};

export const resolveEntry = (
  id: string,
  contentTypeId: string,
  context: PullContext,
  label: string,
): RawEntry | undefined => {
  const entry = context.collection.entries.get(id);
  if (!entry) {
    context.diagnostics.report(`${label}: linked entry ${id} is missing or unpublished`, {
      kind: 'missingEntry',
      value: contentTypeId,
    });
    return undefined;
  }
  if (entry.sys.contentType.sys.id !== contentTypeId) {
    context.diagnostics.report(`${label}: linked entry ${id} must be a ${contentTypeId}`, {
      kind: 'wrongEntryType',
      target: entryTarget(entry),
      value: contentTypeId,
    });
    return undefined;
  }
  return entry;
};

export interface LinkTarget {
  to?: string;
  href?: string;
}

export const readLinkTarget = (
  id: string,
  context: PullContext,
  label: string,
): LinkTarget | undefined => {
  const entry = resolveEntry(id, LINK_TYPE_ID, context, label);
  if (!entry) return undefined;

  const reader = createReader(entry, context.locales, context.diagnostics, `${label} link`);
  const route = reader.read('route', nonEmpty);
  const url = reader.read('url', nonEmpty);
  if (route && url) {
    context.diagnostics.report(`${label} link: fill either the site page or the external URL`, {
      kind: 'linkBothTargets',
      target: entryTarget(entry, 'url'),
    });
    return undefined;
  }
  if (route) {
    const routeKey = LINKABLE_ROUTES.find((key) => key === route);
    if (routeKey) return { to: routeToken(routeKey) };
    context.diagnostics.report(`${label} link: unknown site page ${route}`, {
      kind: 'unknownPage',
      target: entryTarget(entry, 'route'),
      value: route,
    });
    return undefined;
  }
  if (url) return { href: url };
  context.diagnostics.report(`${label} link: has neither a site page nor an external URL`, {
    kind: 'linkNoTarget',
    target: entryTarget(entry, 'route'),
  });
  return undefined;
};

export const createCardReader = (entry: RawEntry, context: PullContext, label: string) => {
  const reader = createReader(entry, context.locales, context.diagnostics, label);
  const linkId = reader.read('link', entryLinkSchema)?.sys.id;
  const target = linkId ? readLinkTarget(linkId, context, label) : undefined;
  return {
    reader,
    target,
    text: (id: 'title' | 'description' | 'meta' | 'linkLabel', locale: Locale) =>
      reader.require(id, nonEmpty, locale),
  };
};
