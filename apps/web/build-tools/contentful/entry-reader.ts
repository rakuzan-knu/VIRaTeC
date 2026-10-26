import { z } from 'zod';
import { DEFAULT_LOCALE, type Locale } from '../../src/shared/i18n/model/types.ts';

export const rawEntrySchema = z.object({
  sys: z.object({
    id: z.string(),
    createdAt: z.string(),
    contentType: z.object({ sys: z.object({ id: z.string() }) }),
  }),
  fields: z.record(z.string(), z.record(z.string(), z.unknown())),
});

export type RawEntry = z.infer<typeof rawEntrySchema>;

export const rawAssetSchema = z.object({
  sys: z.object({ id: z.string(), updatedAt: z.string() }),
  fields: z.object({
    title: z.record(z.string(), z.string()).optional(),
    description: z.record(z.string(), z.string()).optional(),
    file: z
      .record(
        z.string(),
        z.object({ url: z.string(), contentType: z.string(), fileName: z.string() }).passthrough(),
      )
      .optional(),
  }),
});

export type RawAsset = z.infer<typeof rawAssetSchema>;

export interface EntryCollection {
  byType: Map<string, RawEntry[]>;
  entries: Map<string, RawEntry>;
  assets: Map<string, RawAsset>;
}

export const assetLinkSchema = z.object({
  sys: z.object({ type: z.literal('Link'), linkType: z.literal('Asset'), id: z.string() }),
});

export const entryLinkSchema = z.object({
  sys: z.object({ type: z.literal('Link'), linkType: z.literal('Entry'), id: z.string() }),
});

export const entryLinksSchema = z.array(entryLinkSchema);

export const nonEmpty = z.string().trim().min(1);

export interface Diagnostics {
  report: (issue: string) => void;
  warn: (warning: string) => void;
}

export const createDiagnostics = () => {
  const issues: string[] = [];
  const warnings: string[] = [];
  const diagnostics: Diagnostics = {
    report: (issue) => issues.push(issue),
    warn: (warning) => warnings.push(warning),
  };
  return { issues, warnings, diagnostics };
};

export const createReader = (
  entry: RawEntry,
  locales: Record<Locale, string>,
  diagnostics: Diagnostics,
  label: string,
) => {
  const read = <T>(id: string, schema: z.ZodType<T>, locale: Locale = DEFAULT_LOCALE) => {
    const values = entry.fields[id];
    const own = values?.[locales[locale]];
    const fallback = values?.[locales[DEFAULT_LOCALE]];
    if (own === undefined && fallback !== undefined && locale !== DEFAULT_LOCALE) {
      diagnostics.warn(`${label}: "${id}" has no ${locale} value, using ${DEFAULT_LOCALE}`);
    }
    const raw = own ?? fallback;
    if (raw === undefined) return undefined;

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      diagnostics.report(`${label}: "${id}" is invalid (${parsed.error.issues[0]?.message})`);
      return undefined;
    }
    return parsed.data;
  };

  const require = <T>(id: string, schema: z.ZodType<T>, locale: Locale = DEFAULT_LOCALE) => {
    const value = read(id, schema, locale);
    if (value === undefined) diagnostics.report(`${label}: "${id}" is required (${locale})`);
    return value;
  };

  return { read, require };
};

export type EntryReader = ReturnType<typeof createReader>;
