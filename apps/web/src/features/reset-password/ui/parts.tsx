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
    'flex items-center gap-2 py-1.5 text-xs font-medium text-[#677588] hover:text-[#082455]';

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
            <span className="font-medium text-[#677588]">Account recovery</span>
            <span className="text-[#8b97a6]">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={step}
            aria-label="Account recovery progress"
            className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#d7e0e8]"
          >
            <div
              className="h-full rounded-full bg-[#1976bf] transition-[width] duration-300"
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
        <h2 className="text-[32px] lg:text-[40px] font-medium leading-[1.08] tracking-[-0.043em] text-[#041a3a]">
          {title}
        </h2>
        <p className="text-sm leading-[21.7px] text-[#677588]">{description}</p>
      </div>
    </>
  );
}

export function SupportLine() {
  return (
    <p className="pt-5 text-center text-xs text-[#8b97a6]">
      Need help recovering your account?{' '}
      <Link to={ROUTES.CONTACT} className="font-medium text-[#082455] hover:underline">
        Contact support
      </Link>
    </p>
  );
}

export const FIELD_LABEL_CLASS = 'text-xs font-medium text-[#0b1f3a]';
export const FIELD_INPUT_CLASS = 'h-[54px] text-base';
export const SUBMIT_CLASS =
  'h-[58px] justify-between rounded-[9px] bg-[#082455] px-5 hover:bg-[#0d3170]';
