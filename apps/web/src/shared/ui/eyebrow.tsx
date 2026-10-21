import { cn } from '@/shared/lib';

interface EyebrowProps {
  children: string;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-3 text-[15px] leading-5 font-medium tracking-[-0.01em] text-viratec-accent before:h-px before:w-6 before:shrink-0 before:bg-current before:opacity-70 before:content-[''] lg:text-[17px] lg:leading-6",
        className,
      )}
    >
      {children}
    </p>
  );
}
