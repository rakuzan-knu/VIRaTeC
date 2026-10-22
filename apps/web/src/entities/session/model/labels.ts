import {
  FacultyDivision,
  LanguageLevel,
  OpenToOption,
  ProfileVisibility,
  StudyLevel,
  UserRole,
  type ProfileLinkKey,
} from '@viratec/contracts';
import { defineMessages, useLocalized } from '@/shared/i18n';

const ACCOUNT_LABELS = defineMessages({
  en: {
    faculty: {
      [FacultyDivision.FIT]: 'Faculty of Information Technology',
      [FacultyDivision.NNIF]: 'Institute of Philology',
      [FacultyDivision.OTHER]: 'Other / partner institution',
    } satisfies Record<FacultyDivision, string>,
    role: {
      [UserRole.STUDENT]: 'Student',
      [UserRole.RESEARCHER]: 'Researcher',
      [UserRole.PROFESSOR]: 'Professor',
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.PARTNER]: 'Partner',
    } satisfies Record<UserRole, string>,
    studyLevel: {
      [StudyLevel.BACHELOR]: 'Bachelor’s student',
      [StudyLevel.MASTER]: 'Master’s student',
      [StudyLevel.PHD]: 'PhD candidate',
      [StudyLevel.FACULTY]: 'Faculty member',
      [StudyLevel.RESEARCHER]: 'Researcher',
      [StudyLevel.OTHER]: 'Other',
    } satisfies Record<StudyLevel, string>,
    studyYear: (year: number) => `Year ${year}`,
    openTo: {
      [OpenToOption.COIL_PROJECT]: 'COIL project',
      [OpenToOption.SEEKING_MENTOR]: 'Looking for a mentor',
      [OpenToOption.MENTORING]: 'Mentoring others',
      [OpenToOption.CO_AUTHORSHIP]: 'Co-authorship',
      [OpenToOption.INTERNSHIP]: 'Internship',
    } satisfies Record<OpenToOption, string>,
    languageLevel: {
      [LanguageLevel.A1]: 'A1 · Beginner',
      [LanguageLevel.A2]: 'A2 · Elementary',
      [LanguageLevel.B1]: 'B1 · Intermediate',
      [LanguageLevel.B2]: 'B2 · Upper-intermediate',
      [LanguageLevel.C1]: 'C1 · Advanced',
      [LanguageLevel.C2]: 'C2 · Proficient',
      [LanguageLevel.NATIVE]: 'Native',
    } satisfies Record<LanguageLevel, string>,
    visibility: {
      [ProfileVisibility.PUBLIC]: 'Everyone',
      [ProfileVisibility.MEMBERS]: 'Signed-in members',
      [ProfileVisibility.PRIVATE]: 'Only me',
    } satisfies Record<ProfileVisibility, string>,
    links: {
      orcid: 'ORCID',
      googleScholar: 'Google Scholar',
      scopus: 'Scopus',
      researchGate: 'ResearchGate',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      website: 'Website',
    } satisfies Record<ProfileLinkKey, string>,
  },
  uk: {
    faculty: {
      [FacultyDivision.FIT]: 'Факультет інформаційних технологій',
      [FacultyDivision.NNIF]: 'Інститут філології',
      [FacultyDivision.OTHER]: 'Інший / партнерський заклад',
    },
    role: {
      [UserRole.STUDENT]: 'Студент',
      [UserRole.RESEARCHER]: 'Дослідник',
      [UserRole.PROFESSOR]: 'Професор',
      [UserRole.ADMIN]: 'Адміністратор',
      [UserRole.PARTNER]: 'Партнер',
    },
    studyLevel: {
      [StudyLevel.BACHELOR]: 'Бакалаврат',
      [StudyLevel.MASTER]: 'Магістратура',
      [StudyLevel.PHD]: 'Аспірантура (PhD)',
      [StudyLevel.FACULTY]: 'Викладач',
      [StudyLevel.RESEARCHER]: 'Науковець',
      [StudyLevel.OTHER]: 'Інше',
    },
    studyYear: (year: number) => `${year}-й рік`,
    openTo: {
      [OpenToOption.COIL_PROJECT]: 'COIL-проєкт',
      [OpenToOption.SEEKING_MENTOR]: 'Шукаю ментора',
      [OpenToOption.MENTORING]: 'Готовий менторити',
      [OpenToOption.CO_AUTHORSHIP]: 'Співавторство',
      [OpenToOption.INTERNSHIP]: 'Стажування',
    },
    languageLevel: {
      [LanguageLevel.A1]: 'A1 · Початковий',
      [LanguageLevel.A2]: 'A2 · Елементарний',
      [LanguageLevel.B1]: 'B1 · Середній',
      [LanguageLevel.B2]: 'B2 · Вище середнього',
      [LanguageLevel.C1]: 'C1 · Просунутий',
      [LanguageLevel.C2]: 'C2 · Вільний',
      [LanguageLevel.NATIVE]: 'Рідна',
    },
    visibility: {
      [ProfileVisibility.PUBLIC]: 'Усі',
      [ProfileVisibility.MEMBERS]: 'Учасники спільноти',
      [ProfileVisibility.PRIVATE]: 'Лише я',
    },
    links: {
      orcid: 'ORCID',
      googleScholar: 'Google Scholar',
      scopus: 'Scopus',
      researchGate: 'ResearchGate',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      website: 'Вебсайт',
    },
  },
});

export const useAccountLabels = () => useLocalized(ACCOUNT_LABELS);
