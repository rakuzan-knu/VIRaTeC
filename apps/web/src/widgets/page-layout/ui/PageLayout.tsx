import type { ReactNode } from 'react';
import { SiteFooter } from '@/widgets/site-footer';

interface PageLayoutProps {
  intro: ReactNode;
  children: ReactNode;
}

export function PageLayout({ intro, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-viratec-bg font-viratec">
      {intro}
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
