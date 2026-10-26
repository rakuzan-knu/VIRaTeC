import { useState } from 'react';
import { Plus } from 'lucide-react';
import { RECORD_RESOURCES, recordTypeId, type RecordResource } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { useLocale } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/Input';
import { useEditorErrorMessage } from '../model/errors';
import type { SiteEditorMessages } from '../model/messages';
import { NO_PERMISSIONS, canEditRecords } from '../model/permissions';
import { recordCreateAction } from '../model/history';
import { useCreateRecord } from '../model/queries';
import { SLUG_PATTERN, newRecordData, recordLabel } from '../model/recordModel';
import { useSiteEditorStore } from '../model/store';

export function AddRecordMenu({ t }: { t: SiteEditorMessages }) {
  const locale = useLocale();
  const permissions = useSessionStore((state) => state.user?.permissions ?? NO_PERMISSIONS);
  const select = useSiteEditorStore((state) => state.select);
  const create = useCreateRecord();
  const createError = useEditorErrorMessage(create.error);
  const [isAskingSlug, setAskingSlug] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);

  const allowed = RECORD_RESOURCES.filter((resource) => canEditRecords(permissions, resource));
  if (allowed.length === 0) return null;

  const run = (resource: RecordResource, key: string) => {
    const data = newRecordData(resource, key);
    create.mutate(
      {
        resource,
        dto: {
          data,
          label: `${t.records.resource[resource]}: ${recordLabel(resource, data, locale)}`,
        },
      },
      {
        onSuccess: (record) => {
          setAskingSlug(false);
          useSiteEditorStore.getState().pushAction(
            recordCreateAction({
              resource,
              key: record.key,
              label: t.history.created(
                `${t.records.resource[resource]}: ${recordLabel(resource, data, locale)}`,
              ),
            }),
          );
          select({ entryId: record.key, contentTypeId: recordTypeId(resource) });
        },
      },
    );
  };

  return (
    <section aria-label={t.records.addTitle} className="flex flex-col gap-2">
      <span className="text-[13px] text-text-subtle">{t.records.addTitle}</span>
      <div className="flex flex-wrap gap-2">
        {allowed.map((resource) => (
          <button
            key={resource}
            type="button"
            disabled={create.isPending}
            onClick={() => {
              if (resource !== 'publication') {
                run(resource, '');
                return;
              }
              create.reset();
              setSlug('');
              setSlugError(null);
              setAskingSlug(true);
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 px-3 py-2 text-[14px] text-text-primary transition-colors hover:border-viratec-cyan/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
          >
            <Plus aria-hidden="true" className="size-4" />
            {t.records.add[resource]}
          </button>
        ))}
      </div>
      {createError && !isAskingSlug && (
        <p role="alert" className="text-[13px] text-state-error">
          {createError}
        </p>
      )}
      <Dialog
        open={isAskingSlug}
        title={t.records.slugTitle}
        description={t.records.slugText}
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
              setSlugError(t.records.slugInvalid);
              return;
            }
            run('publication', value);
          }}
        >
          <Input
            label={t.records.slugLabel}
            helperText={t.records.slugHelp}
            value={slug}
            data-autofocus
            autoComplete="off"
            spellCheck={false}
            maxLength={120}
            error={slugError ?? createError ?? undefined}
            onChange={(event) => {
              setSlug(event.target.value.toLowerCase());
              setSlugError(null);
            }}
            onBlur={() => {
              if (slug.trim() && !SLUG_PATTERN.test(slug.trim()))
                setSlugError(t.records.slugInvalid);
            }}
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              label={t.keepEditing}
              variant="secondary"
              onClick={() => setAskingSlug(false)}
            />
            <Button label={t.records.create} type="submit" loading={create.isPending} />
          </div>
        </form>
      </Dialog>
    </section>
  );
}
