import type { ProjectDto } from '@viratec/contracts';

export type Project = Omit<ProjectDto, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};
