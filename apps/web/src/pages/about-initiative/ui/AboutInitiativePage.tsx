import { ROUTES } from '@/shared/config/routes';
import { useLocalized } from '@/shared/i18n';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList } from '@/shared/ui/steps-list';
import { PersonCard } from '@/shared/ui/person-card';
import { CtaSection } from '@/shared/ui/cta-section';
import { ExpandableText } from '@/shared/ui/expandable-text';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { ABOUT_INITIATIVE_CONTENT } from '../model/content';
import { useDocumentTitle } from '@/shared/lib';

export function AboutInitiativePage() {
  const content = useLocalized(ABOUT_INITIATIVE_CONTENT);
  useDocumentTitle(content.documentTitle);

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
      <PageSection aria-labelledby="mission-title">
        <SectionHeader
          id="mission-title"
          eyebrow={content.missionEyebrow}
          title={content.missionTitle}
        />
        <div className="flex flex-col gap-7 lg:flex-row lg:gap-16">
          {content.missionVision.map((item) => (
            <div key={item.label} className="flex flex-col items-start gap-3.5 lg:flex-1">
              <h3 className="text-[15px] leading-5 font-medium text-viratec-accent lg:text-[17px] lg:leading-6">
                {item.label}
              </h3>
              <ExpandableText className="font-display text-[22px] leading-[30px] tracking-[-0.02em] text-white lg:text-[30px] lg:leading-[40px]">
                {item.text}
              </ExpandableText>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection tone="surface" aria-labelledby="values-title">
        <SectionHeader
          id="values-title"
          eyebrow={content.valuesEyebrow}
          title={content.valuesTitle}
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.values.map((value, index) => (
            <li key={value.title}>
              <InfoCard
                index={String(index + 1).padStart(2, '0')}
                title={value.title}
                description={value.description}
                className="lg:min-h-[180px]"
              />
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection aria-labelledby="philosophy-title">
        <SectionHeader
          id="philosophy-title"
          eyebrow={content.philosophyEyebrow}
          title={content.philosophyTitle}
        />
        <StepsList steps={content.philosophy} />
      </PageSection>

      <PageSection tone="surface" aria-labelledby="team-title">
        <SectionHeader
          id="team-title"
          eyebrow={content.teamEyebrow}
          title={content.teamTitle}
          accent={content.teamAccent}
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.team.map((member) => (
            <li key={member.name}>
              <PersonCard name={member.name} role={member.role} photo={member.photo} />
            </li>
          ))}
        </ul>
      </PageSection>

      <CtaSection
        title={content.ctaTitle}
        description={content.ctaDescription}
        action={{ label: content.ctaAction, to: ROUTES.VIRATEC }}
      />
    </PageLayout>
  );
}
