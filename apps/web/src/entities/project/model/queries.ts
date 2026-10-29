import { useCallback } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from '@/shared/i18n';
import { useRecordOverlay } from '@/shared/lib';
import { PROJECT_PREVIEW, fetchProject, fetchProjects } from '../api/projectApi';
import { localizeProject } from '../lib/localize';
import type { Project } from './types';

export const projectKeys = {
  all: ['projects'] as const,
  list: (tag?: string) => [...projectKeys.all, 'list', tag ?? 'all'] as const,
  detail: (projectId: string) => [...projectKeys.all, 'detail', projectId] as const,
};

export function useProjects(tag?: string) {
  const locale = useLocale();
  const overlay = useRecordOverlay(PROJECT_PREVIEW);
  const localize = useCallback(
    (projects: Project[]) => overlay(projects).map((project) => localizeProject(project, locale)),
    [locale, overlay],
  );
  return useQuery({
    queryKey: projectKeys.list(tag),
    queryFn: () => fetchProjects(tag),
    select: localize,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useProject(projectId: string | undefined) {
  const locale = useLocale();
  const overlay = useRecordOverlay(PROJECT_PREVIEW);
  const localize = useCallback(
    (project: Project) => localizeProject(overlay([project])[0] ?? project, locale),
    [locale, overlay],
  );
  return useQuery({
    queryKey: projectKeys.detail(projectId ?? ''),
    queryFn: () => fetchProject(projectId ?? ''),
    select: localize,
    enabled: Boolean(projectId),
    staleTime: 60_000,
  });
}
