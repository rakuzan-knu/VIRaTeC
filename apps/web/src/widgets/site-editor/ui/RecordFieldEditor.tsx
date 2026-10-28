import { useEffect, useId, useRef } from 'react';
import {
  readRecordValue,
  type RecordData,
  type RecordFieldDefinition,
  type RecordResource,
} from '@viratec/contracts';
import { useProjectLabels } from '@/entities/project';
import { getPublicationCover } from '@/entities/publication';
import { LOCALES, type Locale } from '@/shared/i18n';
import { absoluteImageUrl, cn, contentCoverSrc } from '@/shared/lib';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { imageRecordSchema, recordFieldText } from '../model/fieldText';
import type { SiteEditorMessages } from '../model/messages';
import { fromLocalDateTime, localizedPath, toLocalDateTime } from '../model/recordModel';
import { BlocksField } from './BlocksField';
import { ImageUploadField } from './ImageUploadField';
import { TranslationHint } from './TranslationHint';

interface RecordFieldEditorProps {
  resource: RecordResource;
  field: RecordFieldDefinition;
  data: RecordData;
  focusLocale?: Locale;
  isFocused: boolean;
  readOnly: boolean;
  t: SiteEditorMessages;
  onChange: (path: string, value: unknown) => void;
}

const asString = (value: unknown) => (typeof value === 'string' ? value : '');

function RecordInput({
  field,
  label,
  lang,
  helperText,
  value,
  readOnly,
  autoFocus,
  t,
  onChange,
}: {
  field: RecordFieldDefinition;
  label: string;
  lang?: Locale;
  helperText: string | undefined;
  value: unknown;
  readOnly: boolean;
  autoFocus: boolean;
  t: SiteEditorMessages;
  onChange: (value: unknown) => void;
}) {
  const nullable = !field.localized && !field.required;
  const projectLabels = useProjectLabels();
  const optionLabels: Record<string, string> = {
    ...t.fields.options,
    ...projectLabels.status,
    ...projectLabels.faculty,
  };
  const optionLabel = (option: string) => optionLabels[option] ?? option;

  switch (field.kind) {
    case 'boolean':
      return (
        <label className="flex items-center gap-3 text-[15px] text-text-primary">
          <Checkbox
            checked={value === true}
            disabled={readOnly}
            autoFocus={autoFocus}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="flex flex-col">
            {label}
            {helperText && <span className="text-[13px] text-text-muted">{helperText}</span>}
          </span>
        </label>
      );
    case 'enum':
      return (
        <Select
          label={label}
          helperText={helperText}
          value={asString(value)}
          disabled={readOnly}
          autoFocus={autoFocus}
          options={(field.options ?? []).map((option) => ({
            value: option,
            label: optionLabel(option),
          }))}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case 'enumList': {
      const selected = Array.isArray(value) ? value.map(String) : [];
      return (
        <fieldset className="flex min-w-0 flex-col gap-2">
          <legend className="mb-1 text-label font-medium text-text-muted">{label}</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {(field.options ?? []).map((option) => (
              <label key={option} className="flex items-center gap-2 text-[15px] text-text-primary">
                <Checkbox
                  checked={selected.includes(option)}
                  disabled={readOnly}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [...selected, option]
                        : selected.filter((item) => item !== option),
                    )
                  }
                />
                {optionLabel(option)}
              </label>
            ))}
          </div>
        </fieldset>
      );
    }
    case 'stringList': {
      const lines = Array.isArray(value) ? value.map(String) : [];
      return (
        <Textarea
          label={label}
          lang={lang}
          helperText={[helperText, t.inspector.onePerLine].filter(Boolean).join(' ')}
          value={lines.join('\n')}
          readOnly={readOnly}
          autoFocus={autoFocus}
          rows={Math.min(8, Math.max(3, lines.length + 1))}
          onChange={(event) => onChange(event.target.value.split('\n'))}
        />
      );
    }
    case 'integer':
      return (
        <Input
          label={label}
          lang={lang}
          helperText={helperText}
          type="number"
          inputMode="numeric"
          step={1}
          value={typeof value === 'number' ? String(value) : ''}
          readOnly={readOnly}
          autoFocus={autoFocus}
          onChange={(event) => {
            const parsed = Number.parseInt(event.target.value, 10);
            onChange(Number.isFinite(parsed) ? parsed : null);
          }}
        />
      );
    case 'dateTime':
      return (
        <Input
          label={label}
          lang={lang}
          helperText={helperText}
          type="datetime-local"
          value={toLocalDateTime(value)}
          readOnly={readOnly}
          autoFocus={autoFocus}
          onChange={(event) => onChange(fromLocalDateTime(event.target.value))}
        />
      );
    case 'longText':
      return (
        <Textarea
          label={label}
          lang={lang}
          helperText={helperText}
          value={asString(value)}
          readOnly={readOnly}
          autoFocus={autoFocus}
          rows={Math.min(14, Math.max(3, asString(value).split('\n').length + 1))}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case 'blocks':
      return (
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-label font-medium text-text-muted">{label}</span>
          <BlocksField value={value} readOnly={readOnly} t={t} onChange={onChange} />
        </div>
      );
    default:
      return (
        <Input
          label={label}
          lang={lang}
          helperText={helperText}
          type={field.kind === 'url' ? 'url' : 'text'}
          value={asString(value)}
          readOnly={readOnly || Boolean(field.createOnly)}
          autoFocus={autoFocus}
          maxLength={field.kind === 'url' ? 2048 : 300}
          onChange={(event) => {
            const next = event.target.value;
            onChange(nullable && !next.trim() ? null : next);
          }}
        />
      );
  }
}

