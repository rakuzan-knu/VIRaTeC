import { useEffect } from 'react';
import {
  createBrowserRouter,
  matchRoutes,
  RouterProvider,
  type RouteObject,
  type RouterNavigateOptions,
  type To,
} from 'react-router-dom';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { RootLayout, RouteError, RouteFallback } from './RootLayout';
import { ROUTES } from '@/shared/config/routes';
import { endHydration } from '@/shared/lib';

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    hydrateFallbackElement: <RouteFallback />,
    errorElement: <RouteError />,
    children: [
      {
        path: ROUTES.HOME,
        lazy: async () => ({ Component: (await import('@/pages/home')).HomePage }),
      },
      {
        path: ROUTES.REGISTER,
        lazy: async () => {
          const { RegisterPage } = await import('@/pages/register');
          return {
            element: (
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            ),
          };
        },
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
        path: ROUTES.ADMIN,
        lazy: async () => {
          const { AdminLayout } = await import('@/pages/admin');
          return {
            element: (
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            ),
          };
        },
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import('@/pages/admin')).AdminDashboardPage }),
          },
          {
            path: ROUTES.ADMIN_USERS,
            lazy: async () => ({ Component: (await import('@/pages/admin')).AdminUsersPage }),
          },
          {
            path: ROUTES.ADMIN_AUDIT,
            lazy: async () => ({ Component: (await import('@/pages/admin')).AdminAuditPage }),
          },
          {
            path: ROUTES.ADMIN_CONTENT,
            lazy: async () => ({ Component: (await import('@/pages/admin')).AdminContentPage }),
          },
        ],
      },
      {
        path: ROUTES.ACCOUNT,
        lazy: async () => {
          const { AccountPage } = await import('@/pages/account');
          return {
            element: (
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: ROUTES.PEOPLE,
        lazy: async () => ({ Component: (await import('@/pages/people')).PeoplePage }),
      },
      {
        path: ROUTES.PERSON,
        lazy: async () => ({ Component: (await import('@/pages/person')).PersonPage }),
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
];

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

type BrowserRouter = ReturnType<typeof createBrowserRouter>;

const prefetchedPaths = new Set<string>();

function prefetchRoute(pathname: string) {
  if (prefetchedPaths.has(pathname)) return;
  prefetchedPaths.add(pathname);

  for (const { route } of matchRoutes(routes, pathname) ?? []) {
    if (typeof route.lazy === 'function') {
      route.lazy().catch(() => prefetchedPaths.delete(pathname));
    }
  }
}

function handleNavigationIntent(event: Event) {
  if (!(event.target instanceof Element)) return;
  const anchor = event.target.closest('a[href]');
  if (!(anchor instanceof HTMLAnchorElement) || anchor.origin !== window.location.origin) return;
  if (anchor.pathname === window.location.pathname) return;
  prefetchRoute(anchor.pathname);
}

async function resolveLazyMatches(pathname: string) {
  await Promise.all(
    (matchRoutes(routes, pathname) ?? []).map(async ({ route }) => {
      if (typeof route.lazy !== 'function') return;
      Object.assign(route, await route.lazy(), { lazy: undefined });
    }),
  );
}

export async function createAppRouter({ hydrate }: { hydrate: boolean }): Promise<BrowserRouter> {
  if (hydrate) await resolveLazyMatches(window.location.pathname);

  const router = createBrowserRouter(routes);
  const baseNavigate = router.navigate.bind(router);

  router.navigate = ((to: To | number | null, opts?: RouterNavigateOptions) =>
    typeof to === 'number'
      ? baseNavigate(to)
      : baseNavigate(to, { viewTransition: true, ...opts })) as typeof router.navigate;

  return router;
}

interface AppRouterProps {
  router: BrowserRouter;
}

export function AppRouter({ router }: AppRouterProps) {
  useEffect(() => {
    endHydration();
    if ((navigator as NavigatorWithConnection).connection?.saveData === true) return;

    document.addEventListener('pointerover', handleNavigationIntent, { passive: true });
    document.addEventListener('focusin', handleNavigationIntent);
    return () => {
      document.removeEventListener('pointerover', handleNavigationIntent);
      document.removeEventListener('focusin', handleNavigationIntent);
    };
  }, []);

  return <RouterProvider router={router} />;
}
