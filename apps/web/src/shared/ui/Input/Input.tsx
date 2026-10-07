import { useId } from 'react';
import { cn } from '../../lib';
import type { InputProps } from './Input.types';

export function Input({
  label,
  error,
  helperText,
  id,
  className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const descriptionIds =
    [describedBy, helperText && helperId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-2">
      <label htmlFor={inputId} className="text-label font-medium text-text-muted">
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        aria-invalid={error ? true : invalid}
        aria-describedby={descriptionIds}
        className={cn(
          'w-full min-w-0 rounded-control bg-bg-input px-4 py-3.5 text-control-md leading-input text-text-primary outline-none transition-colors motion-reduce:transition-none placeholder:text-text-subtle disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
          error
            ? 'border-control border-state-error'
            : 'border border-border-default focus:border-border-focus',
          className,
        )}
      />
      {helperText && (
        <p id={helperId} className="text-caption text-text-muted">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-caption text-state-error">
          {error}
        </p>
      )}
    </div>
  );
}
