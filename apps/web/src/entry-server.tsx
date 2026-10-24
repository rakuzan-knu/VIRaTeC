import { prerender } from 'react-dom/static';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom';
import { App } from './app/App';
import { routes } from './app/providers/router';

const PRERENDER_ORIGIN = 'http://prerender.local';

export async function render(pathname: string): Promise<string> {
  const { query, dataRoutes } = createStaticHandler(routes);
  const context = await query(new Request(new URL(pathname, PRERENDER_ORIGIN)));
  if (context instanceof Response) {
    throw new Error(`Prerender of ${pathname} returned HTTP ${context.status}`);
  }

  const router = createStaticRouter(dataRoutes, context);
  const { prelude } = await prerender(
    <App>
      <StaticRouterProvider router={router} context={context} hydrate={false} />
    </App>,
  );
  return new Response(prelude).text();
}
