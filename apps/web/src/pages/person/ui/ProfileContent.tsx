import type { PublicProfileDto } from '@viratec/contracts';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import { ProfileAside } from './ProfileAside';
import { ProfileIntro } from './ProfileIntro';
import { ProfileMain } from './ProfileMain';

export function ProfileContent({ profile }: { profile: PublicProfileDto }) {
  return (
    <PageLayout footer={<SiteFooter />} intro={<ProfileIntro profile={profile} />}>
      <div className="mx-auto grid max-w-[1440px] gap-4 px-5 pb-[72px] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6 lg:px-[85px] lg:pb-[120px]">
        <ProfileMain profile={profile} />
        <ProfileAside profile={profile} />
      </div>
    </PageLayout>
  );
}
