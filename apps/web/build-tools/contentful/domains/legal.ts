import { z } from 'zod';
import { type Locale } from '../../../src/shared/i18n/model/types.ts';
import type {
  LegalDocument,
  LegalDocumentContent,
  LegalDocumentData,
  LegalSection,
  LegalTable,
} from '../../../src/pages/legal/model/types.ts';
import {
  entryListField,
  field,
  localizedField,
  type ContentTypeDefinition,
} from '../content-types.ts';
import {
  createReader,
  entryLinksSchema,
  entryTarget,
  nonEmpty,
  type EntryReader,
} from '../entry-reader.ts';
import { type ContentDomain, type PullContext } from '../domain.ts';
import { resolveEntry } from './blocks.ts';

const DOCUMENT_TYPE_ID = 'legalDocument';
const SECTION_TYPE_ID = 'legalSection';
const DOCUMENT_KEYS = [
  'terms',
  'privacy',
  'cookies',
  'guidelines',
] as const satisfies readonly LegalDocument[];
const EMAIL_PLACEHOLDER = '{contactEmail}';
const PARAGRAPH_SEPARATOR = /\n\s*\n/;
const CELL_SEPARATOR = ' | ';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

const SECTION_TYPE: ContentTypeDefinition = {
  id: SECTION_TYPE_ID,
  name: 'Legal section',
  description: 'One numbered section of a legal document.',
  displayField: 'title',
  fields: [
    field('anchorId', 'Anchor', 'Symbol', {
      required: true,
      validations: [
        {
          regexp: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
          message: 'Lowercase words joined by hyphens',
        },
      ],
      help: 'Link to the section, e.g. /privacy#your-rights. Keep it unchanged once published.',
    }),
    localizedField('title', 'Title', 'Symbol', { required: true }),
    localizedField('summary', 'Summary', 'Text', {
      required: true,
      help: 'Plain-language version shown in the "In short" box.',
    }),
    localizedField('paragraphs', 'Text', 'Text', {
      required: true,
      help: `Separate paragraphs with an empty line. Write ${EMAIL_PLACEHOLDER} where the contact email from Site settings should appear.`,
    }),
    localizedField('list', 'Bullet list', 'Text', {
      help: 'Optional. One item per line.',
    }),
    localizedField('table', 'Table', 'Text', {
      help: `Optional. First line is the header, then one row per line. Separate cells with "${CELL_SEPARATOR.trim()}" and keep the same number of cells in every line.`,
    }),
    localizedField('note', 'Note', 'Text', {
      help: 'Optional highlighted note at the end of the section.',
    }),
  ],
};

const DOCUMENT_TYPE: ContentTypeDefinition = {
  id: DOCUMENT_TYPE_ID,
  name: 'Legal document',
  description:
    'Terms, Privacy, Cookie Policy or Community Guidelines. Keep one entry per document.',
  displayField: 'title',
  fields: [
    field('key', 'Document', 'Symbol', {
      required: true,
      validations: [{ unique: true }, { in: DOCUMENT_KEYS }],
    }),
    localizedField('title', 'Title', 'Symbol', { required: true }),
    localizedField('accent', 'Accent', 'Symbol', {
      required: true,
      help: 'Highlighted line after the title.',
    }),
    localizedField('description', 'Description', 'Text', { required: true }),
    field('version', 'Version', 'Symbol', {
      required: true,
      validations: [{ regexp: { pattern: '^\\d+\\.\\d+$' }, message: 'For example 1.0 or 2.1' }],
      help: 'Raise it when the meaning of the document changes.',
    }),
    field('updatedAt', 'Last updated', 'Date', {
      required: true,
      help: 'Shown as "Last updated" at the top of the document.',
    }),
    entryListField('sections', 'Sections', [SECTION_TYPE_ID], {
      required: true,
      validations: [{ size: { min: 1, max: 40 } }],
      help: 'Sections in reading order. Their numbers come from this order.',
    }),
  ],
};

const lines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const cells = (line: string) => line.split(CELL_SEPARATOR.trim()).map((cell) => cell.trim());

