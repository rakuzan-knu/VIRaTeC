export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  COOKIES: '/cookies',
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
