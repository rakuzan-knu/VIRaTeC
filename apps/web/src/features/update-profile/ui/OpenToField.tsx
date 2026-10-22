import { Check } from 'lucide-react';
import { OpenToOption } from '@viratec/contracts';
import { useAccountLabels } from '@/entities/session';
import { cn } from '@/shared/lib';

const OPTIONS = Object.values(OpenToOption);

interface OpenToFieldProps {
  label: string;
  helperText: string;
  value: OpenToOption[];
  onChange: (value: OpenToOption[]) => void;
}

export function OpenToField({ label, helperText, value, onChange }: OpenToFieldProps) {
  const labels = useAccountLabels();

  const toggle = (option: OpenToOption) =>
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-label font-medium text-text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2.5">
        {OPTIONS.map((option) => {
          const isActive = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => toggle(option)}
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
                isActive
                  ? 'border-viratec-lime/60 bg-viratec-lime/14 text-viratec-accent'
                  : 'border-white/22 bg-white/6 text-white hover:bg-white/12',
              )}
            >
              {isActive && <Check aria-hidden="true" className="size-4" />}
              {labels.openTo[option]}
            </button>
          );
        })}
      </div>
      <p className="text-caption text-text-muted">{helperText}</p>
    </fieldset>
  );
}
