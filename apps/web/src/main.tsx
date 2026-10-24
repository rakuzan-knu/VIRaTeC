import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app/App';
import { AppRouter, createAppRouter } from './app/providers/router';
import { CLIENT_RENDER_ATTRIBUTE, PRERENDERED_PATH_ATTRIBUTE } from './shared/config/prerender';
import { beginHydration } from './shared/lib';
import './app/styles/index.css';

const container = document.getElementById('root')!;
const documentElement = document.documentElement;
const canHydrate =
  container.getAttribute(PRERENDERED_PATH_ATTRIBUTE) === window.location.pathname &&
  !documentElement.hasAttribute(CLIENT_RENDER_ATTRIBUTE);

if (canHydrate) {
  beginHydration();
} else {
  container.replaceChildren();
  documentElement.removeAttribute(CLIENT_RENDER_ATTRIBUTE);
}

async function start() {
  const router = await createAppRouter({ hydrate: canHydrate });
  const app = (
    <StrictMode>
      <App>
        <AppRouter router={router} />
      </App>
    </StrictMode>
  );

  if (canHydrate) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
}

void start();
