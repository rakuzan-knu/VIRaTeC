import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LOCALE_PLACEHOLDER, RECORD_DEFINITIONS, type RecordResource } from '@viratec/contracts';
import { slugify } from '@viratec/utils';
import { LOCALES, useLocale } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/Input';
import {
  SLUG_PATTERN,
  newRecordData,
  recordLabel,
  useCreateRecord,
  useEditorErrorMessage,
  useSiteEditorMessages,
  writeRecordValue,
} from '@/widgets/site-editor';
import { useAdminMessages } from '../model/messages';
import { adminKeys } from '../model/queries';

export function AddContentButton({
  resource,
  onCreated,
}: {
  resource: RecordResource;
  onCreated: (key: string) => void;
}) {
  const t = useAdminMessages();
  const editorT = useSiteEditorMessages();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const create = useCreateRecord();
  const createError = useEditorErrorMessage(create.error);
  const [isAskingSlug, setAskingSlug] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugEdited, setSlugEdited] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const run = (key: string, name = '') => {
    const displayPath = RECORD_DEFINITIONS[resource].displayPath;
    const data = name
      ? LOCALES.reduce(
          (next, item) =>
            writeRecordValue(next, displayPath.replace(LOCALE_PLACEHOLDER, item), name),
          newRecordData(resource, key),
        )
      : newRecordData(resource, key);
    create.mutate(
      {
        resource,
        dto: {
          data,
          label: `${editorT.records.resource[resource]}: ${recordLabel(resource, data, locale)}`,
        },
      },
      {
        onSuccess: (record) => {
          setAskingSlug(false);
          void queryClient.invalidateQueries({ queryKey: adminKeys.content() });
          onCreated(record.key);
        },
      },
    );
  };

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Button
        label={t.content.add[resource]}
        loading={create.isPending && !isAskingSlug}
        onClick={() => {
          create.reset();
          if (resource !== 'publication') {
            run('');
            return;
          }
          setTitle('');
          setSlug('');
          setSlugEdited(false);
          setSlugError(null);
          setAskingSlug(true);
        }}
      />
      {createError && !isAskingSlug && (
        <p role="alert" className="text-[13px] text-state-error">
          {createError}
        </p>
      )}
      <Dialog
        open={isAskingSlug}
        title={editorT.records.slugTitle}
        description={editorT.records.slugText}
        closeLabel={t.close}
        onClose={() => setAskingSlug(false)}
      >
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const value = slug.trim();
            if (!SLUG_PATTERN.test(value)) {
              setSlugError(editorT.records.slugInvalid);
              return;
            }
            run(value, title.trim());
          }}
        >
          <Input
            label={editorT.records.titleLabel}
            value={title}
            data-autofocus
            autoComplete="off"
            maxLength={300}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!isSlugEdited)
                setSlug(slugify(event.target.value).slice(0, 120).replace(/-+$/, ''));
              setSlugError(null);
            }}
          />
          <Input
            label={editorT.records.slugLabel}
            helperText={editorT.records.slugHelp}
            value={slug}
            autoComplete="off"
            spellCheck={false}
            maxLength={120}
            error={slugError ?? createError ?? undefined}
            onChange={(event) => {
              setSlug(event.target.value.toLowerCase());
              setSlugEdited(event.target.value !== '');
              setSlugError(null);
            }}
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              label={editorT.keepEditing}
              variant="secondary"
              onClick={() => setAskingSlug(false)}
            />
            <Button label={editorT.records.create} type="submit" loading={create.isPending} />
          </div>
        </form>
      </Dialog>
    </div>
  );
}
