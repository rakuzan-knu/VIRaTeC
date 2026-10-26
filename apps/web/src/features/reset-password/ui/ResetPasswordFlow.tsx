import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { CONTACT_EMAIL } from '@/shared/config/navigation';
import { useCommonMessages } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Input } from '@/shared/ui/auth-input';
import { Button } from '@/shared/ui/auth-button';
import { Tooltip } from '@/shared/ui/Tooltip';
import {
  PASSWORD_RULES,
  createNewPasswordSchema,
  createRequestCodeSchema,
  createVerifyCodeSchema,
  type NewPasswordValues,
  type RequestCodeValues,
  type VerifyCodeValues,
} from '../model/schema';
import { useResendCountdown } from '../model/useResendCountdown';
import { IS_RECOVERY_AVAILABLE } from '../model/config';
import { useResetPasswordMessages } from '../model/messages';
import {
  FIELD_INPUT_CLASS,
  FIELD_LABEL_CLASS,
  SUBMIT_CLASS,
  StepHeader,
  StepTopBar,
  SupportLine,
} from './parts';

type Step = 'request' | 'verify' | 'reset' | 'done';

const RESEND_SECONDS = 30;

function RequestStep({
  onSubmit,
  isUnavailable,
}: {
  onSubmit: (email: string) => void;
  isUnavailable: boolean;
}) {
  const t = useResetPasswordMessages();
  const common = useCommonMessages();
  const schema = useMemo(() => createRequestCodeSchema(t.validation), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestCodeValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  return (
    <>
      <StepTopBar step={1} backLabel={t.backToLogin} />
      <StepHeader title={t.request.title} description={t.request.description} />
      <form
        onSubmit={handleSubmit((values) => onSubmit(values.email))}
        className="space-y-4 pt-6"
        noValidate
      >
        <div className="space-y-1.5">
          <label htmlFor="recovery-email" className={FIELD_LABEL_CLASS}>
            {common.emailAddress}
          </label>
          <Input
            id="recovery-email"
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="name@knu.ua"
            error={!!errors.email}
            aria-describedby={errors.email ? 'recovery-email-error' : undefined}
            className={FIELD_INPUT_CLASS}
          />
          {errors.email && (
            <p id="recovery-email-error" className="text-xs text-auth-error">
              {errors.email.message}
            </p>
          )}
        </div>
        <Button type="submit" className={SUBMIT_CLASS}>
          {t.request.submit}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      {isUnavailable && (
        <div
          role="alert"
          className="mt-5 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3.5 text-xs leading-[18px] text-amber-900"
        >
          <p className="font-medium">{common.unavailable(t.request.unavailableTitle)}</p>
          <p className="mt-1">
            {t.request.unavailablePrefix}{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      )}
      <div className="mt-5 rounded-[10px] border border-auth-border bg-auth-surface px-4 py-3.5">
        <p className="text-xs font-medium text-auth-navy">{t.request.secureTitle}</p>
        <p className="mt-1 text-[11px] leading-[16.5px] text-auth-muted">
          {t.request.secureDescription}
        </p>
      </div>
      <SupportLine />
    </>
  );
}

function VerifyStep({
  email,
  onBack,
  onSubmit,
}: {
  email: string;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const countdown = useResendCountdown(RESEND_SECONDS);
  const t = useResetPasswordMessages();
  const schema = useMemo(() => createVerifyCodeSchema(t.validation), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  });

  return (
    <>
      <StepTopBar step={2} backLabel={t.back} onBack={onBack} />
      <StepHeader
        title={t.verify.title}
        description={
          <>
            {t.verify.descriptionPrefix}{' '}
            <strong className="font-medium text-auth-heading">{email}</strong>
            {t.verify.descriptionSuffix}
          </>
        }
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-6" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="recovery-code" className={FIELD_LABEL_CLASS}>
            {t.verify.codeLabel}
          </label>
          <Input
            id="recovery-code"
            {...register('code')}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            error={!!errors.code}
            aria-describedby="recovery-code-hint"
            className={cn(FIELD_INPUT_CLASS, 'tracking-[0.5em]')}
          />
          <p
            id="recovery-code-hint"
            className={cn('text-[11px]', errors.code ? 'text-auth-error' : 'text-auth-muted')}
          >
            {errors.code?.message ?? t.verify.codeHint}
          </p>
        </div>
        <Button type="submit" className={SUBMIT_CLASS}>
          {t.verify.submit}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      <p className="pt-4 text-center text-xs text-auth-muted">
        {t.verify.noEmail}{' '}
        {countdown.remaining > 0 ? (
          <span className="font-medium text-auth-navy">{t.verify.resendIn(countdown.label)}</span>
        ) : (
          <button
            type="button"
            onClick={countdown.restart}
            className="cursor-pointer font-medium text-auth-navy hover:underline"
          >
            {t.verify.resend}
          </button>
        )}
      </p>
      <SupportLine />
    </>
  );
}

function ResetStep({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const t = useResetPasswordMessages();
  const common = useCommonMessages();
  const schema = useMemo(() => createNewPasswordSchema(t.validation), [t]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'password' });

  return (
    <>
      <StepTopBar step={3} backLabel={t.back} onBack={onBack} />
      <StepHeader title={t.reset.title} description={t.reset.description} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-6" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="new-password" className={FIELD_LABEL_CLASS}>
            {t.reset.newPassword}
          </label>
          <div className="relative">
            <Input
              id="new-password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={t.reset.newPasswordPlaceholder}
              error={!!errors.password}
              aria-describedby={cn('new-password-rules', errors.password && 'new-password-error')}
              className={cn(FIELD_INPUT_CLASS, 'pr-14')}
            />
            <Tooltip
              text={showPassword ? common.hidePassword : common.showPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? common.hidePassword : common.showPassword}
                className="flex size-10 cursor-pointer items-center justify-center rounded-md text-auth-muted hover:text-auth-navy"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </Tooltip>
          </div>
          <ul id="new-password-rules" className="flex flex-wrap gap-2 pt-1">
            {PASSWORD_RULES.map((rule) => {
              const isMet = rule.test(password);
              return (
                <li
                  key={rule.id}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] transition-colors',
                    isMet
                      ? 'bg-auth-success-bg text-auth-success'
                      : 'bg-auth-surface text-auth-muted',
                  )}
                >
                  {t.reset.rules[rule.id]}
                  <span className="sr-only">{isMet ? t.reset.ruleMet : t.reset.ruleNotMet}</span>
                </li>
              );
            })}
          </ul>
          {errors.password && (
            <p id="new-password-error" className="text-xs text-auth-error">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className={FIELD_LABEL_CLASS}>
            {t.reset.confirmPassword}
          </label>
          <Input
            id="confirm-password"
            {...register('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t.reset.confirmPasswordPlaceholder}
            error={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            className={FIELD_INPUT_CLASS}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="text-xs text-auth-error">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" className={SUBMIT_CLASS}>
          {t.reset.submit}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      <SupportLine />
    </>
  );
}

function DoneStep() {
  const navigate = useNavigate();
  const t = useResetPasswordMessages();

  return (
    <>
      <StepTopBar backLabel={t.back} />
      <div className="flex flex-col items-center">
        <span className="mt-2 flex size-12 items-center justify-center rounded-full bg-auth-success-bg text-auth-success">
          <Check className="size-6" />
        </span>
      </div>
      <StepHeader centered title={t.done.title} description={t.done.description} />
      <Button
        type="button"
        onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
        className={cn(SUBMIT_CLASS, 'mt-6')}
      >
        {t.done.action}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </>
  );
}

export function ResetPasswordFlow() {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [isUnavailable, setIsUnavailable] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousStepRef = useRef(step);

  useEffect(() => {
    if (previousStepRef.current === step) return;
    previousStepRef.current = step;
    containerRef.current?.querySelector<HTMLHeadingElement>('h2')?.focus();
  }, [step]);

  return (
    <div ref={containerRef} className="w-full">
      {step === 'request' && (
        <RequestStep
          isUnavailable={isUnavailable}
          onSubmit={(value) => {
            if (!IS_RECOVERY_AVAILABLE) {
              setIsUnavailable(true);
              return;
            }
            setEmail(value);
            setStep('verify');
          }}
        />
      )}
      {step === 'verify' && (
        <VerifyStep
          email={email}
          onBack={() => setStep('request')}
          onSubmit={() => setStep('reset')}
        />
      )}
      {step === 'reset' && (
        <ResetStep onBack={() => setStep('verify')} onSubmit={() => setStep('done')} />
      )}
      {step === 'done' && <DoneStep />}
    </div>
  );
}
