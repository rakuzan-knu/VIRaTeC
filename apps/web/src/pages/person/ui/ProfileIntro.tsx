import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import type { PublicProfileDto } from '@viratec/contracts';
import { UserAvatar, useAccountLabels } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { INTL_LOCALE, useLocale } from '@/shared/i18n';
import { useIntlNames } from '@/shared/lib/intlNames';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { PageIntro } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { usePersonMessages } from '../model/messages';

export function ProfileIntro({ profile }: { profile: PublicProfileDto }) {
  const t = usePersonMessages();
  const labels = useAccountLabels();
  const locale = useLocale();
  const { countryName } = useIntlNames();

  const headline = [
    profile.studyLevel
      ? [
          labels.studyLevel[profile.studyLevel],
          profile.studyYear && labels.studyYear(profile.studyYear),
        ]
          .filter(Boolean)
          .join(', ')
      : labels.role[profile.role as keyof typeof labels.role],
    profile.institution,
    profile.country && countryName(profile.country),
  ]
    .filter(Boolean)
    .join(' · ');

  const memberSince = new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'long' }).format(
    new Date(profile.createdAt),
  );

  return (
    <PageIntro
      header={<SiteHeader />}
      breadcrumb={[
        { label: t.home, to: ROUTES.HOME },
        { label: t.community, to: ROUTES.PEOPLE },
        profile.name,
      ]}
      eyebrow={labels.faculty[profile.faculty as keyof typeof labels.faculty]}
      title={profile.name}
      description={headline || t.memberSince(memberSince)}
      className="lg:pb-16"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <UserAvatar
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          className="size-24 text-3xl ring-4 ring-white/10 lg:size-28"
        />
        <div className="flex flex-col gap-3">
          {profile.openTo.length > 0 && (
            <ul aria-label={t.openTo} className="flex flex-wrap gap-2">
              {profile.openTo.map((option) => (
                <li
                  key={option}
                  className="inline-flex items-center gap-1.5 rounded-full border border-viratec-lime/40 bg-viratec-lime/12 px-3.5 py-1.5 text-sm font-medium text-viratec-accent"
                >
                  {labels.openTo[option]}
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm text-viratec-subtle">{t.memberSince(memberSince)}</p>
        </div>
      </div>
      {profile.isOwner && (
        <div className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-viratec-muted">
            {t.ownerHint(labels.visibility[profile.visibility])}
          </p>
          <Link
            to={ROUTES.ACCOUNT}
            className={linkButtonClassName({
              size: 'md',
              variant: 'secondary',
              className: 'shrink-0',
            })}
          >
            <Pencil aria-hidden="true" className="size-4" />
            {t.editProfile}
          </Link>
        </div>
      )}
    </PageIntro>
  );
}
