import type { ProjectDto } from '@viratec/contracts';

export interface ProjectLead {
  id: string;
  name: string;
}

export type Project = Omit<ProjectDto, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  lead?: ProjectLead | null;
  coverAlt?: string;
};
