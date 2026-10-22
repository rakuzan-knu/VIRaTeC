import { z } from 'zod';
import {
  FacultyDivision,
  LanguageLevel,
  OpenToOption,
  PROFILE_DETAIL_LIMITS,
  PROFILE_LIMITS,
  PROFILE_LINK_KEYS,
  StudyLevel,
  normalizeProfileLink,
  type AccountDto,
  type ProfileLinkKey,
  type ProfileLinks,
  type UpdateProfileRequestDto,
} from '@viratec/contracts';

export interface ProfileSchemaMessages {
  nameMin: string;
  nameMax: string;
  departmentMax: string;
  bioMax: string;
  institutionMax: string;
  languageRequired: string;
  invalidLink: Record<ProfileLinkKey, string>;
}

const STUDY_LEVELS_WITH_YEAR: readonly StudyLevel[] = [
  StudyLevel.BACHELOR,
  StudyLevel.MASTER,
  StudyLevel.PHD,
];

export const hasStudyYear = (level: StudyLevel | '') =>
  level !== '' && STUDY_LEVELS_WITH_YEAR.includes(level);

const linksShape = Object.fromEntries(
  PROFILE_LINK_KEYS.map((key) => [key, z.string().max(PROFILE_DETAIL_LIMITS.linkMax)]),
) as Record<ProfileLinkKey, z.ZodString>;

export const createProfileFormSchema = (messages: ProfileSchemaMessages) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(PROFILE_LIMITS.nameMin, messages.nameMin)
      .max(PROFILE_LIMITS.nameMax, messages.nameMax),
    faculty: z.nativeEnum(FacultyDivision),
    department: z.string().trim().max(PROFILE_LIMITS.departmentMax, messages.departmentMax),
    bio: z.string().trim().max(PROFILE_LIMITS.bioMax, messages.bioMax),
    skills: z.array(z.string()).max(PROFILE_LIMITS.skillsMax),
    studyLevel: z.union([z.nativeEnum(StudyLevel), z.literal('')]),
    studyYear: z.string(),
    institution: z
      .string()
      .trim()
      .max(PROFILE_DETAIL_LIMITS.institutionMax, messages.institutionMax),
    country: z.string(),
    languages: z
      .array(
        z.object({
          code: z.string().min(1, messages.languageRequired),
          level: z.nativeEnum(LanguageLevel),
        }),
      )
      .max(PROFILE_DETAIL_LIMITS.languagesMax),
    links: z.object(linksShape).superRefine((links, ctx) => {
      for (const key of PROFILE_LINK_KEYS) {
        if (links[key].trim() !== '' && normalizeProfileLink(key, links[key]) === null) {
          ctx.addIssue({ code: 'custom', path: [key], message: messages.invalidLink[key] });
        }
      }
    }),
    openTo: z.array(z.nativeEnum(OpenToOption)),
  });

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileFormSchema>>;

const readLinks = (links: AccountDto['links']): Record<ProfileLinkKey, string> =>
  Object.fromEntries(PROFILE_LINK_KEYS.map((key) => [key, links?.[key] ?? ''])) as Record<
    ProfileLinkKey,
    string
  >;

export const toProfileFormValues = (account: AccountDto): ProfileFormValues => ({
  name: account.name,
  faculty: account.faculty,
  department: account.department ?? '',
  bio: account.bio ?? '',
  skills: account.skills ?? [],
  studyLevel: account.studyLevel ?? '',
  studyYear: account.studyYear ? String(account.studyYear) : '',
  institution: account.institution ?? '',
  country: account.country ?? '',
  languages: account.languages ?? [],
  links: readLinks(account.links),
  openTo: account.openTo ?? [],
});

export const toUpdateProfileRequest = (values: ProfileFormValues): UpdateProfileRequestDto => {
  const links: ProfileLinks = {};
  for (const key of PROFILE_LINK_KEYS) {
    const normalized = normalizeProfileLink(key, values.links[key]);
    if (normalized) links[key] = normalized;
  }

  return {
    name: values.name,
    faculty: values.faculty,
    department: values.department,
    bio: values.bio,
    skills: values.skills,
    studyLevel: values.studyLevel || null,
    studyYear:
      hasStudyYear(values.studyLevel) && values.studyYear ? Number(values.studyYear) : null,
    institution: values.institution,
    country: values.country || null,
    languages: values.languages,
    links,
    openTo: values.openTo,
  };
};
