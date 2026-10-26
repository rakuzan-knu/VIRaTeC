import type { Localized } from '@/shared/i18n/model/types';

export type LegalDocument = 'terms' | 'privacy' | 'cookies' | 'guidelines';

export interface LegalTable {
  columns: string[];
  rows: string[][];
}

export interface LegalSection {
  id: string;
  title: string;
  summary: string;
  paragraphs: string[];
  list?: string[];
  table?: LegalTable;
  note?: string;
}

export interface LegalDocumentContent {
  title: string;
  accent: string;
  description: string;
  sections: LegalSection[];
}

export interface LegalDocumentData {
  version: string;
  updatedAt: string;
  content: Localized<LegalDocumentContent>;
}
