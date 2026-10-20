import { useId } from 'react';
import { cn } from '@/shared/lib';

interface RadioOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface RadioListProps<TValue extends string> {
  label: string;
  options: readonly RadioOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
}

export function RadioList<TValue extends string>({
  label,
  options,
  value,
  onChange,
}: RadioListProps<TValue>) {
  const name = useId();

  return (
    <fieldset className="flex flex-col">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => {
        const isChecked = option.value === value;
        return (
          <label
            key={option.value}
            className="flex cursor-pointer items-center justify-between py-3 text-[17px] text-white"
          >
            {option.label}
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isChecked}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className={cn(
                'flex size-5 items-center justify-center rounded-full border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-viratec-lime',
                isChecked ? 'border-viratec-lime bg-viratec-lime' : 'border-white/35',
              )}
            >
              {isChecked && <span className="size-2 rounded-full bg-viratec-ink" />}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
