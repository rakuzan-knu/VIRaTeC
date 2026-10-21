import { PageLayout } from '@/widgets/page-layout';
import { HeroSection } from './HeroSection';
import { AboutSection } from './AboutSection';
import { ResearchSection } from './ResearchSection';
import { PublicationsSection } from './PublicationsSection';
import { GetInvolvedSection } from './GetInvolvedSection';
import { useDocumentTitle } from '@/shared/lib';

export function HomePage() {
  useDocumentTitle();

  return (
    <PageLayout intro={<HeroSection />}>
      <AboutSection />
      <ResearchSection />
      <PublicationsSection />
      <GetInvolvedSection />
    </PageLayout>
  );
}
