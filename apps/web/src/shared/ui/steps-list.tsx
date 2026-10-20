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
    <ol className={cn('flex flex-col lg:flex-row lg:gap-6', className)}>
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex gap-4 border-t border-white/14 py-5 lg:flex-1 lg:flex-col lg:gap-3 lg:pb-0"
        >
          <span className="text-[28px] leading-8 text-viratec-accent lg:text-[40px] lg:leading-[44px]">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="flex flex-1 flex-col gap-1.5">
            <span className="text-lg font-medium text-white lg:text-[21px]">{step.title}</span>
            <span className="text-[15px] leading-[22px] text-viratec-muted">
              {step.description}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
