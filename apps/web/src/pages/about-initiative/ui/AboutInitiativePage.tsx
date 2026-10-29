import { ROUTES } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList } from '@/shared/ui/steps-list';
import { PersonCard } from '@/shared/ui/person-card';
import { CtaSection } from '@/shared/ui/cta-section';
import { ResponsiveImage } from '@/shared/ui/responsive-image';
import { ExpandableText } from '@/shared/ui/expandable-text';
import { PageIntro } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { PageLayout } from '@/widgets/page-layout';
import { PageSections } from '@/widgets/page-sections';
import { SiteFooter } from '@/widgets/site-footer';
import { useAboutInitiativeContent } from '../model/content';
import { useSeo } from '@/shared/lib';

export function AboutInitiativePage() {
  const content = useAboutInitiativeContent();
  useSeo(content.documentTitle);

  return (
    <PageLayout
      footer={<SiteFooter />}
      intro={
        <PageIntro
          header={<SiteHeader />}
          breadcrumb={content.breadcrumb}
          title={content.title}
          accent={content.accent}
          description={content.description}
        />
      }
    >
      <PageSections
        page="ABOUT_INITIATIVE"
        sections={{
          mission: (
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
          ),
          values: (
            <PageSection tone="surface" aria-labelledby="values-title">
              <SectionHeader
                id="values-title"
                eyebrow={content.valuesEyebrow}
                title={content.valuesTitle}
              />
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {content.values.map((value) => (
                  <li key={value.title}>
                    <InfoCard
                      title={value.title}
                      description={value.description}
                      className="lg:min-h-[180px]"
                    />
                  </li>
                ))}
              </ul>
            </PageSection>
          ),
          philosophy: (
            <PageSection aria-labelledby="philosophy-title">
              <SectionHeader
                id="philosophy-title"
                eyebrow={content.philosophyEyebrow}
                title={content.philosophyTitle}
              />
              <StepsList steps={content.philosophy} />
            </PageSection>
          ),
          founder: (
            <PageSection tone="surface" aria-labelledby="founder-title">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
                <ResponsiveImage
                  src={content.founderPhoto}
                  sizes="(min-width: 1024px) 320px, 160px"
                  faceCrop={1}
                  alt={content.founderName}
                  width={320}
                  height={320}
                  loading="lazy"
                  className="size-40 shrink-0 rounded-[28px] object-cover lg:size-80 lg:rounded-[36px]"
                />
                <div className="flex flex-col gap-5">
                  <SectionHeader
                    id="founder-title"
                    eyebrow={content.founderEyebrow}
                    title={content.founderName}
                  />
                  <p className="text-[15px] leading-[22px] font-medium text-viratec-accent lg:text-[17px] lg:leading-6">
                    {content.founderRole}
                  </p>
                  {content.founderBio.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-base leading-[26px] text-viratec-muted lg:text-lg lg:leading-7"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </PageSection>
          ),
          team: (
            <PageSection aria-labelledby="team-title">
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
          ),
          cta: (
            <CtaSection
              title={content.ctaTitle}
              description={content.ctaDescription}
              action={{ label: content.ctaAction, to: ROUTES.VIRATEC }}
            />
          ),
        }}
      />
    </PageLayout>
  );
}
