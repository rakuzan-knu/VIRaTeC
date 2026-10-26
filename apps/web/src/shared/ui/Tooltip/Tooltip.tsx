import {
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  arrow,
} from '@floating-ui/react';
import { cloneElement, useRef, useState } from 'react';
import { cn } from '../../lib';
import type { TooltipProps } from './Tooltip.types';

export function Tooltip({
  text,
  placement = 'top',
  shortcut,
  floatingClassName,
  children,
  className,
  ...rest
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef<SVGSVGElement>(null);
  const { refs, elements, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(12),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
  });
  const hover = useHover(context, {
    move: false,
    delay: { open: 300 },
    handleClose: safePolygon(),
  });
  const focus = useFocus(context, { visibleOnly: false });
  const dismiss = useDismiss(context, { referencePress: true });
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);
  const ref = useMergeRefs([refs.setReference, children.props.ref]);
  const triggerProps = getReferenceProps(children.props);
  const describedBy =
    [children.props['aria-describedby'], open && context.floatingId].filter(Boolean).join(' ') ||
    undefined;

  return (
    <>
      <span {...rest} className={cn('inline-flex min-w-0', className)}>
        {cloneElement(children, {
          ...triggerProps,
          ref,
          'aria-describedby': describedBy,
          'aria-keyshortcuts': shortcut?.aria ?? children.props['aria-keyshortcuts'],
        })}
      </span>
      {open && (
        <FloatingPortal root={elements.domReference?.closest('dialog') ?? undefined}>
          <div
            {...getFloatingProps()}
            ref={refs.setFloating}
            style={floatingStyles}
            className={cn(
              'z-tooltip max-w-tooltip wrap-anywhere rounded-tooltip bg-bg-tooltip px-3 py-2 text-label font-medium text-text-on-light',
              floatingClassName,
            )}
          >
            {text}
            {shortcut && (
              <kbd className="ml-2 rounded-sm border border-current/25 px-1.5 py-px font-sans text-[11px] leading-4 opacity-70">
                {shortcut.label}
              </kbd>
            )}
            <FloatingArrow
              ref={arrowRef}
              context={context}
              width={14}
              height={8}
              className="fill-bg-tooltip"
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
