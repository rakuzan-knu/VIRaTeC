import { CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { formatEventDateTime, localizeEvent } from '@/entities/event';
import { useUnsubscribeByToken, useUnsubscribePreview } from '@/features/register-for-event';
import { ROUTES, buildEventPath } from '@/shared/config/routes';
import { defineMessages, useLocale, useLocalized } from '@/shared/i18n';
import { useSeo } from '@/shared/lib';
import { Button } from '@/shared/ui/Button';
import { LinkButton } from '@/shared/ui/link-button';
import { PageSection } from '@/shared/ui/page-section';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import { SiteHeader } from '@/widgets/site-header';

const UNSUBSCRIBE_MESSAGES = defineMessages({
  en: {
    title: 'Stop emails about this event',
    description: 'One click and we will stop writing to you about it.',
    confirm: 'Unsubscribe from this event',
    note: 'Your account and your other subscriptions stay as they are.',
    loading: 'Checking the link…',
    done: 'Done. You will not get emails about this event anymore.',
    already: 'You are already unsubscribed from this event.',
    invalid: 'This link does not work. Open the event page to manage your subscription.',
    failed: 'Could not unsubscribe. Try again.',
    backToEvent: 'Back to the event',
    toEvents: 'Go to events',
  },
  uk: {
    title: 'Більше не надсилати листи про цю подію',
    description: 'Один клік, і ми більше не писатимемо вам про неї.',
    confirm: 'Відписатися від цієї події',
    note: 'Ваш акаунт та інші підписки залишаться без змін.',
    loading: 'Перевіряємо посилання…',
    done: 'Готово. Листів про цю подію більше не буде.',
    already: 'Ви вже відписані від цієї події.',
    invalid: 'Це посилання не працює. Керувати підпискою можна на сторінці події.',
    failed: 'Не вдалося відписатися. Спробуйте ще раз.',
    backToEvent: 'Повернутися до події',
    toEvents: 'До подій',
  },
  de: {
    title: 'Keine E-Mails mehr zu dieser Veranstaltung',
    description: 'Ein Klick, und wir schreiben Ihnen nicht mehr dazu.',
    confirm: 'Von dieser Veranstaltung abmelden',
    note: 'Ihr Konto und Ihre anderen Abonnements bleiben unverändert.',
    loading: 'Link wird geprüft…',
    done: 'Fertig. Sie erhalten keine E-Mails mehr zu dieser Veranstaltung.',
    already: 'Sie sind von dieser Veranstaltung bereits abgemeldet.',
    invalid:
      'Dieser Link funktioniert nicht. Ihr Abonnement verwalten Sie auf der Veranstaltungsseite.',
    failed: 'Abmeldung fehlgeschlagen. Versuchen Sie es erneut.',
    backToEvent: 'Zurück zur Veranstaltung',
    toEvents: 'Zu den Veranstaltungen',
  },
  fr: {
    title: 'Ne plus recevoir d’e-mails sur cet événement',
    description: 'Un clic et nous ne vous écrirons plus à ce sujet.',
    confirm: 'Me désinscrire de cet événement',
    note: 'Votre compte et vos autres abonnements ne changent pas.',
    loading: 'Vérification du lien…',
    done: 'C’est fait. Vous ne recevrez plus d’e-mails sur cet événement.',
    already: 'Vous êtes déjà désinscrit de cet événement.',
    invalid: 'Ce lien ne fonctionne pas. Gérez votre abonnement sur la page de l’événement.',
    failed: 'Désinscription impossible. Réessayez.',
    backToEvent: 'Retour à l’événement',
    toEvents: 'Voir les événements',
  },
  ar: {
    title: 'إيقاف الرسائل عن هذه الفعالية',
    description: 'نقرة واحدة ولن نراسلك بشأنها بعد الآن.',
    confirm: 'إلغاء الاشتراك في هذه الفعالية',
    note: 'لن يتغيّر حسابك ولا اشتراكاتك الأخرى.',
    loading: 'جارٍ التحقق من الرابط…',
    done: 'تم. لن تصلك رسائل عن هذه الفعالية بعد الآن.',
    already: 'لقد ألغيت اشتراكك في هذه الفعالية من قبل.',
    invalid: 'هذا الرابط لا يعمل. يمكنك إدارة اشتراكك من صفحة الفعالية.',
    failed: 'تعذّر إلغاء الاشتراك. حاول مرة أخرى.',
    backToEvent: 'العودة إلى الفعالية',
    toEvents: 'الانتقال إلى الفعاليات',
  },
});

const MESSAGE_CLASS = 'text-[17px] leading-7';

export function EventUnsubscribePage() {
  const t = useLocalized(UNSUBSCRIBE_MESSAGES);
  const locale = useLocale();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const preview = useUnsubscribePreview(token);
  const unsubscribe = useUnsubscribeByToken();
  useSeo(t.title, { noindex: true });

  const isInvalid = !token || preview.isError;
  const event = preview.data?.event ? localizeEvent(preview.data.event, locale) : null;
  const isAlready = preview.isSuccess && !event;

  return (
    <PageLayout
      header={<SiteHeader />}
      footer={<SiteFooter />}
      intro={<PageIntro title={t.title} description={t.description} className="lg:pb-16" />}
    >
      <PageSection containerClassName="items-start lg:pt-0">
        {preview.isLoading && (
          <p role="status" className={`${MESSAGE_CLASS} text-viratec-muted`}>
            {t.loading}
          </p>
        )}
        {isInvalid && (
          <p role="alert" className={`${MESSAGE_CLASS} text-state-error`}>
            {t.invalid}
          </p>
        )}
        {isAlready && <p className={`${MESSAGE_CLASS} text-viratec-soft`}>{t.already}</p>}
        {event && (
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl leading-[30px] font-medium tracking-[-0.02em] text-white">
              {event.title}
            </h2>
            <p className="text-[15px] leading-[22px] text-viratec-muted">
              {formatEventDateTime(event, locale)}
            </p>
          </div>
        )}
        {event && !unsubscribe.isSuccess && token && (
          <div className="flex flex-col items-start gap-3">
            <Button
              label={t.confirm}
              loading={unsubscribe.isPending}
              onClick={() => unsubscribe.mutate(token)}
            />
            <p className="text-[14px] leading-5 text-viratec-subtle">{t.note}</p>
            {unsubscribe.isError && (
              <p role="alert" className="text-[14px] leading-5 text-state-error">
                {t.failed}
              </p>
            )}
          </div>
        )}
        {unsubscribe.isSuccess && (
          <p
            role="status"
            className={`${MESSAGE_CLASS} flex items-start gap-2 text-viratec-accent`}
          >
            <CheckCircle2 aria-hidden="true" className="mt-1 size-5 shrink-0" />
            {t.done}
          </p>
        )}
        {unsubscribe.isSuccess && event && (
          <LinkButton to={buildEventPath(event.id)} variant="secondary" size="md">
            {t.backToEvent}
          </LinkButton>
        )}
        {(isInvalid || isAlready) && (
          <LinkButton to={ROUTES.EVENTS} variant="secondary" size="md">
            {t.toEvents}
          </LinkButton>
        )}
      </PageSection>
    </PageLayout>
  );
}
