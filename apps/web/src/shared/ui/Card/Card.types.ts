import type { HTMLAttributes } from 'react';

import type { TagColor } from '../Tag';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description: string;
  tagLabel?: string;
  tagColor?: TagColor;
  linkLabel?: string;
  href?: string;
}
