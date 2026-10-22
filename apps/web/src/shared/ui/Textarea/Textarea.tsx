import { useId } from 'react';
import { cn } from '../../lib';
import type { TextareaProps } from './Textarea.types';

export function Textarea({
  label,
  error,
  helperText,
  id,
  className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;
  const descriptionIds =
    [describedBy, helperText && helperId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-2">
      <label htmlFor={textareaId} className="text-label font-medium text-text-muted">
        {label}
      </label>
      <textarea
        {...rest}
        id={textareaId}
        aria-invalid={error ? true : invalid}
        aria-describedby={descriptionIds}
        className={cn(
          'min-h-28 w-full min-w-0 resize-y rounded-control bg-bg-input px-4 py-3.5 text-control-md leading-6 text-text-primary outline-none transition-colors motion-reduce:transition-none placeholder:text-text-subtle disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
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
