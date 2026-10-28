import type { Locale } from '@/shared/i18n';
import type { Project } from '../model/types';

export const localizeProject = (project: Project, locale: Locale): Project => {
  const text = project.translations?.[locale];
  return text
    ? { ...project, title: text.title, description: text.description, coverAlt: text.coverAlt }
    : project;
};
