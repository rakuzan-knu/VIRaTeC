import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { BrandLogo } from '@/shared/ui/brand-logo';

export const TOTAL_STEPS = 3;

interface StepTopBarProps {
  step?: number;
  backLabel: string;
  onBack?: () => void;
}

export function StepTopBar({ step, backLabel, onBack }: StepTopBarProps) {
  const backClass =
    'flex items-center gap-2 py-1.5 text-xs font-medium text-auth-muted hover:text-auth-navy';

  return (
    <div className="flex min-h-12 items-start justify-between">
      {onBack ? (
        <button type="button" onClick={onBack} className={`${backClass} cursor-pointer`}>
          <ChevronLeft className="size-5" />
          {backLabel}
        </button>
      ) : (
        <Link to={ROUTES.LOGIN} className={backClass}>
          <ChevronLeft className="size-5" />
          {backLabel}
        </Link>
      )}
      {step && (
        <div className="w-[184px] pt-1.5">
          <div className="flex justify-between text-[10px] leading-[15px]">
            <span className="font-medium text-auth-muted">Account recovery</span>
            <span className="text-auth-muted">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={step}
            aria-label="Account recovery progress"
            className="mt-1.5 h-1 overflow-hidden rounded-full bg-auth-border"
          >
            <div
              className="h-full rounded-full bg-auth-progress transition-[width] duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface StepHeaderProps {
  title: string;
  description: ReactNode;
  centered?: boolean;
}

export function StepHeader({ title, description, centered }: StepHeaderProps) {
  return (
    <>
      <BrandLogo className="mx-auto my-6 h-[83px] w-[232px]" />
      <div className={centered ? 'space-y-2 text-center' : 'space-y-2'}>
        <h2
          tabIndex={-1}
          className="text-[32px] outline-none lg:text-[40px] font-medium leading-[1.08] tracking-[-0.043em] text-auth-heading"
        >
          {title}
        </h2>
        <p className="text-sm leading-[21.7px] text-auth-muted">{description}</p>
      </div>
    </>
  );
}

export function SupportLine() {
  return (
    <p className="pt-5 text-center text-xs text-auth-muted">
      Need help recovering your account?{' '}
      <Link to={ROUTES.CONTACT} className="font-medium text-auth-navy hover:underline">
        Contact support
      </Link>
    </p>
  );
}

export const FIELD_LABEL_CLASS = 'text-xs font-medium text-auth-label';
export const FIELD_INPUT_CLASS = 'h-[54px] text-base';
export const SUBMIT_CLASS =
  'h-[58px] justify-between rounded-[9px] bg-auth-navy px-5 hover:bg-auth-navy-hover';
