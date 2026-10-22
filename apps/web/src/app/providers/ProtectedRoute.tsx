import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { Redirect } from './Redirect';
import { RouteError, RouteFallback } from './RootLayout';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const hasSession = useSessionStore((state) => state.hasSession);
  const hasUser = useSessionStore((state) => state.user !== null);
  const isRestoring = useSessionStore((state) => state.isRestoring);
  const hasSignedOut = useSessionStore((state) => state.hasSignedOut);

  if (!hasSession && hasSignedOut) return <RouteFallback />;

  if (!hasSession) {
    return (
      <Redirect to={ROUTES.LOGIN} state={{ from: `${location.pathname}${location.search}` }} />
    );
  }

  if (!hasUser) return isRestoring ? <RouteFallback /> : <RouteError />;

  return <>{children}</>;
}
