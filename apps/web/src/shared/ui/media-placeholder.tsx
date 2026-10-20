import { cn } from '@/shared/lib';

interface MediaPlaceholderProps {
  className?: string;
}

export function MediaPlaceholder({ className }: MediaPlaceholderProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block w-full shrink-0 bg-linear-to-r from-[#0a3d8f] to-[rgba(27,212,223,0.55)]',
        className,
      )}
    />
  );
}
