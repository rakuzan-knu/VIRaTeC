import { prerender } from 'react-dom/static';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom';
import { QueryClient, dehydrate, type DehydratedState } from '@tanstack/react-query';
import type { PublicationDto } from '@viratec/contracts';
import { App } from './app/App';
import { routes } from './app/providers/router';
import { projectKeys, type Project } from './entities/project';
import { publicationKeys } from './entities/publication';
import { ROUTES, buildProjectPath } from './shared/config/routes';

const PRERENDER_ORIGIN = 'http://prerender.local';

export interface PrerenderData {
  publications: PublicationDto[];
  projects: Project[];
}

export interface PrerenderResult {
  markup: string;
  queryState: DehydratedState | null;
}

function seedQueries(client: QueryClient, pathname: string, data: PrerenderData) {
  const isPublications =
    pathname === ROUTES.PUBLICATIONS || pathname.startsWith(`${ROUTES.PUBLICATIONS}/`);
  if (isPublications && data.publications.length > 0) {
    client.setQueryData(publicationKeys.all, data.publications);
  } else if (pathname === ROUTES.PROJECTS && data.projects.length > 0) {
    client.setQueryData(projectKeys.list(), data.projects);
  } else if (pathname.startsWith(`${ROUTES.PROJECTS}/`)) {
    const project = data.projects.find((item) => buildProjectPath(item.id) === pathname);
    if (project) client.setQueryData(projectKeys.detail(project.id), project);
  }
}

export async function render(pathname: string, data: PrerenderData): Promise<PrerenderResult> {
  const { query, dataRoutes } = createStaticHandler(routes);
  const context = await query(new Request(new URL(pathname, PRERENDER_ORIGIN)));
  if (context instanceof Response) {
    throw new Error(`Prerender of ${pathname} returned HTTP ${context.status}`);
  }

  const client = new QueryClient();
  seedQueries(client, pathname, data);

  const router = createStaticRouter(dataRoutes, context);
  const { prelude } = await prerender(
    <App client={client}>
      <StaticRouterProvider router={router} context={context} hydrate={false} />
    </App>,
  );
  const markup = await new Response(prelude).text();
  const queryState = dehydrate(client);
  return { markup, queryState: queryState.queries.length > 0 ? queryState : null };
}
