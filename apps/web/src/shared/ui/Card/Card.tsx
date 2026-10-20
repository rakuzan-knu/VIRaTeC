import { cn } from '../../lib';
import { Tag } from '../Tag';
import type { CardProps } from './Card.types';

export function Card({
  title,
  description,
  tagLabel,
  tagColor = 'lime',
  linkLabel = 'Explore →',
  href,
  className,
  ...rest
}: CardProps) {
  return (
    <article
      {...rest}
      className={cn(
        'flex h-full min-w-0 flex-col gap-3.5 rounded-card border border-border-default bg-bg-card p-7 transition-colors motion-reduce:transition-none hover:border-border-strong',
        className,
      )}
    >
      {tagLabel && <Tag color={tagColor} label={tagLabel} />}
      <h3 className="text-card-title font-medium wrap-anywhere text-text-primary">{title}</h3>
      <p className="text-base leading-6 wrap-anywhere text-text-muted">{description}</p>
      {href && (
        <div className="mt-auto">
          <a
            href={href}
            className="cursor-pointer rounded-sm text-control-md leading-input font-medium wrap-anywhere text-brand-cyan underline-offset-4 hover:underline active:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus"
          >
            {linkLabel}
          </a>
        </div>
      )}
    </article>
  );
}
