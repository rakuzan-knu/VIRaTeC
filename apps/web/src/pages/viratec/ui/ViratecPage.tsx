import { ROUTES } from '@/shared/config/routes';
import { useCommonMessages, useLocalized } from '@/shared/i18n';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList } from '@/shared/ui/steps-list';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { VIRATEC_CONTENT } from '../model/content';
import { IntroVideo } from './IntroVideo';
import introVideoWebm from '../assets/what-is-viratec.webm';
import introVideoMp4 from '../assets/what-is-viratec.mp4';
import introVideoPoster from '../assets/what-is-viratec-poster.webp';
import { JourneyTimeline } from './JourneyTimeline';
import { useDocumentTitle } from '@/shared/lib';

export function ViratecPage() {
  const content = useLocalized(VIRATEC_CONTENT);
  const common = useCommonMessages();
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
      <PageSection aria-labelledby="what-is-title">
        <SectionHeader
          id="what-is-title"
          eyebrow={content.whatIsEyebrow}
          title={content.whatIsTitle}
        />
        <p className="text-base leading-6 text-viratec-muted lg:max-w-[760px] lg:text-lg lg:leading-7">
          {content.whatIsDescription}
        </p>
        <IntroVideo
          title={content.videoTitle}
          duration="1:30"
          poster={introVideoPoster}
          sources={[
            { src: introVideoWebm, type: 'video/webm' },
            { src: introVideoMp4, type: 'video/mp4' },
          ]}
        />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 lg:flex lg:justify-between">
          {content.stats.map((stat) => (
            <li key={stat.label} className="flex flex-col gap-1">
              <span className="text-[36px] leading-[42px] text-[#b5fa66] lg:text-5xl lg:leading-[54px]">
                {stat.value}
              </span>
              <span className="text-sm leading-5 text-viratec-soft">{stat.label}</span>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection tone="surface" aria-labelledby="journey-title">
        <SectionHeader
          id="journey-title"
          eyebrow={content.journeyEyebrow}
          title={content.journeyTitle}
          accent={content.journeyAccent}
        />
        <JourneyTimeline milestones={content.milestones} />
      </PageSection>

      <PageSection aria-labelledby="participants-title">
        <SectionHeader
          id="participants-title"
          eyebrow={content.participantsEyebrow}
          title={content.participantsTitle}
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.participants.map((participant, index) => (
            <li key={participant.title}>
              <InfoCard
                index={String(index + 1).padStart(2, '0')}
                title={participant.title}
                description={participant.description}
                className="lg:min-h-[204px]"
              />
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection tone="surface" aria-labelledby="coil-title">
        <SectionHeader
          id="coil-title"
          eyebrow={content.coilEyebrow}
          title={content.coilTitle}
          description={content.coilDescription}
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {content.principles.map((principle) => (
            <li key={principle.title}>
              <InfoCard
                withImage
                title={principle.title}
                description={principle.description}
                linkLabel={common.learnMore}
                to={principle.to}
                className="lg:min-h-[433px]"
              />
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection aria-labelledby="join-title">
        <SectionHeader
          id="join-title"
          eyebrow={content.joinEyebrow}
          title={content.joinTitle}
          accent={content.joinAccent}
        />
        <StepsList steps={content.joinSteps} />
      </PageSection>

      <CtaSection
        tone="surface"
        title={content.ctaTitle}
        description={content.ctaDescription}
        action={{ label: common.seeOpportunities, to: ROUTES.OPPORTUNITIES }}
      />
    </PageLayout>
  );
}
