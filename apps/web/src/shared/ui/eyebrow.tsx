import { cn } from '@/shared/lib';

interface EyebrowProps {
  children: string;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <div className={cn('flex items-center gap-3 lg:gap-[17px]', className)}>
      <span aria-hidden="true" className="h-px w-7 shrink-0 bg-viratec-rule lg:w-[47px]" />
      <p className="text-xs leading-[18px] tracking-[2.64px] text-viratec-accent uppercase lg:text-sm lg:leading-normal lg:tracking-[4.2px]">
        {children}
      </p>
    </div>
  );
}
