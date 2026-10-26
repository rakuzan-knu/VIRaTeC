import { ROUTES } from '@/shared/config/routes';
import { useCommonMessages } from '@/shared/i18n';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList } from '@/shared/ui/steps-list';
import { HighlightBanner } from '@/shared/ui/highlight-banner';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { PageSections } from '@/widgets/page-sections';
import { useSeo } from '@/shared/lib';
import { useStudentResearchContent } from '../model/content';
export function StudentResearchPage() {
  const content = useStudentResearchContent();
  const common = useCommonMessages();
  useSeo(content.documentTitle);

  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={content.breadcrumb}
          title={content.title}
          accent={content.accent}
          description={content.description}
        />
      }
    >
      <PageSections
        page="STUDENT_RESEARCH"
        sections={{
          intro: (
            <PageSection>
              <HighlightBanner
                title={content.bannerTitle}
                description={content.bannerDescription}
                stats={content.stats}
              />
            </PageSection>
          ),
          projects: (
            <PageSection tone="surface" aria-labelledby="student-projects-title">
              <SectionHeader
                id="student-projects-title"
                eyebrow={content.projectsEyebrow}
                title={content.projectsTitle}
                description={content.projectsDescription}
              />
              <ul className="grid gap-6 lg:grid-cols-3">
                {content.projects.map((project) => (
                  <li key={project.title}>
                    <InfoCard
                      image={project.image}
                      title={project.title}
                      description={project.description}
                      linkLabel={common.viewProject}
                      to={ROUTES.PROJECTS}
                      className="lg:min-h-[433px]"
                    />
                  </li>
                ))}
              </ul>
            </PageSection>
          ),
          start: (
            <PageSection aria-labelledby="start-title">
              <SectionHeader
                id="start-title"
                eyebrow={content.startEyebrow}
                title={content.startTitle}
                accent={content.startAccent}
              />
              <StepsList steps={content.startSteps} />
            </PageSection>
          ),
          cta: (
            <CtaSection
              tone="surface"
              title={content.ctaTitle}
              description={content.ctaDescription}
              action={{ label: content.ctaAction, to: ROUTES.CONTACT }}
            />
          ),
        }}
      />
    </PageLayout>
  );
}
