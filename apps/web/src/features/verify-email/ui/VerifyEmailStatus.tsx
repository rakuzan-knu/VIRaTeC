import { Link } from 'react-router-dom';
import { ArrowRight, Check, LoaderCircle, RotateCw, TriangleAlert } from 'lucide-react';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { ROUTES } from '@/shared/config/routes';
import { useCommonMessages } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { useVerifyEmailMessages } from '../model/messages';
import { useVerifyEmailToken } from '../model/useVerifyEmailToken';

const ACTION_CLASS =
  'inline-flex h-[52px] w-full items-center justify-between rounded-[9px] bg-auth-navy px-5 text-sm font-medium text-white hover:bg-auth-navy-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-navy';

export function VerifyEmailStatus() {
  const t = useVerifyEmailMessages();
  const common = useCommonMessages();
  const { status, error, isSignedIn, retry } = useVerifyEmailToken();

  const isNetworkError = error instanceof ApiError && error.status === NETWORK_ERROR_STATUS;
  const isLinkRejected = error instanceof ApiError && error.status === 400;
  const content = {
    pending: { title: t.status.pendingTitle, description: t.status.pendingDescription },
    success: { title: t.status.successTitle, description: t.status.successDescription },
    missing: { title: t.status.missingTitle, description: t.status.missingDescription },
    error: isLinkRejected
      ? { title: t.status.invalidTitle, description: t.status.invalidDescription }
      : {
          title: t.status.failedTitle,
          description: isNetworkError ? common.networkError : t.errors.unexpected,
        },
  }[status];
  const Icon = status === 'success' ? Check : status === 'pending' ? LoaderCircle : TriangleAlert;

  return (
    <div className="w-full space-y-5" aria-live="polite">
      <span
        className={cn(
          'flex size-14 items-center justify-center rounded-2xl',
          status === 'success'
            ? 'bg-auth-success-bg text-auth-success'
            : 'bg-auth-navy/8 text-auth-navy',
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn('size-7', status === 'pending' && 'motion-safe:animate-spin')}
        />
      </span>
      <div className="space-y-2">
        <h2 className="text-[34px] leading-[1.05] font-medium tracking-[-0.045em] text-auth-heading">
          {content.title}
        </h2>
        <p className="text-sm text-auth-muted">{content.description}</p>
      </div>
      {status === 'error' && !isLinkRejected && (
        <button type="button" onClick={retry} className={cn(ACTION_CLASS, 'cursor-pointer')}>
          {t.status.retry}
          <RotateCw aria-hidden="true" className="size-4" />
        </button>
      )}
      {status !== 'pending' && (
        <Link to={isSignedIn ? ROUTES.ACCOUNT : ROUTES.LOGIN} className={ACTION_CLASS}>
          {isSignedIn ? t.status.toAccount : t.status.toLogin}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      )}
    </div>
  );
}
