import { cn } from '@/shared/lib';

export interface StepItem {
  title: string;
  description: string;
}

interface StepsListProps {
  steps: StepItem[];
  className?: string;
}

export function StepsList({ steps, className }: StepsListProps) {
  return (
    <div className={cn('atlas-steps', className)}>
      <span aria-hidden="true" className="atlas-steps-track" />
      <span aria-hidden="true" className="atlas-steps-progress" />
      <ol className="flex flex-col gap-10 lg:flex-row lg:gap-8">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative flex flex-col gap-3 pl-10 lg:flex-1 lg:pt-12 lg:pl-0"
          >
            <span aria-hidden="true" className="atlas-steps-node" />
            <span className="atlas-steps-number font-display text-[44px] leading-[44px] font-medium tracking-[-0.04em] lg:text-[72px] lg:leading-[72px]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="flex flex-col gap-2">
              <span className="font-display text-xl leading-[26px] font-medium tracking-[-0.02em] text-white lg:text-2xl lg:leading-[30px]">
                {step.title}
              </span>
              <span className="max-w-[44ch] text-[15px] leading-[23px] text-viratec-muted lg:text-base lg:leading-[26px]">
                {step.description}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
