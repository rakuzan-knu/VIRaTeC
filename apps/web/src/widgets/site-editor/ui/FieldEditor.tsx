import { useEffect, useRef } from 'react';
import type { ContentLocales } from '@viratec/contracts';
import { LOCALES, type Locale } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { allowedValues, type FieldDefinition } from '../model/contentModel';
import type { SiteEditorMessages } from '../model/messages';
import { AssetField } from './AssetField';
import { EntryLinksField } from './EntryLinksField';
import { PublicationKeysField } from './PublicationKeysField';

export interface FieldEditorProps {
  field: FieldDefinition;
  values: Record<string, unknown> | undefined;
  locales: ContentLocales;
  focusLocale?: Locale;
  isFocused: boolean;
  readOnly: boolean;
  t: SiteEditorMessages;
  onChange: (localeCode: string, value: unknown) => void;
  onPersist?: (localeCode: string, value: unknown) => void;
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '');

function ScalarInput({
  field,
  label,
  value,
  readOnly,
  autoFocus,
  t,
  onChange,
}: {
  field: FieldDefinition;
  label: string;
  value: unknown;
  readOnly: boolean;
  autoFocus: boolean;
  t: SiteEditorMessages;
  onChange: (value: unknown) => void;
}) {
  const helperText = field.help;
  const options = allowedValues(field);

  if (field.type === 'Boolean') {
    return (
      <label className="flex items-center gap-3 text-[15px] text-text-primary">
        <Checkbox
          checked={value === true}
          disabled={readOnly}
          autoFocus={autoFocus}
          onChange={(event) => onChange(event.target.checked)}
        />
        {label}
      </label>
    );
  }
  if (options) {
    return (
      <Select
        label={label}
        helperText={helperText}
        value={asString(value)}
        disabled={readOnly}
        autoFocus={autoFocus}
        placeholder={t.inspector.noValue}
        options={options.map((option) => ({ value: option, label: option }))}
        onChange={(event) => onChange(event.target.value || undefined)}
      />
    );
  }
  if (field.type === 'Text') {
    return (
      <Textarea
        label={label}
        helperText={helperText}
        value={asString(value)}
        readOnly={readOnly}
        autoFocus={autoFocus}
        rows={Math.min(14, Math.max(3, asString(value).split('\n').length + 1))}
        onChange={(event) => onChange(event.target.value || undefined)}
      />
    );
  }
  if (field.type === 'Array') {
    const lines = Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
    return (
      <Textarea
        label={label}
        helperText={[helperText, t.inspector.onePerLine].filter(Boolean).join(' ')}
        value={lines.join('\n')}
        readOnly={readOnly}
        autoFocus={autoFocus}
        rows={Math.min(10, Math.max(3, lines.length + 1))}
        onChange={(event) => {
          const items = event.target.value.split('\n');
          onChange(items.some((item) => item.trim()) ? items : undefined);
        }}
      />
    );
  }
  if (field.type === 'Integer') {
    return (
      <Input
        label={label}
        helperText={helperText}
        type="number"
        inputMode="numeric"
        step={1}
        value={typeof value === 'number' ? String(value) : ''}
        readOnly={readOnly}
        autoFocus={autoFocus}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          onChange(Number.isFinite(parsed) ? parsed : undefined);
        }}
      />
    );
  }
  if (field.type === 'Date') {
    return (
      <Input
        label={label}
        helperText={helperText}
        type="date"
        value={asString(value).slice(0, 10)}
        readOnly={readOnly}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value || undefined)}
      />
    );
  }
  return (
    <Input
      label={label}
      helperText={helperText}
      value={asString(value)}
      readOnly={readOnly}
      autoFocus={autoFocus}
      maxLength={256}
      onChange={(event) => onChange(event.target.value || undefined)}
    />
  );
}

export function FieldEditor({
  field,
  values,
  locales,
  focusLocale,
  isFocused,
  readOnly,
  t,
  onChange,
  onPersist,
}: FieldEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const title = field.required ? `${field.name} · ${t.inspector.required}` : field.name;

  useEffect(() => {
    if (isFocused) ref.current?.scrollIntoView({ block: 'center' });
  }, [isFocused]);

  const isLink = field.type === 'Link' || (field.type === 'Array' && field.items?.type === 'Link');
  let body;
  if (field.source === 'publication') {
    body = (
      <PublicationKeysField
        label={title}
        help={field.help}
        value={values?.[locales.en]}
        readOnly={readOnly}
        t={t}
        onChange={(value) => onChange(locales.en, value)}
      />
    );
  } else if (field.type === 'Link' && field.linkType === 'Asset') {
    body = (
      <AssetField
        label={title}
        value={values?.[locales.en]}
        readOnly={readOnly}
        required={field.required}
        t={t}
        onChange={(value) => onChange(locales.en, value)}
      />
    );
  } else if (isLink) {
    body = (
      <EntryLinksField
        field={field}
        label={title}
        value={values?.[locales.en]}
        locales={locales}
        readOnly={readOnly}
        t={t}
        onChange={(value) => onChange(locales.en, value)}
        onPersist={onPersist && ((value) => onPersist(locales.en, value))}
      />
    );
  } else if (field.localized && field.type !== 'Boolean') {
    body = (
      <fieldset className="flex min-w-0 flex-col gap-3">
        <legend className="mb-2 text-label font-medium text-text-primary">{title}</legend>
        {LOCALES.map((locale) => (
          <ScalarInput
            key={locale}
            field={field}
            label={t.locales[locale]}
            value={values?.[locales[locale]]}
            readOnly={readOnly}
            autoFocus={isFocused && locale === focusLocale}
            t={t}
            onChange={(value) => onChange(locales[locale], value)}
          />
        ))}
      </fieldset>
    );
  } else {
    body = (
      <ScalarInput
        field={field}
        label={title}
        value={values?.[locales.en]}
        readOnly={readOnly}
        autoFocus={isFocused}
        t={t}
        onChange={(value) => onChange(locales.en, value)}
      />
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border p-4 transition-colors motion-reduce:transition-none',
        isFocused ? 'border-viratec-cyan/70 bg-viratec-cyan/6' : 'border-white/8',
      )}
    >
      {body}
    </div>
  );
}
