import { z } from 'zod';
import { LanguageLevel, OpenToOption, ProfileVisibility, StudyLevel } from './enums.js';

export const PROFILE_LINK_KEYS = [
  'orcid',
  'googleScholar',
  'scopus',
  'researchGate',
  'linkedin',
  'github',
  'website',
] as const;

export type ProfileLinkKey = (typeof PROFILE_LINK_KEYS)[number];

export type ProfileLinks = Partial<Record<ProfileLinkKey, string>>;

const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
const SCOPUS_PATTERN = /^\d{5,15}$/;
const GITHUB_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

const parseHttpUrl = (value: string): URL | null => {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
};

const hostMatches = (url: URL, domain: string) =>
  url.hostname === domain || url.hostname.endsWith(`.${domain}`);

const normalizeUrlOnDomain = (value: string, domains: readonly string[]): string | null => {
  const url = parseHttpUrl(value);
  if (!url || !domains.some((domain) => hostMatches(url, domain))) return null;
  url.protocol = 'https:';
  return url.toString();
};

const LINK_NORMALIZERS: Record<ProfileLinkKey, (value: string) => string | null> = {
  orcid: (value) => {
    const match = /(\d{4}-\d{4}-\d{4}-\d{3}[\dXx])\/?$/.exec(value);
    const id = match?.[1]?.toUpperCase() ?? '';
    return ORCID_PATTERN.test(id) ? id : null;
  },
  googleScholar: (value) => {
    const url = parseHttpUrl(value);
    if (!url || !/^scholar\.google\.[a-z.]+$/.test(url.hostname)) return null;
    url.protocol = 'https:';
    return url.toString();
  },
  scopus: (value) => {
    const fromUrl = parseHttpUrl(value)?.searchParams.get('authorId');
    const id = (fromUrl ?? value).trim();
    return SCOPUS_PATTERN.test(id) ? id : null;
  },
  researchGate: (value) => normalizeUrlOnDomain(value, ['researchgate.net']),
  linkedin: (value) => normalizeUrlOnDomain(value, ['linkedin.com']),
  github: (value) => {
    const url = /github\.com/i.test(value) ? parseHttpUrl(value) : null;
    const handle = (url ? (url.pathname.split('/').find(Boolean) ?? '') : value).replace(/^@/, '');
    return GITHUB_PATTERN.test(handle) ? handle : null;
  },
  website: (value) => {
    const url = parseHttpUrl(value);
    return url && url.hostname.includes('.') ? url.toString() : null;
  },
};

export const normalizeProfileLink = (key: ProfileLinkKey, value: string): string | null => {
  const trimmed = value.trim();
  return trimmed === '' ? null : LINK_NORMALIZERS[key](trimmed);
};

export const buildProfileLinkUrl = (key: ProfileLinkKey, value: string): string => {
  switch (key) {
    case 'orcid':
      return `https://orcid.org/${value}`;
    case 'scopus':
      return `https://www.scopus.com/authid/detail.uri?authorId=${value}`;
    case 'github':
      return `https://github.com/${value}`;
    default:
      return value;
  }
};

export const PROFILE_DETAIL_LIMITS = {
  institutionMax: 160,
  linkMax: 300,
  languagesMax: 8,
  studyYearMin: 1,
  studyYearMax: 8,
} as const;

export const ProfileLinksSchema = z
  .object(
    Object.fromEntries(
      PROFILE_LINK_KEYS.map((key) => [
        key,
        z.string().max(PROFILE_DETAIL_LIMITS.linkMax).optional(),
      ]),
    ) as Record<ProfileLinkKey, z.ZodOptional<z.ZodString>>,
  )
  .strict()
  .transform((links, ctx) => {
    const normalized: ProfileLinks = {};
    for (const key of PROFILE_LINK_KEYS) {
      const raw = links[key];
      if (raw === undefined || raw.trim() === '') continue;
      const value = normalizeProfileLink(key, raw);
      if (value === null) {
        ctx.addIssue({ code: 'custom', path: [key], message: `Invalid ${key}` });
        continue;
      }
      normalized[key] = value;
    }
    return normalized;
  });

export const ProfileLanguageSchema = z.object({
  code: z.string().regex(/^[a-z]{2,3}$/),
  level: z.nativeEnum(LanguageLevel),
});

export type ProfileLanguage = z.infer<typeof ProfileLanguageSchema>;

export const ProfileLanguagesSchema = z
  .array(ProfileLanguageSchema)
  .max(PROFILE_DETAIL_LIMITS.languagesMax)
  .refine(
    (languages) => new Set(languages.map((language) => language.code)).size === languages.length,
    'Each language can be listed once',
  );

export const CountryCodeSchema = z.string().regex(/^[A-Z]{2}$/);

export const PrivacySettingsSchema = z.object({
  visibility: z.nativeEnum(ProfileVisibility),
  showEmail: z.boolean(),
});

export type PrivacySettingsDto = z.infer<typeof PrivacySettingsSchema>;

export const PublicProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.string(),
  faculty: z.string(),
  department: z.string().nullable(),
  bio: z.string().nullable(),
  skills: z.array(z.string()),
  studyLevel: z.nativeEnum(StudyLevel).nullable(),
  studyYear: z.number().int().nullable(),
  institution: z.string().nullable(),
  country: z.string().nullable(),
  languages: z.array(ProfileLanguageSchema),
  links: z.record(z.string()),
  openTo: z.array(z.nativeEnum(OpenToOption)),
  visibility: z.nativeEnum(ProfileVisibility),
  createdAt: z.string(),
  isOwner: z.boolean(),
  projects: z.array(z.object({ id: z.string(), title: z.string(), status: z.string() })),
  papers: z.array(z.object({ id: z.string(), title: z.string(), createdAt: z.string() })),
});

export type PublicProfileDto = z.infer<typeof PublicProfileSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string(),
  lastUsedAt: z.string(),
  isCurrent: z.boolean(),
});

export type SessionDto = z.infer<typeof SessionSchema>;

export const SAVED_ITEMS_MAX = 200;

export const SavedItemRequestSchema = z.object({
  kind: z.enum(['PUBLICATION', 'PROJECT']),
  refId: z.string().min(1).max(120),
});

export type SavedItemRequestDto = z.infer<typeof SavedItemRequestSchema>;

export const SavedItemSchema = z.object({
  kind: z.enum(['PUBLICATION', 'PROJECT']),
  refId: z.string(),
  createdAt: z.string(),
  project: z.object({ id: z.string(), title: z.string(), status: z.string() }).nullable(),
});

export type SavedItemDto = z.infer<typeof SavedItemSchema>;

export const PEOPLE_PAGE_LIMITS = {
  queryMax: 80,
  pageSizeDefault: 12,
  pageSizeMax: 48,
} as const;

export interface PeopleQuery {
  q?: string;
  openTo?: string;
  faculty?: string;
  studyLevel?: string;
  country?: string;
  language?: string;
  page?: number;
  pageSize?: number;
}

export type PersonSummaryDto = Omit<PublicProfileDto, 'isOwner' | 'projects' | 'papers'>;

export interface PeoplePageDto {
  items: PersonSummaryDto[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
