import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './providers/router';
import { SessionProvider } from './providers/SessionProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AppRouter />
      </SessionProvider>
    </QueryClientProvider>
  );
}
