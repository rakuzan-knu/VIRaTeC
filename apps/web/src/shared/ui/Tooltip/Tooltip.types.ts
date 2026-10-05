import type { HTMLAttributes, ReactNode } from 'react';

export type TooltipPlacement = 'top' | 'bottom';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  text: string;
  placement?: TooltipPlacement;
  children: ReactNode;
}
