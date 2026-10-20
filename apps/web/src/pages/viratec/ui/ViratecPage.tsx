import { ROUTES } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { StepsList } from '@/shared/ui/steps-list';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { JOIN_STEPS, MILESTONES, PARTICIPANTS, PRINCIPLES, STATS } from '../model/content';
import { IntroVideo } from './IntroVideo';
import introVideoWebm from '../assets/what-is-viratec.webm';
import introVideoMp4 from '../assets/what-is-viratec.mp4';
import introVideoPoster from '../assets/what-is-viratec-poster.webp';
import { JourneyTimeline } from './JourneyTimeline';

export function ViratecPage() {
  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={['About', 'VIRaTeC']}
          title="One community,"
          accent="many countries."
          description="VIRaTeC — Virtual Innovative Research & Technology Community. Students, educators, researchers and innovators connected through AI, EdTech and international collaboration."
        />
      }
    >
      <PageSection aria-labelledby="what-is-title">
        <SectionHeader id="what-is-title" eyebrow="What is VIRaTeC" title="What is VIRaTeC?" />
        <p className="text-base leading-6 text-viratec-muted lg:max-w-[760px] lg:text-lg lg:leading-7">
          Watch how students, educators and researchers from 16 universities in 11 countries learn
          and do research together, online and across borders.
        </p>
        <IntroVideo
          title="What is VIRaTeC?"
          duration="1:30"
          poster={introVideoPoster}
          sources={[
            { src: introVideoWebm, type: 'video/webm' },
            { src: introVideoMp4, type: 'video/mp4' },
          ]}
        />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 lg:flex lg:justify-between">
          {STATS.map((stat) => (
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
          eyebrow="Our journey"
          title="From an idea"
          accent="to a global community"
        />
        <JourneyTimeline milestones={MILESTONES} />
      </PageSection>

      <PageSection aria-labelledby="participants-title">
        <SectionHeader
          id="participants-title"
          eyebrow="Who takes part"
          title="People behind the community"
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PARTICIPANTS.map((participant, index) => (
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
          eyebrow="COIL format"
          title="How we work"
          description="Every VIRaTeC activity follows three principles that turn learning into real results."
        />
        <ul className="grid gap-6 lg:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <li key={principle.title}>
              <InfoCard
                withImage
                title={principle.title}
                description={principle.description}
                linkLabel="Learn more →"
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
          eyebrow="How to join"
          title="Become part"
          accent="of VIRaTeC"
        />
        <StepsList steps={JOIN_STEPS} />
      </PageSection>

      <CtaSection
        tone="surface"
        title="Ready to join VIRaTeC?"
        description="Find a program, a project or a workshop that fits you and become part of the community."
        action={{ label: 'See opportunities', to: ROUTES.OPPORTUNITIES }}
      />
    </PageLayout>
  );
}
