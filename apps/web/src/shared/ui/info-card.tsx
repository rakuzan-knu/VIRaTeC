import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib';
import { CardLinkLabel } from './card-link-label';
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
  default: 'border-white/10 bg-white/[0.035]',
  muted: 'border-dashed border-white/18 bg-transparent',
  invite: 'border-dashed border-viratec-lime/45 bg-viratec-lime/[0.03]',
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
    'group/card flex h-full flex-col gap-3.5 rounded-[28px] border p-6 lg:gap-4 lg:p-8',
    VARIANT_CLASS[variant],
    to &&
      'transition-colors duration-200 hover:border-white/22 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
    className,
  );

  const content = (
    <>
      {withImage && (
        <MediaPlaceholder className="h-[160px] rounded-2xl lg:h-[190px] lg:rounded-[18px]" />
      )}
      {meta && <span className="text-[13px] text-viratec-subtle">{meta}</span>}
      {index && (
        <span className="text-sm font-medium tracking-[1.4px] text-viratec-cyan">{index}</span>
      )}
      <h3
        className={cn(
          'font-display text-xl leading-[26px] font-medium tracking-[-0.02em] lg:text-2xl lg:leading-[30px]',
          isMuted ? 'text-white/60' : 'text-white',
        )}
      >
        {title}
      </h3>
      <p className="text-[15px] leading-[22px] text-viratec-muted lg:text-base lg:leading-6">
        {description}
      </p>
      {linkLabel && (
        <CardLinkLabel
          label={linkLabel}
          className={cn(
            'mt-auto pt-2 text-[15px] font-medium',
            isMuted ? 'text-viratec-cyan/60' : 'text-viratec-cyan',
          )}
        />
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
