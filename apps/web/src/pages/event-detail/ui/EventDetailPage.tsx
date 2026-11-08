import { useNavigate, useParams } from 'react-router-dom';
import { getEventPhase, formatEventDateTime, useEvent, useEventLabels } from '@/entities/event';
import { ROUTES } from '@/shared/config/routes';
import { useCommonMessages, useLocale } from '@/shared/i18n';
import { useSeo } from '@/shared/lib';
import { ListFeedback } from '@/shared/ui/list-feedback';
import { PageSection } from '@/shared/ui/page-section';
import { Tag } from '@/shared/ui/Tag';
import { PageIntro, type BreadcrumbItem } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';
import { useEventDetailMessages } from '../model/messages';
import { EventBody } from './EventBody';

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: event, isPending, isError, refetch } = useEvent(eventId);
  const t = useEventDetailMessages();
  const common = useCommonMessages();
  const labels = useEventLabels();
  const locale = useLocale();
  useSeo(event?.title ?? (isPending ? t.event : t.notFoundTitle), {
    description: event?.description,
    type: 'article',
    noindex: isError,
  });

  const breadcrumbRoot: BreadcrumbItem[] = [{ label: t.events, to: ROUTES.EVENTS }];
  const phase = event ? getEventPhase(event, Date.now()) : null;

  const intro = event ? (
    <PageIntro
      breadcrumb={[...breadcrumbRoot, event.title]}
      title={event.title}
      description={formatEventDateTime(event, locale)}
      descriptionClassName="lg:max-w-[720px]"
      className="lg:pb-16"
    >
      {phase && <Tag color={phase === 'live' ? 'lime' : 'cyan'} label={labels.phase[phase]} />}
    </PageIntro>
  ) : (
    <PageIntro
      breadcrumb={breadcrumbRoot}
      title={isPending ? t.loadingTitle : t.notFoundTitle}
      description={isPending ? t.loadingDescription : t.notFoundDescription}
      className="lg:pb-16"
    />
  );

  return (
    <PageLayout header={<SiteHeader />} footer={<SiteFooter />} intro={intro}>
      {event && <EventBody event={event} />}
      {!event && !isPending && (
        <PageSection>
          <ListFeedback
            message={isError ? t.loadError : t.missing}
            actionLabel={isError ? common.tryAgain : t.backToEvents}
            onAction={() => (isError ? void refetch() : navigate(ROUTES.EVENTS))}
          />
        </PageSection>
      )}
    </PageLayout>
  );
}
