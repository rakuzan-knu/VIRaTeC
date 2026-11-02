import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { hydrate, type DehydratedState } from '@tanstack/react-query';
import { App, queryClient } from './app/App';
import { AppRouter, createAppRouter } from './app/providers/router';
import {
  CLIENT_RENDER_ATTRIBUTE,
  PRERENDERED_PATH_ATTRIBUTE,
  QUERY_STATE_ELEMENT_ID,
} from './shared/config/prerender';
import { beginHydration, loadPlerdy } from './shared/lib';
import './app/styles/index.css';

const container = document.getElementById('root')!;
const documentElement = document.documentElement;
const queryState = document.getElementById(QUERY_STATE_ELEMENT_ID)?.textContent;
if (queryState) hydrate(queryClient, JSON.parse(queryState) as DehydratedState);
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
loadPlerdy();
