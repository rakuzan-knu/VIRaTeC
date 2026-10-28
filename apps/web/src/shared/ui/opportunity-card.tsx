import { ROUTES } from '@/shared/config/routes';
import { LinkButton, linkButtonClassName } from '@/shared/ui/link-button';

export interface OpportunityCardData {
  meta: string;
  title: string;
  description: string;
  actionLabel: string;
  href?: string;
  to?: string;
}

const ACTION_CLASS = 'mt-auto self-start';

export function OpportunityCard({ opportunity }: { opportunity: OpportunityCardData }) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-[24px] border border-white/10 bg-white/[0.035] p-6 lg:min-h-[267px] lg:rounded-[28px] lg:p-8">
      <p className="text-[13px] text-viratec-subtle">{opportunity.meta}</p>
      <h3 className="font-display text-xl leading-[26px] font-medium tracking-[-0.02em] text-white lg:text-2xl lg:leading-[30px]">
        {opportunity.title}
      </h3>
      <p className="text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
        {opportunity.description}
      </p>
      {opportunity.href ? (
        <a
          href={opportunity.href}
          className={linkButtonClassName({
            variant: 'secondary',
            size: 'md',
            className: ACTION_CLASS,
          })}
        >
          {opportunity.actionLabel}
        </a>
      ) : (
        <LinkButton
          to={opportunity.to ?? ROUTES.CONTACT}
          variant="secondary"
          size="md"
          className={ACTION_CLASS}
        >
          {opportunity.actionLabel}
        </LinkButton>
      )}
    </article>
  );
}
