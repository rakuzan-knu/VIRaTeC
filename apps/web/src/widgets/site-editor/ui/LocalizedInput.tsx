import { LOCALES, type Locale } from '@/shared/i18n';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import type { SiteEditorMessages } from '../model/messages';

type Text = Record<Locale, string>;

interface LocalizedInputProps {
  label: string;
  value: Text;
  multiline?: boolean;
  helperText?: string;
  readOnly: boolean;
  t: SiteEditorMessages;
  onChange: (value: Text) => void;
}

export function LocalizedInput({
  label,
  value,
  multiline = false,
  helperText,
  readOnly,
  t,
  onChange,
}: LocalizedInputProps) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-1 text-label font-medium text-text-primary">{label}</legend>
      {helperText && <p className="-mt-1 text-caption text-text-muted">{helperText}</p>}
      {LOCALES.map((locale) =>
        multiline ? (
          <Textarea
            key={locale}
            label={t.locales[locale]}
            lang={locale}
            value={value[locale]}
            readOnly={readOnly}
            rows={4}
            onChange={(event) => onChange({ ...value, [locale]: event.target.value })}
          />
        ) : (
          <Input
            key={locale}
            label={t.locales[locale]}
            lang={locale}
            value={value[locale]}
            readOnly={readOnly}
            maxLength={300}
            onChange={(event) => onChange({ ...value, [locale]: event.target.value })}
          />
        ),
      )}
    </fieldset>
  );
}
