import { useId } from 'react';
import type { InputProps } from './Input.types';

export function Input({ label, error, id, className = '', ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  const baseClasses =
    'w-full rounded-control border-[1.5px] bg-bg-input px-4 py-3.5 text-base text-text-primary outline-none transition-colors placeholder:text-text-subtle disabled:opacity-50';

  const borderClasses = error
    ? 'border-state-error'
    : 'border-border-default focus:border-border-focus';

  const combinedClasses = `${baseClasses} ${borderClasses} ${className}`.trim();

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={combinedClasses}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-state-error">
          {error}
        </p>
      )}
    </div>
  );
}