export function RecordFieldEditor({
  resource,
  field,
  data,
  focusLocale,
  isFocused,
  readOnly,
  t,
  onChange,
}: RecordFieldEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const helpId = useId();
  const text = recordFieldText(t.fields, resource, field);
  const title = field.required ? `${text.label} · ${t.inspector.required}` : text.label;
  const imageSchema = imageRecordSchema(resource, field.path);
  const imageValue = asString(readRecordValue(data, field.path));
  const imagePreview =
    resource === 'publication'
      ? getPublicationCover(imageValue)
      : imageValue
        ? contentCoverSrc(imageValue)
        : undefined;

  useEffect(() => {
    if (isFocused) ref.current?.scrollIntoView({ block: 'center' });
  }, [isFocused]);

  return (
    <div
      ref={ref}
      className={cn(
        'min-w-0 rounded-2xl border p-4 transition-colors motion-reduce:transition-none',
        isFocused ? 'border-viratec-cyan/70 bg-viratec-cyan/6' : 'border-white/8',
      )}
    >
      {imageSchema ? (
        <ImageUploadField
          label={title}
          help={text.help}
          previewSrc={imagePreview}
          previewAlt=""
          hasValue={Boolean(imageValue)}
          canRemove={!field.required}
          readOnly={readOnly}
          uploadName="cover"
          t={t}
          onUploaded={(asset) => {
            const url = absoluteImageUrl(asset.url);
            if (!imageSchema.safeParse(url).success) return t.inspector.imageNotSaved;
            onChange(field.path, url);
            return null;
          }}
          onRemove={() => onChange(field.path, null)}
        />
      ) : field.localized ? (
        <fieldset
          aria-describedby={text.help ? helpId : undefined}
          className="flex min-w-0 flex-col gap-3"
        >
          <legend className="mb-1 text-label font-medium text-text-primary">{title}</legend>
          {text.help && (
            <p id={helpId} className="-mt-1 text-[13px] text-text-muted">
              {text.help}
            </p>
          )}
          <TranslationHint
            values={{
              en: readRecordValue(data, localizedPath(field, 'en')),
              uk: readRecordValue(data, localizedPath(field, 'uk')),
            }}
            readOnly={readOnly}
            t={t}
            onCopy={(from, to) =>
              onChange(localizedPath(field, to), readRecordValue(data, localizedPath(field, from)))
            }
          />
          {LOCALES.map((locale) => {
            const path = localizedPath(field, locale);
            return (
              <RecordInput
                key={locale}
                field={field}
                label={t.locales[locale]}
                lang={locale}
                helperText={undefined}
                value={readRecordValue(data, path)}
                readOnly={readOnly}
                autoFocus={isFocused && locale === focusLocale}
                t={t}
                onChange={(value) => onChange(path, value)}
              />
            );
          })}
        </fieldset>
      ) : (
        <RecordInput
          field={field}
          label={title}
          helperText={text.help}
          value={readRecordValue(data, field.path)}
          readOnly={readOnly}
          autoFocus={isFocused}
          t={t}
          onChange={(value) => onChange(field.path, value)}
        />
      )}
    </div>
  );
}
