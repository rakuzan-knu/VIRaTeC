import { useId } from 'react';
import { cn } from '@/shared/lib';
import type { SiteEditorMessages } from '../model/messages';
import { PUBLICATION_TEMPLATES, type PublicationTemplate } from '../model/publicationTemplates';

interface WizardTemplatePickerProps {
  value: PublicationTemplate;
  t: SiteEditorMessages;
  onChange: (value: PublicationTemplate) => void;
}

export function WizardTemplatePicker({ value, t, onChange }: WizardTemplatePickerProps) {
  const name = useId();

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-[15px] font-medium text-text-primary">
        {t.wizard.templateLabel}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {PUBLICATION_TEMPLATES.map((item, index) => {
          const copy = t.wizard.templates[item];
          const isChecked = item === value;
          return (
            <label
              key={item}
              className={cn(
                'flex min-h-11 cursor-pointer flex-col gap-1 rounded-xl border px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-border-focus motion-reduce:transition-none',
                isChecked
                  ? 'border-viratec-cyan bg-viratec-cyan/10'
                  : 'border-white/12 hover:border-white/25 hover:bg-white/5',
              )}
            >
              <input
                type="radio"
                name={name}
                value={item}
                checked={isChecked}
                autoFocus={index === 0}
                onChange={() => onChange(item)}
                className="sr-only"
              />
              <span className="text-[15px] font-medium text-text-primary">{copy.title}</span>
              <span className="text-[13px] text-text-muted">{copy.text}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
