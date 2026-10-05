import type { AnchorHTMLAttributes } from 'react';

export interface NavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
  active?: boolean;
  dropdown?: boolean;
}
