import type { HTMLAttributes, ReactElement, Ref } from 'react';
import type { Shortcut } from '../../lib';

export type TooltipPlacement = 'top' | 'bottom';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  text: string;
  placement?: TooltipPlacement;
  shortcut?: Shortcut;
  floatingClassName?: string;
  children: ReactElement<HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }>;
}
