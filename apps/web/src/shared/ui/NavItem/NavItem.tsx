import type { NavItemProps } from './NavItem.types';

export function NavItem({
  label,
  active = false,
  dropdown = false,
  className = '',
  href = '#',
  ...rest
}: NavItemProps) {
  const baseClasses =
    'inline-flex items-center gap-1.5 text-base font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus';
  const activeClasses = active
    ? 'text-brand-lime-text'
    : 'text-text-primary hover:text-brand-lime-text';

  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`${baseClasses} ${activeClasses} ${className}`.trim()}
      {...rest}
    >
      <span>{label}</span>
      {dropdown && (
        <svg
          aria-hidden="true"
          className={`h-2 w-2.5 shrink-0 transition-transform duration-200 ${
            active ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 10 5"
        >
          <path
            d="M1 1l4 3 4-3"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      )}
    </a>
  );
}
