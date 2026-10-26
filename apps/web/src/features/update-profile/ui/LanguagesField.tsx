import { Plus, X } from 'lucide-react';
import { LanguageLevel, PROFILE_DETAIL_LIMITS, type ProfileLanguage } from '@viratec/contracts';
import { useAccountLabels } from '@/entities/session';
import { useIntlNames } from '@/shared/lib/intlNames';
import { Select } from '@/shared/ui/Select';
import { Tooltip } from '@/shared/ui/Tooltip';

const LEVELS = Object.values(LanguageLevel);

interface LanguagesFieldProps {
  label: string;
  helperText: string;
  languageLabel: string;
  levelLabel: string;
  choosePlaceholder: string;
  addLabel: string;
  removeLabel: (language: string) => string;
  value: ProfileLanguage[];
  errors?: (string | undefined)[];
  onChange: (languages: ProfileLanguage[]) => void;
}

export function LanguagesField({
  label,
  helperText,
  languageLabel,
  levelLabel,
  choosePlaceholder,
  addLabel,
  removeLabel,
  value,
  errors,
  onChange,
}: LanguagesFieldProps) {
  const labels = useAccountLabels();
  const { languageName, languageOptions } = useIntlNames();
  const levelOptions = LEVELS.map((level) => ({
    value: level,
    label: labels.languageLevel[level],
  }));
  const isFull = value.length >= PROFILE_DETAIL_LIMITS.languagesMax;

  const update = (index: number, patch: Partial<ProfileLanguage>) =>
    onChange(value.map((language, i) => (i === index ? { ...language, ...patch } : language)));

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-label font-medium text-text-muted">{label}</legend>
      {value.map((language, index) => {
        const usedElsewhere = new Set(value.filter((_, i) => i !== index).map((l) => l.code));
        const options = languageOptions.filter((option) => !usedElsewhere.has(option.value));
        const name = language.code ? languageName(language.code) : String(index + 1);
        return (
          <div key={index} className="flex items-start gap-2">
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Select
                label={`${languageLabel} ${index + 1}`}
                hideLabel
                options={options}
                placeholder={choosePlaceholder}
                value={language.code}
                error={errors?.[index]}
                onChange={(event) => update(index, { code: event.target.value })}
              />
              <Select
                label={`${levelLabel} ${index + 1}`}
                hideLabel
                options={levelOptions}
                value={language.level}
                onChange={(event) => update(index, { level: event.target.value as LanguageLevel })}
              />
            </div>
            <Tooltip text={removeLabel(name)} className="mt-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label={removeLabel(name)}
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-viratec-subtle transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-viratec-lime"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </Tooltip>
          </div>
        );
      })}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={isFull}
          onClick={() => onChange([...value, { code: '', level: LanguageLevel.B2 }])}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-full border border-dashed border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus aria-hidden="true" className="size-4" />
          {addLabel}
        </button>
        <p className="text-caption text-text-muted">{helperText}</p>
      </div>
    </fieldset>
  );
}
