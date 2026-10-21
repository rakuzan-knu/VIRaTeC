import {
  createBrowserRouter,
  RouterProvider,
  type RouterNavigateOptions,
  type To,
} from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { RegisterPage } from '@/pages/register';
import { GuestRoute } from './GuestRoute';
import { RootLayout, RouteFallback } from './RootLayout';
import { ROUTES } from '@/shared/config/routes';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    hydrateFallbackElement: <RouteFallback />,
    children: [
      {
        path: ROUTES.HOME,
        element: <HomePage />,
      },
      {
        path: ROUTES.REGISTER,
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      {
        path: ROUTES.LOGIN,
        lazy: async () => {
          const { LoginPage } = await import('@/pages/login');
          return {
            element: (
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        lazy: async () => {
          const { ForgotPasswordPage } = await import('@/pages/forgot-password');
          return {
            element: (
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.ABOUT_INITIATIVE,
        lazy: async () => ({
          Component: (await import('@/pages/about-initiative')).AboutInitiativePage,
        }),
      },
      {
        path: ROUTES.VIRATEC,
        lazy: async () => ({ Component: (await import('@/pages/viratec')).ViratecPage }),
      },
      {
        path: ROUTES.GLOBAL_COLLABORATION,
        lazy: async () => ({
          Component: (await import('@/pages/global-collaboration')).GlobalCollaborationPage,
        }),
      },
      {
        path: ROUTES.RESEARCH_AREAS,
        lazy: async () => ({
          Component: (await import('@/pages/research-areas')).ResearchAreasPage,
        }),
      },
      {
        path: ROUTES.PROJECTS,
        lazy: async () => ({ Component: (await import('@/pages/projects')).ProjectsPage }),
      },
      {
        path: ROUTES.PROJECT_DETAIL,
        lazy: async () => ({
          Component: (await import('@/pages/project-detail')).ProjectDetailPage,
        }),
      },
      {
        path: ROUTES.EXPERIENTIAL_LEARNING,
        lazy: async () => ({
          Component: (await import('@/pages/experiential-learning')).ExperientialLearningPage,
        }),
      },
      {
        path: ROUTES.STUDENT_RESEARCH,
        lazy: async () => ({
          Component: (await import('@/pages/student-research')).StudentResearchPage,
        }),
      },
      {
        path: ROUTES.PUBLICATIONS,
        lazy: async () => ({ Component: (await import('@/pages/publications')).PublicationsPage }),
      },
      {
        path: ROUTES.PUBLICATION_DETAIL,
        lazy: async () => ({
          Component: (await import('@/pages/publication-detail')).PublicationDetailPage,
        }),
      },
      {
        path: ROUTES.OPPORTUNITIES,
        lazy: async () => ({
          Component: (await import('@/pages/opportunities')).OpportunitiesPage,
        }),
      },
      {
        path: ROUTES.CONTACT,
        lazy: async () => ({ Component: (await import('@/pages/contact')).ContactPage }),
      },
      {
        path: ROUTES.TERMS,
        lazy: async () => {
          const { LegalPage } = await import('@/pages/legal');
          return { element: <LegalPage kind="terms" /> };
        },
      },
      {
        path: ROUTES.PRIVACY,
        lazy: async () => {
          const { LegalPage } = await import('@/pages/legal');
          return { element: <LegalPage kind="privacy" /> };
        },
      },
      {
        path: ROUTES.COOKIES,
        lazy: async () => {
          const { LegalPage } = await import('@/pages/legal');
          return { element: <LegalPage kind="cookies" /> };
        },
      },
      {
        path: ROUTES.GUIDELINES,
        lazy: async () => {
          const { LegalPage } = await import('@/pages/legal');
          return { element: <LegalPage kind="guidelines" /> };
        },
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/not-found')).NotFoundPage }),
      },
    ],
  },
]);

const baseNavigate = router.navigate.bind(router);

router.navigate = ((to: To | number | null, opts?: RouterNavigateOptions) =>
  typeof to === 'number'
    ? baseNavigate(to)
    : baseNavigate(to, { viewTransition: true, ...opts })) as typeof router.navigate;

export function AppRouter() {
  return <RouterProvider router={router} />;
}
