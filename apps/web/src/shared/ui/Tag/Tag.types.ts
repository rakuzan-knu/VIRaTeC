import type { HTMLAttributes } from 'react';

export type TagColor = 'lime' | 'cyan';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  color?: TagColor;
  label: string;
}
