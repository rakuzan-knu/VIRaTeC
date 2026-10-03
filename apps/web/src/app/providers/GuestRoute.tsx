import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';

interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const token = useSessionStore((state) => state.token);

  // Якщо користувач вже авторизований — перенаправляємо на головну
  if (token) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}
