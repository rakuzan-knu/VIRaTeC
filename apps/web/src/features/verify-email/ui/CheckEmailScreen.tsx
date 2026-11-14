import { ArrowRight, MailCheck } from 'lucide-react';
import { Button } from '@/shared/ui/auth-button';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { useVerifyEmailMessages } from '../model/messages';
import { useResendVerification } from '../model/useResendVerification';

interface CheckEmailScreenProps {
  email: string;
  onContinue: () => void;
}

export function CheckEmailScreen({ email, onContinue }: CheckEmailScreenProps) {
  const t = useVerifyEmailMessages();
  const { mutate: resend, isPending, isSuccess, errorMessage } = useResendVerification();

  return (
    <div className="w-full space-y-5">
      <BrandLogo className="mx-auto h-[66px] w-[260px] lg:h-[clamp(30px,5svh,66px)] lg:w-[clamp(118px,19.7svh,260px)]" />

      <div className="space-y-3">
        <MailCheck aria-hidden="true" className="size-8 text-auth-navy" />
        <h2 className="font-auth text-[34px] lg:text-[clamp(30px,4.8svh,44px)] font-medium leading-[1.05] tracking-[-0.045em] text-auth-heading">
          {t.notice.checkTitle}
        </h2>
        <p className="text-sm leading-6 text-auth-muted">{t.notice.checkDescription(email)}</p>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="p-3 text-xs text-auth-error bg-red-50 border border-red-200 rounded-lg"
        >
          {errorMessage}
        </p>
      )}
      <p role="status" className="text-xs text-auth-muted">
        {isSuccess ? t.notice.sent : ''}
      </p>

      <Button
        type="button"
        onClick={onContinue}
        className="h-[58px] lg:h-[clamp(40px,6svh,58px)] justify-between rounded-[9px] bg-auth-navy px-5 hover:bg-auth-navy-hover"
      >
        {t.notice.continue}
        <ArrowRight className="w-4 h-4" />
      </Button>

      <button
        type="button"
        onClick={() => resend()}
        disabled={isPending}
        className="mx-auto block min-h-6 cursor-pointer text-xs font-medium text-auth-navy hover:underline disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t.notice.resend}
      </button>
    </div>
  );
}
