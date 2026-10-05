import { Tag } from '../Tag';
import type { CardProps } from './Card.types';

export function Card({
  title,
  description,
  tagLabel,
  tagColor = 'lime',
  linkLabel = 'Explore →',
  href,
  className = '',
  ...rest
}: CardProps) {
  const baseClasses =
    'flex h-full flex-col gap-3.5 rounded-card border border-border-default bg-bg-card p-7 transition-colors hover:border-border-strong';

  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <article className={combinedClasses} {...rest}>
      {tagLabel && <Tag color={tagColor} label={tagLabel} />}
      <h3 className="text-card-title font-medium text-text-primary">{title}</h3>
      <p className="text-base leading-6 text-text-muted">{description}</p>
      {href && (
        <div className="mt-auto pt-2">
          <a
            href={href}
            className="rounded-sm text-base font-medium text-brand-cyan hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus"
          >
            {linkLabel}
          </a>
        </div>
      )}
    </article>
  );
}
