import { lazy, Suspense } from 'react';
import { PageLayout } from '@/widgets/page-layout';
import { PageSections } from '@/widgets/page-sections';
import { HeroSection } from './HeroSection';
import { useSeo } from '@/shared/lib';

const AboutSection = lazy(async () => ({ default: (await import('./AboutSection')).AboutSection }));
const ResearchSection = lazy(async () => ({
  default: (await import('./ResearchSection')).ResearchSection,
}));
const PublicationsSection = lazy(async () => ({
  default: (await import('./PublicationsSection')).PublicationsSection,
}));
const GetInvolvedSection = lazy(async () => ({
  default: (await import('./GetInvolvedSection')).GetInvolvedSection,
}));

export function HomePage() {
  useSeo();

  return (
    <PageLayout intro={<HeroSection />}>
      <Suspense fallback={<div className="min-h-screen" />}>
        <PageSections
          page="HOME"
          sections={{
            about: <AboutSection />,
            research: <ResearchSection />,
            publications: <PublicationsSection />,
            getInvolved: <GetInvolvedSection />,
          }}
        />
      </Suspense>
    </PageLayout>
  );
}
