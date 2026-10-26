import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation, useRouteError } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';
import { defineMessages, useLocalized } from '@/shared/i18n';
import { isStaleChunkError, reloadForStaleChunk } from '@/shared/lib';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { KeyboardShortcuts } from '@/widgets/keyboard-shortcuts';
import { SiteEditorMount } from '@/widgets/site-editor';

const ROUTE_ERROR_MESSAGES = defineMessages({
  en: {
    title: 'Something went wrong',
    description: 'The page failed to load. A new version of the site may have been released.',
    action: 'Reload page',
  },
  uk: {
    title: 'Щось пішло не так',
    description: 'Не вдалося завантажити сторінку. Можливо, вийшла нова версія сайту.',
    action: 'Оновити сторінку',
  },
});

export function RootLayout() {
  const { pathname } = useLocation();
  const acknowledgeSignOut = useSessionStore((state) => state.acknowledgeSignOut);

  useEffect(() => {
    acknowledgeSignOut();
  }, [pathname, acknowledgeSignOut]);

  return (
    <>
      <Outlet />
      <ScrollRestoration />
      <KeyboardShortcuts />
      <SiteEditorMount />
    </>
  );
}

export function RouteFallback() {
  return <div className="min-h-screen bg-viratec-bg" />;
}

export function RouteError() {
  const error = useRouteError();
  const t = useLocalized(ROUTE_ERROR_MESSAGES);

  if (isStaleChunkError(error) && reloadForStaleChunk()) {
    return <RouteFallback />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-viratec-bg px-4 text-center text-white">
      <h1 className="text-3xl font-medium tracking-[-0.02em]">{t.title}</h1>
      <p className="max-w-md text-base text-viratec-light/72">{t.description}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className={linkButtonClassName({ size: 'md' })}
      >
        {t.action}
      </button>
    </main>
  );
}
