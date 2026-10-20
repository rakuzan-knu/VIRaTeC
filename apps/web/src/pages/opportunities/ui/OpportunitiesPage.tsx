import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib';
import { LinkButton } from '@/shared/ui/link-button';
import { StepsList } from '@/shared/ui/steps-list';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { AUDIENCE_GROUPS, HOW_IT_WORKS, type AudienceGroup } from '../model/content';
import { useActiveSection } from '../lib/useActiveSection';

const SECTION_IDS = AUDIENCE_GROUPS.map((group) => group.id);

const SECTION_TITLE_CLASS =
  'text-[28px] leading-[34px] tracking-[-0.56px] text-white lg:text-[44px] lg:leading-[50px] lg:tracking-[-0.88px]';

function RoleTabs() {
  const activeId = useActiveSection(SECTION_IDS);

  return (
    <nav aria-label="Opportunities by role" className="w-full pt-3">
      <ul className="flex flex-wrap gap-2.5">
        {AUDIENCE_GROUPS.map((group) => {
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
              <article className="flex h-full flex-col gap-3.5 rounded-[22px] border border-white/12 bg-white/5 p-5 lg:min-h-[267px] lg:p-7">
                <p className="text-[13px] text-viratec-subtle">{opportunity.meta}</p>
                <h3 className="text-xl leading-[26px] font-medium text-white lg:text-[23px] lg:leading-[30px]">
                  {opportunity.title}
                </h3>
                <p className="text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
                  {opportunity.description}
                </p>
                <LinkButton
                  to={opportunity.to}
                  variant="secondary"
                  size="md"
                  className="mt-auto self-start"
                >
                  {opportunity.actionLabel}
                </LinkButton>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function OpportunitiesPage() {
  return (
    <PageLayout
      intro={
        <PageIntro
          tone="teal"
          eyebrow="Opportunities"
          title="Find your place in"
          accent="the VIRaTeC network."
          description="Projects, workshops and partnerships for students, researchers and universities. Pick your role to see what is open right now."
          descriptionClassName="lg:max-w-[720px]"
          className="lg:pt-20 lg:pb-[72px]"
        >
          <RoleTabs />
        </PageIntro>
      }
    >
      {AUDIENCE_GROUPS.map((group) => (
        <AudienceSection key={group.id} group={group} />
      ))}

      <section aria-labelledby="how-it-works-title">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pt-16 pb-12 lg:gap-10 lg:px-[85px] lg:pt-[120px] lg:pb-16">
          <h2 id="how-it-works-title" className={SECTION_TITLE_CLASS}>
            How it works
          </h2>
          <StepsList steps={HOW_IT_WORKS} />
        </div>
      </section>

      <CtaSection
        title="Didn’t find your format?"
        description="Write to us — we are open to new ideas, courses and partnerships."
        action={{ label: 'Contact / Collaborate', to: ROUTES.CONTACT }}
      />
    </PageLayout>
  );
}
