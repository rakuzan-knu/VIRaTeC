import { ROUTES } from '@/shared/config/routes';
import { useLiveContent } from '@/shared/lib';
import { LEGAL_DOCUMENT_DATA } from './documents.generated';
import type { LegalDocument, LegalDocumentContent, LegalDocumentData, LegalSection } from './types';

export const LEGAL_DOCUMENT_ORDER: LegalDocument[] = ['terms', 'privacy', 'cookies', 'guidelines'];

export const useLegalDocuments = () =>
  useLiveContent('legalDocument', 'LEGAL_DOCUMENT_DATA', LEGAL_DOCUMENT_DATA);

export const LEGAL_ROUTES: Record<LegalDocument, string> = {
  terms: ROUTES.TERMS,
  privacy: ROUTES.PRIVACY,
  cookies: ROUTES.COOKIES,
  guidelines: ROUTES.GUIDELINES,
};

export const legalMeta = ({ version, updatedAt }: LegalDocumentData) => {
  const [year = 0, month = 1, day = 1] = updatedAt.split('-').map(Number);
  return { version, updatedAt: new Date(year, month - 1, day) };
};

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
