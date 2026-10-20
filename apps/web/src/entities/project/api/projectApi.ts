import { api } from '@/shared/api/apiClient';
import type { Project } from '../model/types';

export const fetchProjects = (tag?: string): Promise<Project[]> => {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  return api.get<Project[]>(`/projects${query}`);
};

export const fetchProject = (projectId: string): Promise<Project> =>
  api.get<Project>(`/projects/${encodeURIComponent(projectId)}`);
