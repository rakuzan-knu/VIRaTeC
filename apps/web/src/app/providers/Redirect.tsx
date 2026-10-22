import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthNavigationState } from '@/entities/session';
import { RouteFallback } from './RootLayout';

interface RedirectProps {
  to: string;
  state?: AuthNavigationState;
}

export function Redirect({ to, state }: RedirectProps) {
  const navigate = useNavigate();
  const from = state?.from;

  useEffect(() => {
    navigate(to, { replace: true, state: from ? { from } : undefined, viewTransition: false });
  }, [to, from, navigate]);

  return <RouteFallback />;
}
