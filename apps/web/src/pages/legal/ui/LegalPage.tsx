import { CONTACT_EMAIL, NOT_AVAILABLE_YET } from '@/shared/config/navigation';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { useDocumentTitle } from '@/shared/lib';

interface LegalPageProps {
  title: string;
}

export function LegalPage({ title }: LegalPageProps) {
  useDocumentTitle(title);

  return (
    <PageLayout
      intro={
        <PageIntro
          eyebrow="Legal"
          title={title}
          description={`${NOT_AVAILABLE_YET}. The document is being prepared and will be published here. For questions, write to ${CONTACT_EMAIL}.`}
          className="lg:pb-28"
        />
      }
    >
      {null}
    </PageLayout>
  );
}
