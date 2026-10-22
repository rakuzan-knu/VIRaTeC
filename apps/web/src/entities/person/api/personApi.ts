import { api } from '@/shared/api/apiClient';
import type { PeoplePageDto, PeopleQuery, PublicProfileDto } from '@viratec/contracts';

export const fetchPublicProfile = (userId: string): Promise<PublicProfileDto> =>
  api.get<PublicProfileDto>(`/users/${encodeURIComponent(userId)}`);

export const fetchPeople = (query: PeopleQuery): Promise<PeoplePageDto> => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const search = params.toString();
  return api.get<PeoplePageDto>(`/users${search ? `?${search}` : ''}`);
};
