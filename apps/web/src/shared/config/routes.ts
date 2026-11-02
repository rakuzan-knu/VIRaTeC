export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  ACCOUNT: '/account',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_AUDIT: '/admin/audit',
  ADMIN_CONTENT: '/admin/content',
  PEOPLE: '/people',
  PERSON: '/people/:userId',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  COOKIES: '/cookies',
  GUIDELINES: '/community-guidelines',
  ABOUT_INITIATIVE: '/about',
  VIRATEC: '/about/viratec',
  GLOBAL_COLLABORATION: '/about/global-collaboration-framework',
  RESEARCH_AREAS: '/research/areas',
  PROJECTS: '/research/projects',
  PROJECT_DETAIL: '/research/projects/:projectId',
  EXPERIENTIAL_LEARNING: '/research/experiential-learning',
  STUDENT_RESEARCH: '/research/student-research',
  PUBLICATIONS: '/publications',
  PUBLICATION_DETAIL: '/publications/:slug',
  OPPORTUNITIES: '/opportunities',
  CONTACT: '/contact',
} as const;

export const ENGLISH_PREFIX = '/en';

export const ENGLISH_ROUTES: readonly string[] = [
  ROUTES.HOME,
  ROUTES.ABOUT_INITIATIVE,
  ROUTES.VIRATEC,
  ROUTES.GLOBAL_COLLABORATION,
  ROUTES.RESEARCH_AREAS,
  ROUTES.PROJECTS,
  ROUTES.PROJECT_DETAIL,
  ROUTES.EXPERIENTIAL_LEARNING,
  ROUTES.STUDENT_RESEARCH,
  ROUTES.PUBLICATIONS,
  ROUTES.PUBLICATION_DETAIL,
  ROUTES.OPPORTUNITIES,
  ROUTES.CONTACT,
  ROUTES.TERMS,
  ROUTES.PRIVACY,
  ROUTES.COOKIES,
  ROUTES.GUIDELINES,
];

const ENGLISH_ROUTE_PATTERNS = ENGLISH_ROUTES.map(
  (route) => new RegExp(`^${route.replace(/:[^/]+/g, '[^/]+')}$`),
);

export const toEnglishPath = (path: string) =>
  path === ROUTES.HOME ? ENGLISH_PREFIX : `${ENGLISH_PREFIX}${path}`;

export const isEnglishPath = (pathname: string) =>
  pathname === ENGLISH_PREFIX || pathname.startsWith(`${ENGLISH_PREFIX}/`);

export const stripEnglishPrefix = (pathname: string) =>
  isEnglishPath(pathname) ? pathname.slice(ENGLISH_PREFIX.length) || ROUTES.HOME : pathname;

export const hasEnglishPage = (pathname: string) =>
  ENGLISH_ROUTE_PATTERNS.some((pattern) => pattern.test(stripEnglishPrefix(pathname)));

export const buildProjectPath = (projectId: string) =>
  ROUTES.PROJECT_DETAIL.replace(':projectId', encodeURIComponent(projectId));

export const buildPublicationPath = (slug: string) =>
  ROUTES.PUBLICATION_DETAIL.replace(':slug', encodeURIComponent(slug));

export const buildPersonPath = (userId: string) =>
  ROUTES.PERSON.replace(':userId', encodeURIComponent(userId));

export const SITE_EDITOR_PARAM = 'edit';

export const SITE_EDITOR_PATH = `/?${SITE_EDITOR_PARAM}=1`;

export const ACCOUNT_SECTION_PARAM = 'section';

export const buildAccountPath = (section?: string) =>
  section
    ? `${ROUTES.ACCOUNT}?${ACCOUNT_SECTION_PARAM}=${encodeURIComponent(section)}`
    : ROUTES.ACCOUNT;
