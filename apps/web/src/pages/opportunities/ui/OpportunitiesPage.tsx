import { ROUTES } from '@/shared/config/routes';
import { cn, useSeo } from '@/shared/lib';
import { useCommonMessages } from '@/shared/i18n';
import { OpportunityCard } from '@/shared/ui/opportunity-card';
import { StepsList } from '@/shared/ui/steps-list';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { PageLayout } from '@/widgets/page-layout';
import { PageSections } from '@/widgets/page-sections';
import { SiteFooter } from '@/widgets/site-footer';
import {
  AUDIENCE_SECTION_IDS,
  useOpportunitiesContent,
  type AudienceGroup,
  type Opportunity,
} from '../model/content';
import { useActiveSection } from '../lib/useActiveSection';
import { useUpcomingEvents } from '../model/useUpcomingEvents';

const SECTION_TITLE_CLASS =
  'font-display text-[30px] leading-[36px] font-medium tracking-[-0.025em] text-white lg:text-[44px] lg:leading-[50px]';

function RoleTabs({ label, groups }: { label: string; groups: AudienceGroup[] }) {
  const activeId = useActiveSection(AUDIENCE_SECTION_IDS);

  return (
    <nav aria-label={label} className="w-full pt-3">
      <ul className="flex flex-wrap gap-2.5">
        {groups.map((group) => {
          const isActive = group.id === activeId;
          return (
            <li key={group.id}>
              <a
                href={`#${group.id}`}
                onClick={(event) => {
                  const target = document.getElementById(group.id);
                  if (!target) return;
                  event.preventDefault();
                  const reduceMotion = window.matchMedia(
                    '(prefers-reduced-motion: reduce)',
                  ).matches;
                  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
                }}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'flex h-[47px] items-center gap-2 rounded-full border px-[22px] text-base whitespace-nowrap transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
                  isActive
                    ? 'border-white bg-white text-viratec-ink'
                    : 'border-white/25 bg-white/6 text-white hover:bg-white/12',
                )}
              >
                <span className="font-medium">{group.tab}</span>
                <span aria-hidden="true">↓</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function EventsSection({
  title,
  description,
  events,
}: {
  title: string;
  description: string;
  events: Opportunity[];
}) {
  return (
    <section aria-labelledby="events-title">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pt-14 pb-2 lg:gap-10 lg:px-[85px] lg:pt-24 lg:pb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <h2 id="events-title" className={SECTION_TITLE_CLASS}>
            {title}
          </h2>
          <p className="text-base leading-6 text-viratec-muted lg:w-[440px] lg:shrink-0 lg:text-lg lg:leading-7">
            {description}
          </p>
        </div>
        <ul className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {events.map((event) => (
            <li key={event.title}>
              <OpportunityCard opportunity={event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AudienceSection({ group }: { group: AudienceGroup }) {
  const titleId = `${group.id}-title`;

  return (
    <section id={group.id} aria-labelledby={titleId} className="scroll-mt-6">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pt-14 pb-2 lg:gap-10 lg:px-[85px] lg:pt-24 lg:pb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <h2 id={titleId} className={SECTION_TITLE_CLASS}>
            {group.title}
          </h2>
          <p className="text-base leading-6 text-viratec-muted lg:w-[440px] lg:shrink-0 lg:text-lg lg:leading-7">
            {group.description}
          </p>
        </div>
        <ul className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {group.opportunities.map((opportunity) => (
            <li key={opportunity.title}>
              <OpportunityCard opportunity={opportunity} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function OpportunitiesPage() {
  const content = useOpportunitiesContent();
  const common = useCommonMessages();
  const events = useUpcomingEvents();
  useSeo(content.documentTitle);

  return (
    <PageLayout
      footer={<SiteFooter />}
      intro={
        <PageIntro
          header={<SiteHeader />}
          tone="teal"
          eyebrow={content.eyebrow}
          title={content.title}
          accent={content.accent}
          description={content.description}
          descriptionClassName="lg:max-w-[720px]"
          className="lg:pt-20 lg:pb-[72px]"
        >
          <RoleTabs label={content.tabsLabel} groups={content.audienceGroups} />
        </PageIntro>
      }
    >
      <PageSections
        page="OPPORTUNITIES"
        sections={{
          events: events.length > 0 && (
            <EventsSection
              title={content.eventsTitle}
              description={content.eventsDescription}
              events={events}
            />
          ),
          audiences: content.audienceGroups.map((group) => (
            <AudienceSection key={group.id} group={group} />
          )),
          howItWorks: (
            <section aria-labelledby="how-it-works-title">
              <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pt-16 pb-12 lg:gap-10 lg:px-[85px] lg:pt-[120px] lg:pb-16">
                <h2 id="how-it-works-title" className={SECTION_TITLE_CLASS}>
                  {content.howItWorksTitle}
                </h2>
                <StepsList steps={content.howItWorks} />
              </div>
            </section>
          ),
          cta: (
            <CtaSection
              title={content.ctaTitle}
              description={content.ctaDescription}
              action={{ label: common.contactCollaborate, to: ROUTES.CONTACT }}
            />
          ),
        }}
      />
    </PageLayout>
  );
}
