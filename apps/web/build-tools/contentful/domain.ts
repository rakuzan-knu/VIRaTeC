import { LOCALES, type Locale, type Localized } from '../../src/shared/i18n/model/types.ts';
import type { ContentTypeDefinition } from './content-types.ts';
import type { Diagnostics, EntryCollection } from './entry-reader.ts';
import type { AssetRegistry } from './tokens.ts';

export const buildLocalized = <T>(
  build: (locale: Locale) => T | undefined,
): Localized<T> | undefined => {
  const en = build('en');
  if (en === undefined) return undefined;
  const result: Localized<T> = { en };
  for (const locale of LOCALES) {
    if (locale === 'en') continue;
    const value = build(locale);
    if (value === undefined) return undefined;
    result[locale] = value;
  }
  return result;
};

export interface GeneratedModule {
  file: string;
  typeImports: { from: string; names: readonly string[] }[];
  exports: { name: string; type: string; value: unknown }[];
  routesFrom?: string;
}

export interface PullContext {
  collection: EntryCollection;
  locales: Record<Locale, string>;
  diagnostics: Diagnostics;
  assets: AssetRegistry;
}

export interface ContentDomain {
  id: string;
  contentTypes: readonly ContentTypeDefinition[];
  pull: (context: PullContext) => GeneratedModule[];
}
