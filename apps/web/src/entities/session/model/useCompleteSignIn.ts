import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isMfaRequired, type SignInResponseDto } from '@viratec/contracts';
import { ROUTES } from '@/shared/config/routes';
import { readAuthNavigationState } from '../lib/authNavigation';
import { useSessionStore } from './store';

export function useCompleteSignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useSessionStore((state) => state.setSession);
  const requireSecondFactor = useSessionStore((state) => state.requireSecondFactor);

  return useCallback(
    (response: SignInResponseDto) => {
      const { from } = readAuthNavigationState(location.state);
      if (isMfaRequired(response)) {
        requireSecondFactor();
        if (location.pathname !== ROUTES.LOGIN) {
          navigate(ROUTES.LOGIN, { replace: true, state: { from } });
        }
        return;
      }
      setSession(response.user);
      navigate(from ?? ROUTES.HOME, { replace: true });
    },
    [location.pathname, location.state, navigate, requireSecondFactor, setSession],
  );
}
