import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/shared/lib';

interface MoreMenuRowProps {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
  label: string;
  hint: string;
  checked?: boolean;
  disabled?: boolean;
  isHintLive?: boolean;
  trailing?: ReactNode;
  onClick: () => void;
}

export function MoreMenuRow({
  icon: Icon,
  label,
  hint,
  checked,
  disabled = false,
  isHintLive = false,
  trailing,
  onClick,
}: MoreMenuRowProps) {
  return (
    <button
      type="button"
      role={checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
      aria-checked={checked}
      data-menu-item
      tabIndex={-1}
      disabled={disabled}
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-start transition-colors hover:bg-white/8 focus-visible:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:hover:bg-transparent motion-reduce:transition-none"
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          disabled ? 'bg-white/4 text-text-subtle' : 'bg-viratec-cyan/12 text-viratec-cyan',
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'text-[14px] leading-5 font-medium',
            disabled ? 'text-text-muted' : 'text-text-primary',
          )}
        >
          {label}
        </span>
        <span
          aria-live={isHintLive ? 'polite' : undefined}
          className="text-[13px] leading-[18px] text-text-muted"
        >
          {hint}
        </span>
      </span>
      {trailing}
    </button>
  );
}
