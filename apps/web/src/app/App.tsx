import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './providers/query-provider';
import { AppRouter } from './providers/router';
import { Header } from '@/widgets/header/ui/header';
import { Footer } from '@/widgets/footer/ui/footer';

export const App: React.FC = () => {
  return (
    <QueryProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <AppRouter />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryProvider>
  );
};
