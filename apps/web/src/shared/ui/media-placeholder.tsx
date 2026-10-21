import { cn } from '@/shared/lib';

interface MediaPlaceholderProps {
  className?: string;
  src?: string;
  alt?: string;
  label?: string;
}

export function MediaPlaceholder({ className, src, alt = '', label }: MediaPlaceholderProps) {
  if (src) {
    return (
      <span className={cn('reveal-frame block w-full shrink-0 overflow-hidden', className)}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="reveal-media size-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={label ?? 'VIRaTeC'}
      className={cn(
        'reveal-frame relative flex w-full shrink-0 overflow-hidden bg-[radial-gradient(120%_120%_at_88%_8%,rgba(3,197,234,0.32)_0%,transparent_55%),linear-gradient(135deg,#0b2f6b_0%,#061a39_58%,#03122e_100%)] ring-1 ring-white/8 ring-inset',
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        fill="none"
        className="pointer-events-none absolute -right-[8%] -bottom-[30%] h-[140%] w-auto text-viratec-cyan opacity-25"
      >
        <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="100" cy="100" rx="45" ry="90" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="100" cy="100" rx="78" ry="90" stroke="currentColor" strokeWidth="0.8" />
        <path d="M10 100h180M22 55h156M22 145h156" stroke="currentColor" strokeWidth="0.8" />
        <path
          d="M40 70L95 40L150 75L130 140L70 150L40 70ZM95 40L130 140M150 75L70 150"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <g fill="currentColor">
          <circle cx="40" cy="70" r="4" />
          <circle cx="95" cy="40" r="4" />
          <circle cx="150" cy="75" r="4" />
          <circle cx="130" cy="140" r="4" />
          <circle cx="70" cy="150" r="4" />
        </g>
      </svg>
      {label && (
        <span
          aria-hidden="true"
          className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-white/8 px-3 py-1 text-[11px] font-medium tracking-[1.4px] text-white/80 uppercase lg:bottom-5 lg:left-5"
        >
          {label}
        </span>
      )}
    </span>
  );
}
