import { cn } from '../../lib';
import type { NavItemProps } from './NavItem.types';

export function NavItem(props: NavItemProps) {
  const classes = cn(
    'inline-flex min-h-6 cursor-pointer items-center gap-nav rounded-sm text-control-md leading-input font-normal transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus active:text-brand-lime-text',
    props.active ? 'text-brand-lime-text' : 'text-text-primary hover:text-brand-lime-text',
    props.className,
  );

  if (props.dropdown) {
    const {
      label,
      active: _active,
      dropdown: _dropdown,
      expanded = false,
      className: _className,
      type = 'button',
      onClick,
      ...rest
    } = props;
    return (
      <button
        {...rest}
        onClick={onClick}
        type={type}
        aria-expanded={expanded}
        className={cn(classes, 'disabled:cursor-not-allowed disabled:opacity-50')}
      >
        <span className="wrap-anywhere">{label}</span>
        <svg
          aria-hidden="true"
          className={cn(
            'h-2 w-2.5 shrink-0 transition-transform motion-reduce:transition-none',
            expanded && 'rotate-180',
          )}
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
      </button>
    );
  }

  const { label, active, dropdown: _dropdown, className: _className, href, ...rest } = props;
  return (
    <a {...rest} href={href} aria-current={active ? 'page' : undefined} className={classes}>
      <span className="wrap-anywhere">{label}</span>
    </a>
  );
}
