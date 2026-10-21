import { cn } from '@/shared/lib';

interface EyebrowProps {
  children: string;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-[15px] leading-5 font-medium tracking-[-0.01em] text-viratec-accent lg:text-[17px] lg:leading-6',
        className,
      )}
    >
      {children}
    </p>
  );
}
