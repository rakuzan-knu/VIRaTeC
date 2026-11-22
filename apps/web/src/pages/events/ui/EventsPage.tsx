import { useState } from 'react';
import { EventCard, useEvents } from '@/entities/event';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { useSeo } from '@/shared/lib';
import { ListFeedback, LoadMoreButton } from '@/shared/ui/list-feedback';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';

const PAST_PAGE_SIZE = 6;

const SKELETON_KEYS = ['first', 'second', 'third'];

const EVENTS_MESSAGES = defineMessages({
  en: {
    title: 'Workshops and',
    accent: 'meetings.',
    description:
      'Join online sessions of the VIRaTeC community. Subscribe to get the meeting link by email as soon as it opens.',
    upcomingTitle: 'Upcoming events',
    pastTitle: 'Past events',
    emptyUpcoming: 'No events are scheduled yet. Check back soon.',
    loadError: 'We couldn’t load the events.',
  },
  uk: {
    title: 'Воркшопи та',
    accent: 'зустрічі.',
    description:
      'Долучайтеся до онлайн-подій спільноти VIRaTeC. Підпишіться, щоб отримати посилання на зустріч поштою, щойно воно відкриється.',
    upcomingTitle: 'Майбутні події',
    pastTitle: 'Минулі події',
    emptyUpcoming: 'Поки немає запланованих подій. Завітайте згодом.',
    loadError: 'Не вдалося завантажити події.',
  },
  de: {
    title: 'Workshops und',
    accent: 'Treffen.',
    description:
      'Nehmen Sie an Online-Veranstaltungen der VIRaTeC-Community teil. Abonnieren Sie sie, um den Besprechungslink per E-Mail zu erhalten, sobald er geöffnet wird.',
    upcomingTitle: 'Bevorstehende Veranstaltungen',
    pastTitle: 'Vergangene Veranstaltungen',
    emptyUpcoming: 'Derzeit sind keine Veranstaltungen geplant. Schauen Sie bald wieder vorbei.',
    loadError: 'Die Veranstaltungen konnten nicht geladen werden.',
  },
  fr: {
    title: 'Ateliers et',
    accent: 'réunions.',
    description:
      'Participez aux sessions en ligne de la communauté VIRaTeC. Abonnez-vous pour recevoir le lien de la réunion par e-mail dès son ouverture.',
    upcomingTitle: 'Événements à venir',
    pastTitle: 'Événements passés',
    emptyUpcoming: 'Aucun événement n’est prévu pour le moment. Revenez bientôt.',
    loadError: 'Impossible de charger les événements.',
  },
  ar: {
    title: 'ورش العمل',
    accent: 'واللقاءات.',
    description:
      'شارك في الجلسات الإلكترونية لمجتمع VIRaTeC. اشترك لتصلك رسالة برابط الاجتماع فور فتحه.',
    upcomingTitle: 'الفعاليات القادمة',
    pastTitle: 'الفعاليات السابقة',
    emptyUpcoming: 'لا توجد فعاليات مجدولة حاليًا. عُد قريبًا.',
    loadError: 'تعذّر تحميل الفعاليات.',
  },
});

export function EventsPage() {
  const t = useLocalized(EVENTS_MESSAGES);
  const common = useCommonMessages();
  const upcoming = useEvents('upcoming');
  const past = useEvents('past');
  const [visiblePast, setVisiblePast] = useState(PAST_PAGE_SIZE);
  useSeo(`${t.title} ${t.accent}`, { description: t.description });

  const pastEvents = past.data ?? [];

  return (
    <PageLayout
      header={<SiteHeader />}
      footer={<SiteFooter />}
      intro={
        <PageIntro
          title={t.title}
          accent={t.accent}
          description={t.description}
          descriptionClassName="lg:max-w-[680px]"
          className="lg:pb-16"
        />
      }
    >
      <PageSection aria-labelledby="upcoming-events-title" containerClassName="lg:pt-0">
        <SectionHeader id="upcoming-events-title" title={t.upcomingTitle} />
        {upcoming.isPending && (
          <ul className="grid gap-6 lg:grid-cols-3" aria-hidden="true">
            {SKELETON_KEYS.map((key) => (
              <li
                key={key}
                className="h-[300px] animate-pulse rounded-[28px] bg-white/5 motion-reduce:animate-none"
              />
            ))}
          </ul>
        )}
        {upcoming.isError && (
          <ListFeedback
            message={t.loadError}
            actionLabel={common.tryAgain}
            onAction={() => void upcoming.refetch()}
          />
        )}
        {upcoming.data?.length === 0 && (
          <p className="rounded-[28px] border border-dashed border-white/16 px-6 py-14 text-center text-[17px] text-viratec-muted">
            {t.emptyUpcoming}
          </p>
        )}
        {upcoming.data && upcoming.data.length > 0 && (
          <ul className="grid gap-6 lg:grid-cols-3">
            {upcoming.data.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        )}
      </PageSection>

      {pastEvents.length > 0 && (
        <PageSection tone="surface" aria-labelledby="past-events-title">
          <SectionHeader id="past-events-title" title={t.pastTitle} />
          <ul className="grid gap-6 lg:grid-cols-3">
            {pastEvents.slice(0, visiblePast).map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
          {visiblePast < pastEvents.length && (
            <LoadMoreButton onClick={() => setVisiblePast((count) => count + PAST_PAGE_SIZE)} />
          )}
        </PageSection>
      )}
    </PageLayout>
  );
}
