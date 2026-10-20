import { Outlet, ScrollRestoration } from 'react-router-dom';

export function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}

export function RouteFallback() {
  return <div className="min-h-screen bg-viratec-bg" />;
}
