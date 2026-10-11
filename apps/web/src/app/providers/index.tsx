import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { configureApiClient } from '@/shared';
import { useSessionStore, getMe } from '@/entities/session';
import { router } from '../router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inject session store handlers into shared API client without layer violations
    configureApiClient({
      getAccessToken: () => useSessionStore.getState().accessToken,
      getRefreshToken: () => useSessionStore.getState().refreshToken,
      onTokensRefreshed: (tokens) => useSessionStore.getState().setTokens(tokens),
      onUnauthorized: () => useSessionStore.getState().clearSession(),
    });

    // Restore session on application load
    const token = useSessionStore.getState().accessToken;
    if (token) {
      getMe()
        .then((user) => {
          useSessionStore.setState((state) => ({ ...state, user, isInitialized: true }));
        })
        .catch(() => {
          useSessionStore.getState().clearSession();
        })
        .finally(() => setLoading(false));
    } else {
      useSessionStore.getState().setInitialized(true);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a1628]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
