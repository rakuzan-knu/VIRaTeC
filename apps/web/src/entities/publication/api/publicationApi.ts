import type { PublicationDto } from '@viratec/contracts';
import { api } from '@/shared/api/apiClient';

export const fetchPublications = (): Promise<PublicationDto[]> =>
  api.get<PublicationDto[]>('/publications');
