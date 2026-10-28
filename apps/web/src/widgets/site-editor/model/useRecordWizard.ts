import { useState } from 'react';
import {
  LOCALE_PLACEHOLDER,
  RECORD_DEFINITIONS,
  type RecordData,
  type RecordDto,
  type RecordResource,
} from '@viratec/contracts';
import { slugify } from '@viratec/utils';
import { LOCALES, useLocale } from '@/shared/i18n';
import { isConflict, useEditorErrorMessage } from './errors';
import { recordCreateAction } from './history';
import { useSiteEditorMessages } from './messages';
import { useCreateRecord } from './queries';
import {
  SLUG_PATTERN,
  fromLocalDateTime,
  newRecordData,
  recordLabel,
  toLocalDateTime,
  writeRecordValue,
} from './recordModel';
import { useSiteEditorStore } from './store';

export type WizardStep = 'title' | 'summary' | 'photo' | 'when' | 'preview';

const WIZARD_STEPS: Record<RecordResource, readonly WizardStep[]> = {
  project: ['title', 'summary', 'photo', 'preview'],
  publication: ['title', 'summary', 'photo', 'preview'],
  event: ['title', 'summary', 'when', 'preview'],
};

const SUMMARY_PATHS: Record<RecordResource, string> = {
  project: 'translations.{locale}.description',
  event: 'translations.{locale}.description',
  publication: 'content.{locale}.excerpt',
};

export const COVER_PATHS: Partial<Record<RecordResource, string>> = {
  project: 'coverUrl',
  publication: 'coverKey',
};

const SLUG_MAX_LENGTH = 120;

const toSlug = (title: string) => slugify(title).slice(0, SLUG_MAX_LENGTH).replace(/-+$/, '');

const readEventTime = (data: RecordData, path: 'startDate' | 'endDate') =>
  toLocalDateTime(data[path]);

export function useRecordWizard(
  resource: RecordResource,
  onCreated: (record: RecordDto, label: string) => void,
) {
  const t = useSiteEditorMessages();
  const locale = useLocale();
  const create = useCreateRecord();
  const [defaults] = useState(() => newRecordData(resource, ''));
  const [stepIndex, setStepIndex] = useState(0);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [cover, setCover] = useState<string | null>(null);
  const [start, setStart] = useState(() => readEventTime(defaults, 'startDate'));
  const [end, setEnd] = useState(() => readEventTime(defaults, 'endDate'));
  const [place, setPlace] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugEdited, setSlugEdited] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const createError = useEditorErrorMessage(
    create.error && !isConflict(create.error) ? create.error : null,
  );

  const steps = WIZARD_STEPS[resource];
  const step = steps[stepIndex] ?? 'title';
  const effectiveSlug = isSlugEdited ? slug : toSlug(title);
  const needsSlug = resource === 'publication';
  const coverPath = COVER_PATHS[resource];

  const data = (() => {
    const { displayPath } = RECORD_DEFINITIONS[resource];
    let next = newRecordData(resource, effectiveSlug);
    for (const item of LOCALES) {
      next = writeRecordValue(next, displayPath.replace(LOCALE_PLACEHOLDER, item), title.trim());
    }
    next = writeRecordValue(
      next,
      SUMMARY_PATHS[resource].replace(LOCALE_PLACEHOLDER, locale),
      summary.trim(),
    );
    if (coverPath) next = writeRecordValue(next, coverPath, cover);
    if (resource === 'event') {
      next = writeRecordValue(next, 'location', place.trim());
      next = writeRecordValue(next, 'startDate', fromLocalDateTime(start) ?? defaults.startDate);
      next = writeRecordValue(next, 'endDate', fromLocalDateTime(end) ?? defaults.endDate);
    }
    return next;
  })();

  const validateTitle = () => {
    if (title.trim()) return true;
    setTitleError(t.wizard.titleRequired);
    setStepIndex(steps.indexOf('title'));
    return false;
  };

  const next = () => {
    if (step === 'title' && !validateTitle()) return;
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  };

  const back = () => setStepIndex((index) => Math.max(index - 1, 0));

  const submit = () => {
    if (!validateTitle()) return;
    if (needsSlug && !SLUG_PATTERN.test(effectiveSlug)) {
      setSlugEdited(true);
      setSlug(effectiveSlug);
      setSlugError(t.records.slugInvalid);
      setStepIndex(steps.indexOf('title'));
      return;
    }
    const label = `${t.records.resource[resource]}: ${recordLabel(resource, data, locale)}`;
    create.mutate(
      { resource, dto: { data, label } },
      {
        onSuccess: (record) => {
          const { pushAction, announce } = useSiteEditorStore.getState();
          pushAction(
            recordCreateAction({ resource, key: record.key, label: t.history.created(label) }),
          );
          announce(t.wizard.created(title.trim()));
          onCreated(record, label);
        },
        onError: (error) => {
          if (!isConflict(error)) return;
          setSlugEdited(true);
          setSlug(effectiveSlug);
          setSlugError(t.wizard.slugTaken);
          setStepIndex(steps.indexOf('title'));
        },
      },
    );
  };

  return {
    steps,
    step,
    stepIndex,
    isLast: stepIndex === steps.length - 1,
    data,
    title,
    summary,
    cover,
    start,
    end,
    place,
    slug: effectiveSlug,
    needsSlug,
    coverPath,
    titleError,
    slugError,
    createError,
    isPending: create.isPending,
    setTitle: (value: string) => {
      setTitle(value);
      setTitleError(null);
    },
    setSummary,
    setCover,
    setStart,
    setEnd,
    setPlace,
    setSlug: (value: string) => {
      setSlug(value.toLowerCase());
      setSlugEdited(value !== '');
      setSlugError(null);
    },
    next,
    back,
    submit,
  };
}
