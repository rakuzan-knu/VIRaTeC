import type { PublicationDto } from '@viratec/contracts';
import { api } from '@/shared/api/apiClient';
import { previewRecords } from '@/shared/lib';

export const fetchPublications = async (): Promise<PublicationDto[]> =>
  previewRecords(await api.get<PublicationDto[]>('/publications'), {
    resource: 'publication',
    keyOf: (publication) => publication.slug,
    merge: (publication, data) => ({ ...publication, ...(data as Partial<PublicationDto>) }),
    create: (slug, data) => ({ ...(data as PublicationDto), slug }),
  });
