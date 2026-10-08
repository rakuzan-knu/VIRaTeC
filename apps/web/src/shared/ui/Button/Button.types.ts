import type { ButtonHTMLAttributes, Ref } from 'react';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'lg' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  showArrow?: boolean;
  /** Prevents duplicate activation while retaining the label and button dimensions. */
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}
