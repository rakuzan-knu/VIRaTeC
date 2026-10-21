import { cn } from '@/shared/lib';
import { useCommonMessages } from '@/shared/i18n';

interface MediaPlaceholderProps {
  className?: string;
}

export function MediaPlaceholder({ className }: MediaPlaceholderProps) {
  const common = useCommonMessages();
  const label = common.unavailable(common.image);

  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        'flex w-full shrink-0 items-center justify-center bg-viratec-deep ring-1 ring-white/8 ring-inset',
        className,
      )}
    >
      <span aria-hidden="true" className="text-[13px] text-white/50">
        {label}
      </span>
    </span>
  );
}
