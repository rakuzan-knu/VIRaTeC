import cybersecurityCover from '@/shared/assets/photos/cybersecurity-session.webp';
import nlpCover from '@/shared/assets/photos/nlp-classroom.webp';
import dataCover from '@/shared/assets/photos/data-results.webp';
import educationCover from '@/shared/assets/photos/lecture-hall.webp';
import crossCulturalCover from '@/shared/assets/photos/intercultural-flags.webp';
import experientialCover from '@/shared/assets/photos/wordbank-workshop.webp';
import defaultCover from '@/shared/assets/photos/community-knu.webp';
import { contentCoverSrc } from '@/shared/lib';
import type { Project } from '../model/types';

const AREA_COVERS: Record<string, string> = {
  Cybersecurity: cybersecurityCover,
  'AI & NLP': nlpCover,
  'Data Analytics': dataCover,
  'Education & EdTech': educationCover,
  'Cross-cultural': crossCulturalCover,
  Experiential: experientialCover,
};

export const getProjectCover = (project: Pick<Project, 'tags' | 'coverUrl'>) =>
  project.coverUrl
    ? contentCoverSrc(project.coverUrl)
    : (project.tags.map((tag) => AREA_COVERS[tag]).find(Boolean) ?? defaultCover);
