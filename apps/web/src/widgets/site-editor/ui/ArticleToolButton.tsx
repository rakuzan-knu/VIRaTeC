import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/shared/lib';

const BUTTON_CLASS =
  'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none';

interface ArticleToolButtonProps {
  label: string;
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
  short?: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function ArticleToolButton({
  label,
  icon: Icon,
  short,
  isActive,
  disabled,
  onClick,
}: ArticleToolButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive === undefined ? undefined : isActive}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        BUTTON_CLASS,
        isActive ? 'bg-viratec-cyan text-viratec-ink' : 'text-text-primary hover:bg-white/8',
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="size-4" /> : null}
      {short ?? label}
    </button>
  );
}
