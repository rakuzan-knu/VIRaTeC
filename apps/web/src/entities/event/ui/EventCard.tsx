import { buildEventPath } from '@/shared/config/routes';
import { useLocale, useCommonMessages } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { LinkButton } from '@/shared/ui/link-button';
import { Tag } from '@/shared/ui/Tag';
import { formatEventDateTime, useEventLabels } from '../lib/format';
import { getEventPhase } from '../lib/localize';
import type { LocalizedEvent } from '../model/types';

export function EventCard({ event }: { event: LocalizedEvent }) {
  const locale = useLocale();
  const common = useCommonMessages();
  const labels = useEventLabels();
  const phase = getEventPhase(event, Date.now());

  return (
    <article
      className={cn(
        'flex h-full flex-col gap-4 rounded-[24px] border border-white/10 bg-white/[0.035] p-6 lg:min-h-[300px] lg:rounded-[28px] lg:p-8',
        phase === 'live' && 'border-viratec-lime/50',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Tag color={phase === 'live' ? 'lime' : 'cyan'} label={labels.phase[phase]} />
        <span className="text-[13px] text-viratec-subtle">{labels.type[event.type]}</span>
      </div>
      <h3 className="font-display text-xl leading-[26px] font-medium tracking-[-0.02em] text-white lg:text-2xl lg:leading-[30px]">
        {event.title}
      </h3>
      <p className="text-[15px] leading-[22px] text-viratec-soft">
        {formatEventDateTime(event, locale)}
      </p>
      <p className="line-clamp-3 text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
        {event.description}
      </p>
      <LinkButton
        to={buildEventPath(event.id)}
        variant="secondary"
        size="md"
        showArrow={false}
        className="mt-auto self-start"
      >
        {common.learnMore}
      </LinkButton>
    </article>
  );
}
