import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RegisterPage } from '@/pages/register';
import { GuestRoute } from './GuestRoute';
import { ROUTES } from '@/shared/config/routes';

const router = createBrowserRouter([
  {
    path: ROUTES.REGISTER,
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    path: ROUTES.HOME,
    element: (
      <div className="min-h-screen flex items-center justify-center text-slate-800">
        <h1 className="text-2xl font-bold">Home Page</h1>
      </div>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
