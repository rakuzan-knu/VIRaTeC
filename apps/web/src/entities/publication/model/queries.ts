import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PublicationDto } from '@viratec/contracts';
import { useLocale } from '@/shared/i18n';
import { useRecordOverlay } from '@/shared/lib';
import { PUBLICATION_PREVIEW, fetchPublications } from '../api/publicationApi';
import { toPublication } from './data';
import type { Publication } from './types';

export const publicationKeys = {
  all: ['publications'] as const,
};

const NO_PUBLICATIONS: Publication[] = [];

export function usePublications() {
  const locale = useLocale();
  const overlay = useRecordOverlay(PUBLICATION_PREVIEW);
  const localize = useCallback(
    (publications: PublicationDto[]) =>
      overlay(publications).map((dto) => toPublication(dto, locale)),
    [locale, overlay],
  );
  const query = useQuery({
    queryKey: publicationKeys.all,
    queryFn: fetchPublications,
    select: localize,
    staleTime: 5 * 60_000,
  });

  return {
    publications: query.data ?? NO_PUBLICATIONS,
    isPending: query.isPending,
    isError: query.isError,
    retry: () => void query.refetch(),
  };
}
