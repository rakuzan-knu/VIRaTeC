import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { readAuthNavigationState, useSessionStore } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { Redirect } from './Redirect';

interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const location = useLocation();
  const hasSession = useSessionStore((state) => state.hasSession);

  const { from, addAccount } = readAuthNavigationState(location.state);

  if (hasSession && !addAccount) {
    return <Redirect to={from ?? ROUTES.HOME} />;
  }

  return <>{children}</>;
}
