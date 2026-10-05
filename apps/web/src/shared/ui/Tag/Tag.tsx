import type { TagColor, TagProps } from './Tag.types';

const colorClasses: Record<TagColor, string> = {
  lime: 'bg-bg-tag-lime text-brand-lime-text',
  cyan: 'bg-bg-tag-cyan text-brand-cyan',
};

export function Tag({ color = 'lime', label, className = '', ...rest }: TagProps) {
  const baseClasses =
    'inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wider whitespace-nowrap uppercase';

  const combinedClasses = `${baseClasses} ${colorClasses[color]} ${className}`.trim();

  return (
    <span className={combinedClasses} {...rest}>
      {label}
    </span>
  );
}
