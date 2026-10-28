import { z } from 'zod';
import type { RecordResource } from '@viratec/contracts';
import { type Locale } from '../../../src/shared/i18n/model/types.ts';
import {
  entryListField,
  field,
  imageField,
  localizedField,
  type ContentTypeDefinition,
  type FieldDefinition,
} from '../content-types.ts';
import {
  assetLinkSchema,
  createReader,
  entryLinksSchema,
  nonEmpty,
  type EntryReader,
  entryTarget,
} from '../entry-reader.ts';
import { type ContentDomain, type PullContext } from '../domain.ts';
import {
  CARD_TYPE_ID,
  STAT_TYPE_ID,
  STEP_TYPE_ID,
  createCardReader,
  resolveEntry,
} from '../domains/blocks.ts';

export interface CardMapping {
  title: string;
  description?: string;
  meta?: string;
  linkLabel?: string;
  link?: string;
  image?: string;
  imageAlt?: string;
}

type FieldKind =
  | { kind: 'symbol' | 'text'; optional?: boolean }
  | { kind: 'symbols' }
  | { kind: 'paragraphs' }
  | { kind: 'stats' }
  | { kind: 'steps' }
  | { kind: 'cards'; card: CardMapping }
  | { kind: 'recordKeys'; resource: RecordResource }
  | { kind: 'image' };

export type PageField = FieldKind & { path: string; help?: string };

export interface PageSpec {
  typeId: string;
  name: string;
  description: string;
  output: { file: string; exportName: string; typeName: string; typeFrom: string };
  fields: readonly PageField[];
}

type Json = Record<string, unknown>;

const PARAGRAPH_SEPARATOR = /\n\s*\n/;

export const fieldId = (fieldPath: string) =>
  fieldPath
    .split('.')
    .map((part, index) => (index === 0 ? part : part[0]?.toUpperCase() + part.slice(1)))
    .join('');

const fieldName = (fieldPath: string) =>
  fieldPath
    .replace(/\./g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (letter) => letter.toUpperCase());

const isRecord = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const setAt = (target: Json, fieldPath: string, value: unknown) => {
  const [key, ...rest] = fieldPath.split('.');
  if (!key) return;
  if (rest.length === 0) {
    target[key] = value;
    return;
  }
  const child = target[key];
  const node: Json = isRecord(child) ? child : {};
  target[key] = node;
  setAt(node, rest.join('.'), value);
};

const toDefinition = (spec: PageField): FieldDefinition => {
  const id = fieldId(spec.path);
  const name = fieldName(spec.path);
  const options = { required: true, help: spec.help };
  switch (spec.kind) {
    case 'symbol':
      return localizedField(id, name, 'Symbol', { ...options, required: !spec.optional });
    case 'text':
      return localizedField(id, name, 'Text', { ...options, required: !spec.optional });
    case 'symbols':
      return localizedField(id, name, 'Array', {
        ...options,
        items: { type: 'Symbol', validations: [] },
      });
    case 'paragraphs':
      return localizedField(id, name, 'Text', options);
    case 'stats':
      return entryListField(id, name, [STAT_TYPE_ID], options);
    case 'steps':
      return entryListField(id, name, [STEP_TYPE_ID], options);
    case 'cards':
      return entryListField(id, name, [CARD_TYPE_ID], options);
    case 'image':
      return imageField(id, name, options);
    case 'recordKeys':
      return field(id, name, 'Array', {
        help: spec.help,
        items: { type: 'Symbol', validations: [] },
        source: spec.resource,
      });
  }
};

export const pageContentType = (spec: PageSpec): ContentTypeDefinition => ({
  id: spec.typeId,
  name: spec.name,
  description: `${spec.description} Keep exactly one entry.`,
  displayField: 'internalName',
  fields: [
    field('internalName', 'Internal name', 'Symbol', {
      required: true,
      help: 'Only shown in Contentful.',
    }),
    ...spec.fields.map(toDefinition),
  ],
});

const listOf = (reader: EntryReader, id: string) => reader.require(id, entryLinksSchema) ?? [];

