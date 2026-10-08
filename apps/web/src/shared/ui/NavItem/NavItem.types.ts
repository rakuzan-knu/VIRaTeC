import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEventHandler } from 'react';

interface NavItemBase {
  label: string;
  active?: boolean;
}

export type NavItemProps = NavItemBase &
  (
    | (AnchorHTMLAttributes<HTMLAnchorElement> & { dropdown?: false; href: string })
    | (ButtonHTMLAttributes<HTMLButtonElement> & {
        dropdown: true;
        expanded?: boolean;
        onClick: MouseEventHandler<HTMLButtonElement>;
      })
  );
