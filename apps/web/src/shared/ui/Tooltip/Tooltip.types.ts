import type { HTMLAttributes, ReactElement, Ref } from 'react';

export type TooltipPlacement = 'top' | 'bottom';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  text: string;
  placement?: TooltipPlacement;
  /** One focusable trigger forwarding DOM props and its ref (React 19). */
  children: ReactElement<HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }>;
}
