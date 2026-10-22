import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AuthNavigationState } from '../lib/authNavigation';
import { useSessionStore } from './store';

export interface EndSessionTarget {
  to: string;
  state?: AuthNavigationState;
}

export function useEndSession() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useSessionStore((state) => state.clearSession);

  return useCallback(
    ({ to, state }: EndSessionTarget) => {
      clearSession({ signedOut: true });
      queryClient.clear();
      navigate(to, { replace: true, state, viewTransition: false });
    },
    [clearSession, navigate, queryClient],
  );
}
