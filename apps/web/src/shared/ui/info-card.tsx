import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib';
import { MediaPlaceholder } from './media-placeholder';

export type InfoCardVariant = 'default' | 'muted' | 'invite';

export interface InfoCardProps {
  index?: string;
  title: string;
  description: string;
  meta?: string;
  withImage?: boolean;
  linkLabel?: string;
  to?: string;
  variant?: InfoCardVariant;
  footer?: ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<InfoCardVariant, string> = {
  default: 'border-white/12 bg-white/5',
  muted: 'border-dashed border-white/22 bg-white/2',
  invite: 'border-dashed border-[rgba(181,250,102,0.5)]',
};

export function InfoCard({
  index,
  title,
  description,
  meta,
  withImage,
  linkLabel,
  to,
  variant = 'default',
  footer,
  className,
}: InfoCardProps) {
  const isMuted = variant === 'muted';
  const classes = cn(
    'flex h-full flex-col gap-3.5 rounded-[22px] border p-5 lg:p-7',
    VARIANT_CLASS[variant],
    to &&
      'transition-colors hover:border-white/25 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
    className,
  );

  const content = (
    <>
      {withImage && (
        <MediaPlaceholder className="h-[150px] rounded-xl lg:h-[170px] lg:rounded-[14px]" />
      )}
      {meta && <span className="text-[13px] text-viratec-subtle">{meta}</span>}
      {index && (
        <span className="text-sm font-medium tracking-[1.4px] text-viratec-cyan">{index}</span>
      )}
      <h3
        className={cn(
          'text-xl leading-[26px] font-medium lg:text-[22px] lg:leading-7',
          isMuted ? 'text-white/60' : 'text-white',
        )}
      >
        {title}
      </h3>
      <p className="text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
        {description}
      </p>
      {linkLabel && (
        <span
          className={cn(
            'mt-auto pt-1 text-[15px] font-medium',
            isMuted ? 'text-viratec-cyan/60' : 'text-viratec-cyan',
          )}
        >
          {linkLabel}
        </span>
      )}
      {footer}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return <article className={classes}>{content}</article>;
}
