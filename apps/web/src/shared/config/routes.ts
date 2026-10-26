export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ACCOUNT: '/account',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_AUDIT: '/admin/audit',
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
