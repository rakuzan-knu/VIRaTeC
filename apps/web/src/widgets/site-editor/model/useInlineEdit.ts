import { useState } from 'react';
import { readRecordValue, type RecordData } from '@viratec/contracts';
import { LOCALES, type Locale } from '@/shared/i18n';
import { entrySaveKey, recordSaveKey } from './autosave';
import { flushDrafts } from './autosaveRegistry';
import { findRecordField, localizedPath, writeRecordValue } from './recordModel';
import { withFieldValue } from './contentModel';
import type { InlineField } from './inlineEdit';
import { useEditorEntry, useEditorRecord } from './queries';
import { recordDraftKey, useSiteEditorStore } from './store';

const asText = (value: unknown) => (typeof value === 'string' ? value : '');

const otherLocale = (locale: Locale): Locale => LOCALES.find((item) => item !== locale) ?? locale;

export function useInlineEdit({ target, resource, localized }: InlineField) {
  const { entryId, fieldId, locale } = target.address;
  const entry = useEditorEntry(resource ? null : entryId);
  const record = useEditorRecord(resource, resource ? entryId : null);
  const draftKey = resource ? recordDraftKey(resource, entryId) : null;
  const entryDraft = useSiteEditorStore((state) => (resource ? undefined : state.drafts[entryId]));
  const recordDraft = useSiteEditorStore((state) =>
    draftKey ? state.recordDrafts[draftKey] : undefined,
  );
  const recordField = resource ? findRecordField(resource, fieldId) : undefined;
  const other = otherLocale(locale);
  const saveKey = draftKey ? recordSaveKey(draftKey) : entrySaveKey(entryId);
  const isReady = resource ? Boolean(record.data) : Boolean(entry.data);
  const loadError = resource ? record.error : entry.error;

  const read = (target: Locale) => {
    if (resource) {
      const data: RecordData | undefined = recordDraft?.data ?? record.data?.data;
      return data && recordField
        ? asText(readRecordValue(data, localizedPath(recordField, target)))
        : '';
    }
    const loaded = entry.data;
    if (!loaded) return '';
    const fields = entryDraft?.fields ?? loaded.fields;
    return asText(fields[fieldId]?.[loaded.locales[localized ? target : 'en']]);
  };

  const write = (target: Locale, value: string) => {
    const { setDraft, setRecordDraft } = useSiteEditorStore.getState();
    if (resource && draftKey && recordField && record.data) {
      const current = useSiteEditorStore.getState().recordDrafts[draftKey];
      setRecordDraft(draftKey, {
        baseUpdatedAt: current?.baseUpdatedAt ?? record.data.updatedAt,
        base: current?.base ?? record.data.data,
        data: writeRecordValue(
          current?.data ?? record.data.data,
          localizedPath(recordField, target),
          value,
        ),
      });
      return;
    }
    const loaded = entry.data;
    if (!loaded) return;
    const current = useSiteEditorStore.getState().drafts[entryId];
    setDraft(entryId, {
      version: current?.version ?? loaded.version,
      base: current?.base ?? loaded.fields,
      fields: withFieldValue(
        current?.fields ?? loaded.fields,
        fieldId,
        loaded.locales[localized ? target : 'en'],
        value || undefined,
      ),
    });
  };

  const [initial, setInitial] = useState<Record<Locale, string> | null>(null);
  if (isReady && !initial) setInitial({ en: read('en'), uk: read('uk') });

  return {
    isReady,
    loadError,
    locale,
    other,
    localized,
    saveKey,
    value: read(locale),
    otherValue: read(other),
    values: { en: read('en'), uk: read('uk') } satisfies Record<Locale, string>,
    write,
    setValue: (value: string) => write(locale, value),
    setOther: (value: string) => write(other, value),
    commit: () => flushDrafts(saveKey),
    cancel: () => {
      if (!initial) return Promise.resolve();
      if (read(locale) !== initial[locale]) write(locale, initial[locale]);
      if (localized && read(other) !== initial[other]) write(other, initial[other]);
      return flushDrafts(saveKey);
    },
  };
}
