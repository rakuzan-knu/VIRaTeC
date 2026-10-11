import { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  id?: string;
}

export function FormField({ label, error, children, id }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
