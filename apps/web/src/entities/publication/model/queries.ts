import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PublicationDto } from '@viratec/contracts';
import { useLocale } from '@/shared/i18n';
import { fetchPublications } from '../api/publicationApi';
import { toPublication } from './data';
import type { Publication } from './types';

export const publicationKeys = {
  all: ['publications'] as const,
};

const NO_PUBLICATIONS: Publication[] = [];

export function usePublications() {
  const locale = useLocale();
  const localize = useCallback(
    (publications: PublicationDto[]) => publications.map((dto) => toPublication(dto, locale)),
    [locale],
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