const readSection = (
  reader: EntryReader,
  locale: Locale,
  label: string,
  context: PullContext,
  withEmail: (text: string) => string,
): LegalSection | undefined => {
  const id = reader.require('anchorId', nonEmpty);
  const title = reader.require('title', nonEmpty, locale);
  const summary = reader.require('summary', nonEmpty, locale);
  const paragraphs = reader.require('paragraphs', nonEmpty, locale);
  const list = reader.read('list', nonEmpty, locale);
  const tableText = reader.read('table', nonEmpty, locale);
  const note = reader.read('note', nonEmpty, locale);
  if (!id || !title || !summary || !paragraphs) return undefined;

  let table: LegalTable | undefined;
  if (tableText) {
    const [header, ...rows] = lines(tableText).map(cells);
    if (!header || rows.some((row) => row.length !== header.length)) {
      context.diagnostics.report(
        `${label} (${locale}): every table line needs ${header?.length ?? 0} cells`,
        {
          kind: 'tableCells',
          target: entryTarget(reader.entry, 'table', locale),
          count: header?.length ?? 0,
        },
      );
      return undefined;
    }
    table = { columns: header.map(withEmail), rows: rows.map((row) => row.map(withEmail)) };
  }

  return {
    id,
    title: withEmail(title),
    summary: withEmail(summary),
    paragraphs: paragraphs
      .split(PARAGRAPH_SEPARATOR)
      .map((paragraph) => withEmail(paragraph.trim())),
    ...(list && { list: lines(list).map(withEmail) }),
    ...(table && { table }),
    ...(note && { note: withEmail(note) }),
  };
};

export const legalDomain: ContentDomain = {
  id: DOCUMENT_TYPE_ID,
  contentTypes: [SECTION_TYPE, DOCUMENT_TYPE],

  pull(context) {
    const [settings] = context.collection.byType.get('siteSettings') ?? [];
    const email = settings?.fields.contactEmail?.[context.locales.en];
    if (typeof email !== 'string') {
      context.diagnostics.report('legal: the contact email from Site settings is required', {
        kind: 'contactEmailMissing',
        ...(settings && { target: entryTarget(settings, 'contactEmail') }),
      });
      return [];
    }
    const withEmail = (text: string) => {
      const unknown = text.match(/\{(?!contactEmail\})[a-zA-Z]+\}/);
      if (unknown) context.diagnostics.warn(`legal: unknown placeholder ${unknown[0]}`);
      return text.split(EMAIL_PLACEHOLDER).join(email);
    };

    const documents = new Map<LegalDocument, LegalDocumentData>();
    for (const entry of context.collection.byType.get(DOCUMENT_TYPE_ID) ?? []) {
      const reader = createReader(
        entry,
        context.locales,
        context.diagnostics,
        `legal document ${entry.sys.id}`,
      );
      const key = DOCUMENT_KEYS.find((item) => item === reader.require('key', nonEmpty));
      const version = reader.require('version', nonEmpty);
      const updatedAt = reader.require('updatedAt', z.string().regex(ISO_DATE))?.slice(0, 10);
      const sections = (reader.require('sections', entryLinksSchema) ?? []).flatMap((link) => {
        const label = `legal ${key ?? entry.sys.id} section ${link.sys.id}`;
        const section = resolveEntry(link.sys.id, SECTION_TYPE_ID, context, label);
        return section
          ? [{ label, reader: createReader(section, context.locales, context.diagnostics, label) }]
          : [];
      });

      const content = (locale: Locale): LegalDocumentContent | undefined => {
        const title = reader.require('title', nonEmpty, locale);
        const accent = reader.require('accent', nonEmpty, locale);
        const description = reader.require('description', nonEmpty, locale);
        const items = sections.flatMap((section) => {
          const value = readSection(section.reader, locale, section.label, context, withEmail);
          return value ? [value] : [];
        });
        if (!title || !accent || !description || items.length !== sections.length) return undefined;
        return {
          title: withEmail(title),
          accent: withEmail(accent),
          description: withEmail(description),
          sections: items,
        };
      };

      const en = content('en');
      const uk = content('uk');
      if (key && version && updatedAt && en && uk) {
        documents.set(key, { version, updatedAt, content: { en, uk } });
      }
    }

    const missing = DOCUMENT_KEYS.filter((key) => !documents.has(key));
    if (missing.length > 0) {
      context.diagnostics.report(`legal: missing published documents ${missing.join(', ')}`, {
        kind: 'legalDocumentsMissing',
        value: missing.join(', '),
      });
      return [];
    }

    return [
      {
        file: 'src/pages/legal/model/documents.generated.ts',
        typeImports: [{ from: './types', names: ['LegalDocument', 'LegalDocumentData'] }],
        exports: [
          {
            name: 'LEGAL_DOCUMENT_DATA',
            type: 'Record<LegalDocument, LegalDocumentData>',
            value: Object.fromEntries(DOCUMENT_KEYS.map((key) => [key, documents.get(key)])),
          },
        ],
      },
    ];
  },
};
