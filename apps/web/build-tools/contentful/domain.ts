import type { Locale } from '../../src/shared/i18n/model/types.ts';
import type { ContentTypeDefinition } from './content-types.ts';
import type { Diagnostics, EntryCollection } from './entry-reader.ts';
import type { AssetRegistry } from './tokens.ts';

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
