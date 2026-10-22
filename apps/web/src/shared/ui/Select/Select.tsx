import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib';
import type { SelectProps } from './Select.types';

export function Select({
  label,
  options,
  placeholder,
  error,
  helperText,
  hideLabel = false,
  id,
  className,
  'aria-describedby': describedBy,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;
  const descriptionIds =
    [describedBy, helperText && helperId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-2">
      <label
        htmlFor={selectId}
        className={cn('text-label font-medium text-text-muted', hideLabel && 'sr-only')}
      >
        {label}
      </label>
      <div className="relative w-full">
        <select
          {...rest}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptionIds}
          className={cn(
            'w-full min-w-0 cursor-pointer appearance-none rounded-control bg-bg-input py-3.5 pr-11 pl-4 text-control-md leading-input text-text-primary outline-none transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
            error
              ? 'border-control border-state-error'
              : 'border border-border-default focus:border-border-focus',
            className,
          )}
        >
          {placeholder !== undefined && (
            <option value="" className="bg-viratec-bg">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-viratec-bg">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2 text-text-muted"
        />
      </div>
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
