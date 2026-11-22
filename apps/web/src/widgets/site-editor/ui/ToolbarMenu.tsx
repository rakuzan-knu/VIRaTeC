import { useEffect, useId, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn, useDismiss } from '@/shared/lib';

type Icon = ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;

export interface ToolbarMenuItem {
  key: string;
  label: string;
  icon?: Icon;
  kind?: 'action' | 'check' | 'radio';
  checked?: boolean;
  group?: string;
  onSelect: () => void;
}

interface ToolbarMenuBaseProps {
  label: string;
  buttonLabel: string;
  icon: Icon;
  variant?: 'plain' | 'accent';
  tourAnchor?: string;
  panelClassName?: string;
}

type ToolbarMenuProps = ToolbarMenuBaseProps &
  (
    | { items: readonly ToolbarMenuItem[]; children?: never }
    | { items?: never; children: (close: () => void) => ReactNode }
  );

const ROLE = { action: 'menuitem', check: 'menuitemcheckbox', radio: 'menuitemradio' } as const;

const ITEM_SELECTOR = '[data-menu-item]:not(:disabled)';

export function ToolbarMenu({
  label,
  buttonLabel,
  icon: Icon,
  items,
  children,
  variant = 'plain',
  tourAnchor,
  panelClassName,
}: ToolbarMenuProps) {
  const [isOpen, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  };
  useDismiss(rootRef, isOpen, () => close(false));

  useEffect(() => {
    if (!isOpen) return;
    const handleBlur = () => setOpen(false);
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isOpen]);

  const focusItem = (index: number) => {
    const buttons = rootRef.current?.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR);
    if (!buttons || buttons.length === 0) return;
    buttons[(index + buttons.length) % buttons.length]?.focus();
  };

  const open = (index: number) => {
    setOpen(true);
    requestAnimationFrame(() => focusItem(index));
  };

  return (
    <div ref={rootRef} className="relative" data-tour={tourAnchor}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-label={label}
        onClick={() => (isOpen ? close(false) : open(0))}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            open(0);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            open(-1);
          }
        }}
        className={cn(
          'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 pointer-coarse:h-11 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none',
          variant === 'accent'
            ? 'bg-viratec-cyan text-viratec-ink hover:bg-viratec-cyan/85'
            : 'text-text-primary hover:bg-white/8',
          isOpen && variant === 'plain' && 'bg-white/10',
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
        <span aria-hidden="true" className="hidden sm:inline">
          {buttonLabel}
        </span>
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </button>
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={(event) => {
            const buttons = [
              ...(rootRef.current?.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR) ?? []),
            ];
            const index = buttons.findIndex((button) => button === document.activeElement);
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
              event.preventDefault();
              focusItem(index + 1);
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
              event.preventDefault();
              focusItem(index - 1);
            } else if (event.key === 'Home') {
              event.preventDefault();
              focusItem(0);
            } else if (event.key === 'End') {
              event.preventDefault();
              focusItem(-1);
            } else if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              close(true);
            } else if (event.key === 'Tab') {
              close(false);
            }
          }}
          className={cn(
            'editor-pop-in absolute top-full right-0 z-[2147483005] mt-2 flex w-[min(300px,calc(100vw-24px))] flex-col rounded-2xl border border-white/12 bg-viratec-deep p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)]',
            panelClassName,
          )}
        >
          {children?.(() => close(true))}
          {items?.map((item, index) => {
            const kind = item.kind ?? 'action';
            const ItemIcon = item.icon;
            const isNewGroup = index > 0 && item.group !== items[index - 1]?.group;
            return (
              <div
                key={item.key}
                role="none"
                className={cn(isNewGroup && 'mt-1 border-t border-white/8 pt-1')}
              >
                <button
                  type="button"
                  role={ROLE[kind]}
                  aria-checked={kind === 'action' ? undefined : Boolean(item.checked)}
                  data-menu-item
                  tabIndex={-1}
                  onClick={() => {
                    close(true);
                    item.onSelect();
                  }}
                  className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-[14px] text-text-primary hover:bg-white/8 focus-visible:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-border-focus"
                >
                  {ItemIcon ? (
                    <ItemIcon aria-hidden="true" className="size-4 shrink-0 text-text-muted" />
                  ) : (
                    <span aria-hidden="true" className="size-4 shrink-0" />
                  )}
                  <span className="flex-1">{item.label}</span>
                  {kind !== 'action' && item.checked && (
                    <Check aria-hidden="true" className="size-4 shrink-0 text-viratec-cyan" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
