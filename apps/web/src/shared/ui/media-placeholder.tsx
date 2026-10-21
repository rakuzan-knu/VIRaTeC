import { cn } from '@/shared/lib';
import { NOT_AVAILABLE_YET } from '@/shared/config/navigation';

interface MediaPlaceholderProps {
  className?: string;
}

export function MediaPlaceholder({ className }: MediaPlaceholderProps) {
  return (
    <span
      role="img"
      aria-label={`Image: ${NOT_AVAILABLE_YET}`}
      className={cn(
        'flex w-full shrink-0 items-center justify-center bg-viratec-deep ring-1 ring-white/8 ring-inset',
        className,
      )}
    >
      <span aria-hidden="true" className="text-[13px] text-white/50">
        Image: {NOT_AVAILABLE_YET}
      </span>
    </span>
  );
}
