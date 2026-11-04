import { useRef, type ReactNode } from 'react';
import { useCommonMessages } from '@/shared/i18n';
import { usePauseOffscreen, useScrollReveal } from '@/shared/lib';

const MAIN_CONTENT_ID = 'main-content';

interface PageLayoutProps {
  header: ReactNode;
  intro: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export function PageLayout({ header, intro, footer, children }: PageLayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const common = useCommonMessages();
  useScrollReveal(contentRef);
  usePauseOffscreen(skyRef);

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-viratec-bg font-viratec">
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="sr-only rounded-full bg-viratec-lime text-sm font-medium text-viratec-ink focus:not-sr-only focus:fixed focus:px-5 focus:py-3 focus:top-3 focus:left-3 focus:z-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
      >
        {common.skipToContent}
      </a>
      <div ref={skyRef} aria-hidden="true" className="page-sky">
        <span className="page-sky-aurora" />
        <span className="page-sky-stars page-sky-far" />
        <span className="page-sky-stars page-sky-mid" />
        <span className="page-sky-stars page-sky-near" />
        <span className="page-sky-stars page-sky-bright" />
        <span className="page-sky-shooting" />
      </div>
      <div aria-hidden="true" className="page-ambient" />
      {header}
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="outline-none">
        {intro}
        <div ref={contentRef}>{children}</div>
      </main>
      {footer}
      <div aria-hidden="true" className="field-grain" />
    </div>
  );
}
