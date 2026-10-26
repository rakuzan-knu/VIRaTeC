import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { usePeopleMessages } from '../model/messages';

export function DirectoryHints({ isSignedIn }: { isSignedIn: boolean }) {
  const t = usePeopleMessages();
  const location = useLocation();

  if (isSignedIn) {
    return (
      <div className="flex flex-col gap-3 rounded-[20px] border border-viratec-lime/20 bg-viratec-lime/6 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-viratec-soft">{t.memberHint}</p>
        <Link
          to={ROUTES.ACCOUNT}
          className={linkButtonClassName({
            size: 'md',
            variant: 'secondary',
            className: 'shrink-0',
          })}
        >
          {t.completeProfile}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 text-sm text-viratec-muted">
        <Lock aria-hidden="true" className="size-4 shrink-0" />
        {t.guestHint}
      </p>
      <Link
        to={ROUTES.LOGIN}
        state={{ from: `${location.pathname}${location.search}` }}
        className={linkButtonClassName({
          size: 'md',
          variant: 'secondary',
          className: 'shrink-0',
        })}
      >
        {t.signIn}
      </Link>
    </div>
  );
}
