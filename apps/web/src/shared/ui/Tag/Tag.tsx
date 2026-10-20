import { cn } from '../../lib';
import type { TagColor, TagProps } from './Tag.types';

const colorClasses: Record<TagColor, string> = {
  lime: 'bg-bg-tag-lime text-brand-lime-text',
  cyan: 'bg-bg-tag-cyan text-brand-cyan',
};

export function Tag({ color = 'lime', label, className, ...rest }: TagProps) {
  return (
    <span
      {...rest}
      className={cn(
        'inline-flex w-fit max-w-full items-center rounded-full px-2.5 py-1 text-caption font-medium tracking-tag wrap-anywhere uppercase',
        colorClasses[color],
        className,
      )}
    >
      {label}
    </span>
  );
}
