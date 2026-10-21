import { ROUTES } from '@/shared/config/routes';
import { defineMessages, useLocalized } from '@/shared/i18n';
import { LinkButton } from '@/shared/ui/link-button';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { useDocumentTitle } from '@/shared/lib';

const NOT_FOUND_MESSAGES = defineMessages({
  en: {
    title: 'Page not found',
    accent: 'Let’s get you back.',
    description: 'The page you are looking for doesn’t exist or has been moved.',
    action: 'Back to home',
  },
  uk: {
    title: 'Сторінку не знайдено',
    accent: 'Повернімося назад.',
    description: 'Сторінка, яку ви шукаєте, не існує або була переміщена.',
    action: 'На головну',
  },
});

export function NotFoundPage() {
  const t = useLocalized(NOT_FOUND_MESSAGES);
  useDocumentTitle(t.title);

  return (
    <PageLayout
      intro={
        <PageIntro
          eyebrow="404"
          title={t.title}
          accent={t.accent}
          description={t.description}
          className="lg:pb-28"
        >
          <LinkButton to={ROUTES.HOME} className="mt-2 w-full sm:w-auto">
            {t.action}
          </LinkButton>
        </PageIntro>
      }
    >
      {null}
    </PageLayout>
  );
}
