import { MailCheck } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useVerifyEmailMessages } from '../model/messages';
import { useResendVerification } from '../model/useResendVerification';

export function EmailVerificationNotice({ email }: { email: string }) {
  const t = useVerifyEmailMessages();
  const { mutate: resend, isPending, isSuccess, errorMessage } = useResendVerification();

  return (
    <section
      aria-labelledby="email-verification-title"
      className="flex flex-col gap-4 rounded-[28px] border border-viratec-lime/40 bg-viratec-deep/80 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8"
    >
      <div className="flex gap-4">
        <MailCheck aria-hidden="true" className="mt-1 size-6 shrink-0 text-viratec-lime" />
        <div className="flex flex-col gap-1.5">
          <h3
            id="email-verification-title"
            className="font-display text-[20px] leading-7 font-medium tracking-[-0.02em] text-white"
          >
            {t.notice.title}
          </h3>
          <p className="text-[15px] leading-6 text-viratec-muted">{t.notice.description(email)}</p>
          {errorMessage && (
            <p role="alert" className="text-sm text-state-error">
              {errorMessage}
            </p>
          )}
          <p role="status" className="text-sm text-viratec-accent">
            {isSuccess ? t.notice.sent : ''}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="secondary"
        label={t.notice.resend}
        loading={isPending}
        onClick={() => resend()}
        className="shrink-0 self-start lg:self-auto"
      />
    </section>
  );
}
