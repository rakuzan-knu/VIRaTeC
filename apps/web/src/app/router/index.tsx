import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/shared';
import { LoginPage } from '@/pages/login';
import { GuestRoute, ProtectedRoute } from './guards';

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: ROUTES.HOME,
    element: (
      <ProtectedRoute>
        <div className="p-8 text-xl font-bold">VIRaTeC Dashboard (Protected)</div>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.HOME} replace />,
  },
]);
