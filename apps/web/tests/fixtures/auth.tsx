import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { App } from '../../src/app/App';
import { ProtectedRoute } from '../../src/app/providers/ProtectedRoute';
import { LoginPage } from '../../src/pages/login';
import { RegisterPage } from '../../src/pages/register';
import { refreshSession, useSessionStore } from '../../src/entities/session';
import { useSessions } from '../../src/features/manage-sessions/model/useSessions';
import { api } from '../../src/shared/api/apiClient';
import '../../src/app/styles/index.css';

function PrivatePage() {
  const user = useSessionStore((state) => state.user);
  const location = useLocation();
  const sessions = useSessions();
  // An unscoped private query verifies that identity changes clear the whole cache too.
  const privateData = useQuery({
    queryKey: ['private-test-data'],
    queryFn: () => api.get<{ text: string }>('/private-test-data'),
    staleTime: Infinity,
  });
  return (
    <main>
      <h1>Private destination</h1>
      <p>{location.pathname + location.search}</p>
      <p>{user?.name}</p>
      <p>{privateData.data?.text}</p>
      <ul>
        {sessions.data?.map((session) => (
          <li key={session.id}>{session.ipAddress}</li>
        ))}
      </ul>
      <button onClick={() => void refreshSession()}>Expire session</button>
    </main>
  );
}

const router = createMemoryRouter(
  [
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/forgot-password', element: <h1>Password recovery</h1> },
    {
      path: '/private',
      element: (
        <ProtectedRoute>
          <PrivatePage />
        </ProtectedRoute>
      ),
    },
    { path: '/', element: <h1>Home</h1> },
  ],
  { initialEntries: ['/private?section=security'] },
);

createRoot(document.getElementById('root')!).render(
  <App>
    <RouterProvider router={router} />
  </App>,
);
