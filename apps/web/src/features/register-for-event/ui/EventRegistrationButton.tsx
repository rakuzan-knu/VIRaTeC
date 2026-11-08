import { BellRing, CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES, buildAccountPath } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { useRegistrationMessages, type RegistrationErrorCode } from '../model/messages';
import { useEventRegistration } from '../model/useEventRegistration';

const isClosed = (state: string | undefined) => state === 'ENDED' || state === 'CANCELLED';

export function EventRegistrationButton({ eventId }: { eventId: string }) {
  const t = useRegistrationMessages();
  const location = useLocation();
  const { access, emailVerified, isSignedIn, toggle, isToggling, errorCode } =
    useEventRegistration(eventId);

  if (!access || isClosed(access.state)) return null;

  const isFull = access.spotsLeft === 0 && !access.registered;
  const error = errorCode
    ? (t.errors[errorCode as RegistrationErrorCode] ?? t.errors.UNKNOWN)
    : null;

  return (
    <div className="flex flex-col gap-2">
      {!isSignedIn && (
        <Link
          to={ROUTES.LOGIN}
          state={{ from: `${location.pathname}${location.search}` }}
          className={linkButtonClassName({ variant: 'secondary', size: 'md', className: 'w-full' })}
        >
          <BellRing aria-hidden="true" className="size-[18px]" />
          {t.signIn}
        </Link>
      )}
      {isSignedIn && !emailVerified && !access.registered && (
        <p className="text-[14px] leading-5 text-viratec-muted">
          {t.verifyEmail}{' '}
          <Link
            to={buildAccountPath()}
            className="text-viratec-cyan underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
          >
            {t.openAccount}
          </Link>
        </p>
      )}
      {isSignedIn && (emailVerified || access.registered) && !isFull && (
        <>
          {access.registered && (
            <p className="flex items-center gap-2 text-[15px] font-medium text-viratec-accent">
              <CheckCircle2 aria-hidden="true" className="size-[18px]" />
              {t.subscribed}
            </p>
          )}
          <Button
            label={access.registered ? t.unsubscribe : t.subscribe}
            variant={access.registered ? 'secondary' : 'primary'}
            size="md"
            className="w-full"
            loading={isToggling}
            onClick={toggle}
          />
        </>
      )}
      {isFull && <p className="text-[15px] font-medium text-viratec-soft">{t.full}</p>}
      {error && (
        <p role="alert" className="text-[14px] leading-5 text-state-error">
          {error}
        </p>
      )}
      <p className="text-[13px] leading-[18px] text-viratec-subtle">{t.helper}</p>
    </div>
  );
}
