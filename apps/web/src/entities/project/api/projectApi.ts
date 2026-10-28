import type { RecordData } from '@viratec/contracts';
import { api } from '@/shared/api/apiClient';
import { previewRecords } from '@/shared/lib';
import type { Project } from '../model/types';

const mergeDraft = (project: Project, data: RecordData): Project => {
  const merged = { ...project, ...(data as Partial<Project>) };
  const text = merged.translations?.en;
  return text ? { ...merged, title: text.title, description: text.description } : merged;
};

export const PROJECT_PREVIEW = {
  resource: 'project',
  keyOf: (project: Project) => project.id,
  merge: mergeDraft,
} as const;

export const fetchProjects = async (tag?: string): Promise<Project[]> => {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  const projects = await api.get<Project[]>(`/projects${query}`);
  const now = new Date().toISOString();
  return previewRecords(projects, {
    ...PROJECT_PREVIEW,
    create: tag
      ? undefined
      : (id, data) =>
          mergeDraft(
            {
              id,
              title: '',
              description: '',
              status: 'IDEA' as Project['status'],
              faculties: [],
              tags: [],
              translations: null,
              leadId: null,
              lead: null,
              createdAt: now,
              updatedAt: now,
            },
            data,
          ),
  });
};

export const fetchProject = async (projectId: string): Promise<Project> => {
  const project = await api.get<Project>(`/projects/${encodeURIComponent(projectId)}`);
  const [preview] = await previewRecords([project], PROJECT_PREVIEW);
  return preview ?? project;
};