const pullPage = (spec: PageSpec, context: PullContext) => {
  const entries = context.collection.byType.get(spec.typeId) ?? [];
  if (entries.length !== 1) {
    context.diagnostics.report(
      `${spec.name}: expected exactly 1 published entry, found ${entries.length}`,
      { kind: 'singleEntry', value: spec.typeId, count: entries.length },
    );
    return [];
  }
  const [entry] = entries;
  if (!entry) return [];
  const label = spec.name;
  const reader = createReader(entry, context.locales, context.diagnostics, label);

  const build = (locale: Locale) => {
    const result: Json = {};
    for (const item of spec.fields) {
      const id = fieldId(item.path);
      const fieldLabel = `${label} ${id}`;
      let value: unknown;

      if (item.kind === 'symbol' || item.kind === 'text') {
        value = item.optional
          ? reader.read(id, nonEmpty, locale)
          : reader.require(id, nonEmpty, locale);
      } else if (item.kind === 'recordKeys') {
        value = reader.read(id, z.array(nonEmpty)) ?? [];
      } else if (item.kind === 'symbols') {
        value = reader.require(id, z.array(nonEmpty), locale);
      } else if (item.kind === 'paragraphs') {
        value = reader
          .require(id, nonEmpty, locale)
          ?.split(PARAGRAPH_SEPARATOR)
          .map((paragraph) => paragraph.trim());
      } else if (item.kind === 'image') {
        const imageId = reader.require(id, assetLinkSchema)?.sys.id;
        value = imageId && context.assets.reference(imageId);
      } else if (item.kind === 'stats' || item.kind === 'steps') {
        const typeId = item.kind === 'stats' ? STAT_TYPE_ID : STEP_TYPE_ID;
        value = listOf(reader, id).flatMap((link): Json[] => {
          const child = resolveEntry(link.sys.id, typeId, context, fieldLabel);
          if (!child) return [];
          const childReader = createReader(
            child,
            context.locales,
            context.diagnostics,
            `${fieldLabel} ${child.sys.id}`,
          );
          return item.kind === 'stats'
            ? [
                {
                  value: childReader.require('value', nonEmpty),
                  label: childReader.require('label', nonEmpty, locale),
                },
              ]
            : [
                {
                  title: childReader.require('title', nonEmpty, locale),
                  description: childReader.require('description', nonEmpty, locale),
                },
              ];
        });
      } else if (item.kind === 'cards') {
        const { card } = item;
        value = listOf(reader, id).flatMap((link) => {
          const child = resolveEntry(link.sys.id, CARD_TYPE_ID, context, fieldLabel);
          if (!child) return [];
          const cardReader = createCardReader(child, context, `${fieldLabel} ${child.sys.id}`);
          const output: Json = { [card.title]: cardReader.text('title', locale) };
          if (card.description) output[card.description] = cardReader.text('description', locale);
          if (card.meta) output[card.meta] = cardReader.text('meta', locale);
          if (card.linkLabel) output[card.linkLabel] = cardReader.text('linkLabel', locale);
          if (card.link) {
            if (!cardReader.target?.to) {
              context.diagnostics.report(
                `${fieldLabel} ${child.sys.id}: needs a link to a site page`,
                { kind: 'needsPageLink', target: entryTarget(child, 'link') },
              );
            }
            output[card.link] = cardReader.target?.to;
          }
          if (card.image) {
            const imageId = cardReader.reader.read('image', assetLinkSchema)?.sys.id;
            if (imageId) output[card.image] = context.assets.reference(imageId);
          }
          if (card.imageAlt) {
            output[card.imageAlt] = cardReader.reader.read('imageAlt', nonEmpty, locale) ?? '';
          }
          return [output];
        });
      }

      if (value !== undefined) setAt(result, item.path, value);
    }
    return result;
  };

  return [
    {
      file: spec.output.file,
      typeImports: [
        { from: '@/shared/i18n/model/types', names: ['Localized'] },
        { from: spec.output.typeFrom, names: [spec.output.typeName] },
      ],
      exports: [
        {
          name: spec.output.exportName,
          type: `Localized<${spec.output.typeName}>`,
          value: { en: build('en'), uk: build('uk') },
        },
      ],
    },
  ];
};

export const pageDomain = (spec: PageSpec): ContentDomain => ({
  id: spec.typeId,
  contentTypes: [pageContentType(spec)],
  pull: (context) => pullPage(spec, context),
});
