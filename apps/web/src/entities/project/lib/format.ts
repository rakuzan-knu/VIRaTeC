import { FacultyDivision, ProjectStatus } from '@viratec/contracts';
import type { Project } from '../model/types';

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  [ProjectStatus.IDEA]: 'Planned',
  [ProjectStatus.IN_PROGRESS]: 'Ongoing',
  [ProjectStatus.COMPLETED]: 'Completed',
  [ProjectStatus.ARCHIVED]: 'Archived',
};

export const FACULTY_LABEL: Record<FacultyDivision, string> = {
  [FacultyDivision.FIT]: 'KNU Faculty of Information Technologies',
  [FacultyDivision.NNIF]: 'KNU Institute of Philology',
  [FacultyDivision.OTHER]: 'Partner universities',
};

export const getProjectYear = (project: Project) => new Date(project.createdAt).getFullYear();

export const getProjectFaculties = (project: Project) =>
  project.faculties.map((faculty) => FACULTY_LABEL[faculty]).join(', ');
