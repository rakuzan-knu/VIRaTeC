import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import {
  PASSWORD_RULES,
  newPasswordSchema,
  requestCodeSchema,
  verifyCodeSchema,
  type NewPasswordValues,
  type RequestCodeValues,
  type VerifyCodeValues,
} from '../model/schema';
import { useResendCountdown } from '../model/useResendCountdown';
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

function RequestStep({ onSubmit }: { onSubmit: (email: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestCodeValues>({
    resolver: zodResolver(requestCodeSchema),
    defaultValues: { email: '' },
  });

  return (
    <>
      <StepTopBar step={1} backLabel="Back to login" />
      <StepHeader
        title="Forgot your password?"
        description="Enter your account email. If it matches a VIRaTeC account, we'll send a secure 6-digit recovery code."
      />
      <form
        onSubmit={handleSubmit((values) => onSubmit(values.email))}
        className="space-y-4 pt-6"
        noValidate
      >
        <div className="space-y-1.5">
          <label htmlFor="recovery-email" className={FIELD_LABEL_CLASS}>
            Email address
          </label>
          <Input
            id="recovery-email"
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="name@knu.ua"
            error={!!errors.email}
            className={FIELD_INPUT_CLASS}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <Button type="submit" className={SUBMIT_CLASS}>
          Send recovery code
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      <div className="mt-5 rounded-[10px] border border-[#d7e0e8] bg-[#f3f7fb] px-4 py-3.5">
        <p className="text-xs font-medium text-[#082455]">Secure by design</p>
        <p className="mt-1 text-[11px] leading-[16.5px] text-[#677588]">
          For privacy, we&apos;ll show the same confirmation whether or not an account exists for
          this email.
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: '' },
  });

  return (
    <>
      <StepTopBar step={2} backLabel="Back" onBack={onBack} />
      <StepHeader
        title="Check your inbox"
        description={
          <>
            If an account exists for <strong className="font-medium text-[#041a3a]">{email}</strong>
            , a recovery code has been sent. It expires in 10 minutes.
          </>
        }
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-6" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="recovery-code" className={FIELD_LABEL_CLASS}>
            Recovery code
          </label>
          <Input
            id="recovery-code"
            {...register('code')}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            error={!!errors.code}
            className={cn(FIELD_INPUT_CLASS, 'tracking-[0.5em]')}
          />
          <p className={cn('text-[11px]', errors.code ? 'text-red-500' : 'text-[#8b97a6]')}>
            {errors.code?.message ?? 'Enter the 6 digits from your recovery email.'}
          </p>
        </div>
        <Button type="submit" className={SUBMIT_CLASS}>
          Verify code
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      <p className="pt-4 text-center text-xs text-[#8b97a6]">
        Didn&apos;t receive the email?{' '}
        {countdown.remaining > 0 ? (
          <span className="font-medium text-[#082455]">Resend in {countdown.label}</span>
        ) : (
          <button
            type="button"
            onClick={countdown.restart}
            className="cursor-pointer font-medium text-[#082455] hover:underline"
          >
            Resend code
          </button>
        )}
      </p>
      <SupportLine />
    </>
  );
}

function ResetStep({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'password' });

  return (
    <>
      <StepTopBar step={3} backLabel="Back" onBack={onBack} />
      <StepHeader
        title="Create a new password"
        description="Choose a strong, unique password for your VIRaTeC account."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-6" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="new-password" className={FIELD_LABEL_CLASS}>
            New password
          </label>
          <div className="relative">
            <Input
              id="new-password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Enter a strong password"
              error={!!errors.password}
              className={cn(FIELD_INPUT_CLASS, 'pr-12')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <ul className="flex flex-wrap gap-2 pt-1">
            {PASSWORD_RULES.map((rule) => {
              const isMet = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] transition-colors',
                    isMet ? 'bg-[#e6f6dc] text-[#3d7a1c]' : 'bg-[#eef2f6] text-[#8b97a6]',
                  )}
                >
                  {rule.label}
                </li>
              );
            })}
          </ul>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className={FIELD_LABEL_CLASS}>
            Confirm new password
          </label>
          <Input
            id="confirm-password"
            {...register('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat your new password"
            error={!!errors.confirmPassword}
            className={FIELD_INPUT_CLASS}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" className={SUBMIT_CLASS}>
          Update password
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      <SupportLine />
    </>
  );
}

function DoneStep() {
  const navigate = useNavigate();

  return (
    <>
      <StepTopBar backLabel="Back" />
      <div className="flex flex-col items-center">
        <span className="mt-2 flex size-12 items-center justify-center rounded-full bg-[#e6f6dc] text-[#3d9a2c]">
          <Check className="size-6" />
        </span>
      </div>
      <StepHeader
        centered
        title="Password updated"
        description="Your VIRaTeC password has been changed successfully. You can now sign in with your new credentials."
      />
      <Button
        type="button"
        onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
        className={cn(SUBMIT_CLASS, 'mt-6')}
      >
        Return to login
        <ArrowRight className="w-4 h-4" />
      </Button>
    </>
  );
}

export function ResetPasswordFlow() {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');

  return (
    <div className="w-full" aria-live="polite">
      {step === 'request' && (
        <RequestStep
          onSubmit={(value) => {
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
