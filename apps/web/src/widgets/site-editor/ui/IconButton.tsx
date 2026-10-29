import type { ComponentProps, ComponentType } from 'react';
import { cn } from '@/shared/lib';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { Shortcut } from '../model/shortcuts';

export const EDITOR_TOOLTIP_CLASS = 'z-[2147483006]';

const SIZE_CLASS = {
  sm: 'size-8 rounded-lg pointer-coarse:size-11',
  md: 'size-9 rounded-xl pointer-coarse:size-11',
  lg: 'size-10 rounded-xl pointer-coarse:size-11',
} as const;

interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children' | 'aria-label'> {
  label: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
  shortcut?: Shortcut;
  size?: keyof typeof SIZE_CLASS;
}

export function IconButton({
  label,
  icon: Icon,
  shortcut,
  size = 'md',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <Tooltip
      text={shortcut ? `${label} (${shortcut.label})` : label}
      floatingClassName={EDITOR_TOOLTIP_CLASS}
      className="shrink-0"
    >
      <button
        {...rest}
        type={type}
        aria-label={label}
        aria-keyshortcuts={shortcut?.aria}
        className={cn(
          'inline-flex shrink-0 cursor-pointer items-center justify-center text-text-muted transition-colors hover:bg-white/8 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none',
          SIZE_CLASS[size],
          className,
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
      </button>
    </Tooltip>
  );
}
