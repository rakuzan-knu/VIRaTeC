import { Link, useLocation, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { usePublicProfile } from '@/entities/person';
import { useSessionStore } from '@/entities/session';
import { ApiError, getApiErrorCode } from '@/shared/api/apiClient';
import { ROUTES } from '@/shared/config/routes';
import { useSeo } from '@/shared/lib';
import { LinkButton, linkButtonClassName } from '@/shared/ui/link-button';
import { usePersonMessages } from '../model/messages';
import { ProfileContent } from './ProfileContent';
import { ProfileState } from './ProfileState';

export function PersonPage() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const t = usePersonMessages();
  const viewerId = useSessionStore((state) => state.user?.id ?? null);
  const { data: profile, error, isPending } = usePublicProfile(userId, viewerId);
  const isPublic = profile?.visibility === 'PUBLIC';
  useSeo(profile?.name ?? t.community, { noindex: !isPublic });

  if (isPending) {
    return (
      <ProfileState
        title={t.loading}
        description=" "
        action={<span className="sr-only">{t.loading}</span>}
      />
    );
  }

  if (error instanceof ApiError && error.status === 401) {
    return (
      <ProfileState
        title={t.membersOnlyTitle}
        description={t.membersOnlyDescription}
        action={
          <Link
            to={ROUTES.LOGIN}
            state={{ from: location.pathname }}
            className={linkButtonClassName({ className: 'mt-2 w-full sm:w-auto' })}
          >
            <Lock aria-hidden="true" className="size-[18px]" />
            {t.signIn}
          </Link>
        }
      />
    );
  }

  if (getApiErrorCode(error) === 'EMAIL_NOT_VERIFIED') {
    return (
      <ProfileState
        title={t.unverifiedTitle}
        description={t.unverifiedDescription}
        action={
          <LinkButton to={ROUTES.ACCOUNT} className="mt-2 w-full sm:w-auto">
            {t.toAccount}
          </LinkButton>
        }
      />
    );
  }

  if (!profile) {
    const isMissing = error instanceof ApiError && [400, 404].includes(error.status);
    return (
      <ProfileState
        title={isMissing ? t.notFoundTitle : t.errorTitle}
        description={isMissing ? t.notFoundDescription : t.errorDescription}
        action={
          <LinkButton to={ROUTES.HOME} className="mt-2 w-full sm:w-auto">
            {t.backHome}
          </LinkButton>
        }
      />
    );
  }

  return <ProfileContent profile={profile} />;
}
