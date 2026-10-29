import type { PublicationDto, RecordData } from '@viratec/contracts';
import { api } from '@/shared/api/apiClient';
import { previewRecords } from '@/shared/lib';

export const PUBLICATION_PREVIEW = {
  resource: 'publication',
  keyOf: (publication: PublicationDto) => publication.slug,
  merge: (publication: PublicationDto, data: RecordData): PublicationDto => ({
    ...publication,
    ...(data as Partial<PublicationDto>),
  }),
} as const;

export const fetchPublications = async (): Promise<PublicationDto[]> =>
  previewRecords(await api.get<PublicationDto[]>('/publications'), {
    ...PUBLICATION_PREVIEW,
    create: (slug, data) => ({ ...(data as PublicationDto), slug }),
  });
