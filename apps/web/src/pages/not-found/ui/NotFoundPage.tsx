import { ROUTES } from '@/shared/config/routes';
import { LinkButton } from '@/shared/ui/link-button';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';

export function NotFoundPage() {
  return (
    <PageLayout
      intro={
        <PageIntro
          eyebrow="404"
          title="Page not found"
          accent="Let’s get you back."
          description="The page you are looking for doesn’t exist or has been moved."
          className="lg:pb-28"
        >
          <LinkButton to={ROUTES.HOME} className="mt-2 w-full sm:w-auto">
            Back to home
          </LinkButton>
        </PageIntro>
      }
    >
      {null}
    </PageLayout>
  );
}
