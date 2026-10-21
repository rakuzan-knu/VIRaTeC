import { FacultyDivision, ProjectStatus } from '@viratec/contracts';
import { defineMessages, useLocalized } from '@/shared/i18n';
import type { Project } from '../model/types';

interface ProjectLabels {
  status: Record<ProjectStatus, string>;
  faculty: Record<FacultyDivision, string>;
  faculties: string;
  year: string;
  viewProject: string;
}

const PROJECT_LABELS = defineMessages<ProjectLabels>({
  en: {
    status: {
      [ProjectStatus.IDEA]: 'Planned',
      [ProjectStatus.IN_PROGRESS]: 'Ongoing',
      [ProjectStatus.COMPLETED]: 'Completed',
      [ProjectStatus.ARCHIVED]: 'Archived',
    },
    faculty: {
      [FacultyDivision.FIT]: 'KNU Faculty of Information Technologies',
      [FacultyDivision.NNIF]: 'KNU Institute of Philology',
      [FacultyDivision.OTHER]: 'Partner universities',
    },
    faculties: 'Faculties',
    year: 'Year',
    viewProject: 'View project',
  },
  uk: {
    status: {
      [ProjectStatus.IDEA]: 'Заплановано',
      [ProjectStatus.IN_PROGRESS]: 'Триває',
      [ProjectStatus.COMPLETED]: 'Завершено',
      [ProjectStatus.ARCHIVED]: 'В архіві',
    },
    faculty: {
      [FacultyDivision.FIT]: 'Факультет інформаційних технологій КНУ',
      [FacultyDivision.NNIF]: 'Інститут філології КНУ',
      [FacultyDivision.OTHER]: 'Університети-партнери',
    },
    faculties: 'Факультети',
    year: 'Рік',
    viewProject: 'Переглянути проєкт',
  },
});

export const useProjectLabels = () => useLocalized(PROJECT_LABELS);

export const getProjectYear = (project: Project) => new Date(project.createdAt).getFullYear();

export const getProjectFaculties = (
  project: Project,
  facultyLabels: Record<FacultyDivision, string>,
) => project.faculties.map((faculty) => facultyLabels[faculty]).join(', ');
