import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchProject, fetchProjects } from '../api/projectApi';

export const projectKeys = {
  all: ['projects'] as const,
  list: (tag?: string) => [...projectKeys.all, 'list', tag ?? 'all'] as const,
  detail: (projectId: string) => [...projectKeys.all, 'detail', projectId] as const,
};

export function useProjects(tag?: string) {
  return useQuery({
    queryKey: projectKeys.list(tag),
    queryFn: () => fetchProjects(tag),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId ?? ''),
    queryFn: () => fetchProject(projectId ?? ''),
    enabled: Boolean(projectId),
    staleTime: 60_000,
  });
}
