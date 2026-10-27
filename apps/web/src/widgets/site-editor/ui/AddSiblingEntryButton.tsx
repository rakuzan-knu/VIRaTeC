import { Plus } from 'lucide-react';
import type { ContentFields, ContentLocales } from '@viratec/contracts';
import { useEditorErrorMessage } from '../model/errors';
import { changeLabel, siblingFields, type ContentTypeDefinition } from '../model/contentModel';
import { entryCreateAction } from '../model/history';
import type { SiteEditorMessages } from '../model/messages';
import { useCreateEntry } from '../model/queries';
import { useSiteEditorStore } from '../model/store';

export function AddSiblingEntryButton({
  type,
  fields,
  locales,
  t,
}: {
  type: ContentTypeDefinition;
  fields: ContentFields;
  locales: ContentLocales;
  t: SiteEditorMessages;
}) {
  const createEntry = useCreateEntry();
  const error = useEditorErrorMessage(createEntry.error);
  const typeName = type.name.toLowerCase();

  const add = () => {
    const placeholder = `${t.inspector.untitled} ${typeName}`;
    const label = changeLabel(type.name, placeholder);
    createEntry.mutate(
      {
        contentTypeId: type.id,
        label,
        fields: siblingFields(type, fields, locales, placeholder),
      },
      {
        onSuccess: (entry) => {
          const { pushAction, select } = useSiteEditorStore.getState();
          pushAction(entryCreateAction({ id: entry.id, label: t.history.created(label) }));
          select({ entryId: entry.id, contentTypeId: type.id });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={add}
        disabled={createEntry.isPending}
        className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-dashed border-white/20 px-3 py-2 text-[14px] text-text-primary transition-colors hover:border-viratec-cyan/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
      >
        <Plus aria-hidden="true" className="size-4" />
        {t.inspector.addAnother(typeName)}
      </button>
      <p className="text-caption text-text-subtle">{t.inspector.addAnotherHint}</p>
      {error && (
        <p role="alert" className="text-[13px] text-state-error">
          {error}
        </p>
      )}
    </div>
  );
}
