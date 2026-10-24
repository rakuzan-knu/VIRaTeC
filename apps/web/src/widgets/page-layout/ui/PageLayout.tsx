import { useRef, type ReactNode } from 'react';
import { usePauseOffscreen, useScrollReveal } from '@/shared/lib';
import { SiteFooter } from '@/widgets/site-footer';

interface PageLayoutProps {
  intro: ReactNode;
  children: ReactNode;
}

export function PageLayout({ intro, children }: PageLayoutProps) {
  const mainRef = useRef<HTMLElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  useScrollReveal(mainRef);
  usePauseOffscreen(skyRef);

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-viratec-bg font-viratec">
      <div ref={skyRef} aria-hidden="true" className="page-sky">
        <span className="page-sky-aurora" />
        <span className="page-sky-stars page-sky-far" />
        <span className="page-sky-stars page-sky-mid" />
        <span className="page-sky-stars page-sky-near" />
        <span className="page-sky-stars page-sky-bright" />
        <span className="page-sky-shooting" />
      </div>
      <div aria-hidden="true" className="page-ambient" />
      {intro}
      <main ref={mainRef}>{children}</main>
      <SiteFooter />
      <div aria-hidden="true" className="field-grain" />
    </div>
  );
}
