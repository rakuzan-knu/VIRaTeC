import { useId, useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { PROFILE_LIMITS } from '@viratec/contracts';
import { Tooltip } from '@/shared/ui/Tooltip';

interface SkillsFieldProps {
  label: string;
  placeholder: string;
  helperText: string;
  addLabel: string;
  removeLabel: (skill: string) => string;
  value: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsField({
  label,
  placeholder,
  helperText,
  addLabel,
  removeLabel,
  value,
  onChange,
}: SkillsFieldProps) {
  const [draft, setDraft] = useState('');
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const isFull = value.length >= PROFILE_LIMITS.skillsMax;

  const addDraft = () => {
    const skill = draft.trim().replace(/,+$/, '').slice(0, PROFILE_LIMITS.skillMax);
    setDraft('');
    if (!skill || isFull) return;
    if (value.some((item) => item.toLowerCase() === skill.toLowerCase())) return;
    onChange([...value, skill]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addDraft();
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <label htmlFor={inputId} className="text-label font-medium text-text-muted">
        {label}
      </label>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <li
              key={skill}
              className="inline-flex items-center gap-1 rounded-full border border-white/14 bg-white/6 py-1.5 pr-1.5 pl-3.5 text-sm text-white"
            >
              {skill}
              <Tooltip text={removeLabel(skill)}>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((item) => item !== skill))}
                  aria-label={removeLabel(skill)}
                  className="flex size-6 cursor-pointer items-center justify-center rounded-full text-viratec-muted transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-viratec-lime"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
      <div className="flex w-full gap-2">
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isFull}
          maxLength={PROFILE_LIMITS.skillMax}
          placeholder={placeholder}
          aria-describedby={helperId}
          className="w-full min-w-0 rounded-control border border-border-default bg-bg-input px-4 py-3.5 text-control-md leading-input text-text-primary outline-none transition-colors placeholder:text-text-subtle focus:border-border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
        />
        <button
          type="button"
          onClick={addDraft}
          disabled={isFull || draft.trim() === ''}
          className="shrink-0 cursor-pointer rounded-control border border-border-strong bg-bg-input px-4 text-control-md font-medium text-white transition-colors hover:border-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          {addLabel}
        </button>
      </div>
      <p id={helperId} className="text-caption text-text-muted">
        {helperText}
      </p>
    </div>
  );
}
