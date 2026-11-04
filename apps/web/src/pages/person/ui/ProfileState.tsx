import type { ReactNode } from 'react';
import { PageIntro } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';

export function ProfileState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <PageLayout
      header={<SiteHeader />}
      footer={<SiteFooter />}
      intro={
        <PageIntro title={title} description={description} className="lg:pb-28">
          {action}
        </PageIntro>
      }
    >
      {null}
    </PageLayout>
  );
}
