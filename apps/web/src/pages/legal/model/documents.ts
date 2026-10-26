import { TERMS_VERSION } from '@viratec/contracts';
import { ROUTES } from '@/shared/config/routes';
import type { Localized } from '@/shared/i18n';
import { COOKIES_CONTENT } from './cookies';
import { GUIDELINES_CONTENT } from './guidelines';
import { PRIVACY_CONTENT } from './privacy';
import { TERMS_CONTENT } from './terms';
import type { LegalDocument, LegalDocumentContent, LegalSection } from './types';

export const LEGAL_DOCUMENT_ORDER: LegalDocument[] = ['terms', 'privacy', 'cookies', 'guidelines'];

export const LEGAL_DOCUMENTS: Record<LegalDocument, Localized<LegalDocumentContent>> = {
  terms: TERMS_CONTENT,
  privacy: PRIVACY_CONTENT,
  cookies: COOKIES_CONTENT,
  guidelines: GUIDELINES_CONTENT,
};

export const LEGAL_ROUTES: Record<LegalDocument, string> = {
  terms: ROUTES.TERMS,
  privacy: ROUTES.PRIVACY,
  cookies: ROUTES.COOKIES,
  guidelines: ROUTES.GUIDELINES,
};

export const LEGAL_UPDATED_AT = new Date(2026, 9, 26);

export const LEGAL_VERSION = TERMS_VERSION;

const WORDS_PER_MINUTE = 200;

export const formatIndex = (index: number) => String(index + 1).padStart(2, '0');

const sectionText = (section: LegalSection) =>
  [
    section.title,
    section.summary,
    ...section.paragraphs,
    ...(section.list ?? []),
    ...(section.table?.rows.flat() ?? []),
    section.note ?? '',
  ].join(' ');

export const readingMinutes = (content: LegalDocumentContent) => {
  const words = content.sections.map(sectionText).join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};
