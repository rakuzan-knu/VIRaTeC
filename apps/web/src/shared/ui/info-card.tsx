import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn, trackSpotlight } from '@/shared/lib';
import { CardLinkLabel } from './card-link-label';
import { MediaPlaceholder } from './media-placeholder';

export type InfoCardVariant = 'default' | 'muted' | 'invite';

export interface InfoCardProps {
  index?: string;
  title: string;
  description: string;
  meta?: string;
  withImage?: boolean;
  image?: string;
  imageAlt?: string;
  logo?: string;
  linkLabel?: string;
  to?: string;
  variant?: InfoCardVariant;
  footer?: ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<InfoCardVariant, string> = {
  default: 'atlas-card border-transparent',
  muted: 'border-dashed border-white/18 bg-transparent',
  invite: 'border-dashed border-viratec-lime/45 bg-viratec-lime/[0.03]',
};

export function InfoCard({
  index,
  title,
  description,
  meta,
  withImage,
  image,
  imageAlt,
  logo,
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
      'atlas-spotlight relative isolate transition-colors duration-200 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
    to && variant !== 'default' && 'hover:border-white/30',
    className,
  );

  const content = (
    <>
      {(withImage || image) && (
        <MediaPlaceholder
          src={image}
          alt={imageAlt}
          className="h-[160px] rounded-2xl lg:h-[190px] lg:rounded-[18px]"
        />
      )}
      {logo && (
        <img
          src={logo}
          alt=""
          loading="lazy"
          className="mb-2 h-11 w-auto max-w-full self-start object-contain object-left opacity-90 lg:h-12"
        />
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
      <Link to={to} className={classes} onPointerMove={trackSpotlight}>
        {content}
      </Link>
    );
  }

  return <article className={classes}>{content}</article>;
}
