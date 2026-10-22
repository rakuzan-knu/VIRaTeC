import type { Ref, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  hideLabel?: boolean;
  ref?: Ref<HTMLSelectElement>;
}
