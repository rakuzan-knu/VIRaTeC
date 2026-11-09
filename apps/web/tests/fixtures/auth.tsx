import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { App } from '../../src/app/App';
import { ProtectedRoute } from '../../src/app/providers/ProtectedRoute';
import { TermsGate } from '../../src/app/providers/TermsGate';
import { ChangeEmailForm } from '../../src/features/change-email';
import { DeleteAccountForm } from '../../src/features/delete-account';
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

function AccountControlsPage() {
  const user = useSessionStore((state) => state.user);
  if (!user) return null;
  return (
    <main>
      <h1>Account controls</h1>
      <ChangeEmailForm account={user} />
      <DeleteAccountForm
        email={user.email}
        hasPassword={user.hasPassword}
        twoFactorEnabled={user.twoFactorEnabled}
      />
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
    {
      path: '/account-controls',
      element: (
        <ProtectedRoute>
          <TermsGate />
          <AccountControlsPage />
        </ProtectedRoute>
      ),
    },
    { path: '/', element: <h1>Home</h1> },
  ],
  {
    initialEntries: [
      new URLSearchParams(window.location.search).get('start') ?? '/private?section=security',
    ],
  },
);

createRoot(document.getElementById('root')!).render(
  <App>
    <RouterProvider router={router} />
  </App>,
);
