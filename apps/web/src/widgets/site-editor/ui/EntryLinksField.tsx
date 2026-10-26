import { ArrowDown, ArrowUp, ChevronRight, Plus, X } from 'lucide-react';
import type { ContentLocales } from '@viratec/contracts';
import { LOCALES, useLocale } from '@/shared/i18n';
import {
  changeLabel,
  entryLabel,
  findContentType,
  linkId,
  linkedContentTypes,
  toLink,
  type FieldDefinition,
} from '../model/contentModel';
import type { SiteEditorMessages } from '../model/messages';
import { entryCreateAction } from '../model/history';
import { useCreateEntry, useEditorEntry } from '../model/queries';
import { useSiteEditorStore } from '../model/store';
import { IconButton } from './IconButton';

interface EntryLinksFieldProps {
  field: FieldDefinition;
  label: string;
  value: unknown;
  locales: ContentLocales;
  readOnly: boolean;
  t: SiteEditorMessages;
  onChange: (value: unknown) => void;
}

function LinkedEntryRow({
  id,
  index,
  count,
  isList,
  readOnly,
  canRemove,
  t,
  onMove,
  onRemove,
}: {
  id: string;
  index: number;
  count: number;
  isList: boolean;
  readOnly: boolean;
  canRemove: boolean;
  t: SiteEditorMessages;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
}) {
  const locale = useLocale();
  const open = useSiteEditorStore((state) => state.open);
  const { data } = useEditorEntry(id);
  const label = data
    ? entryLabel(data.contentTypeId, data.fields, data.locales, locale)
    : t.loading;

  return (
    <li className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/3 py-1 pr-1 pl-3">
      <button
        type="button"
        onClick={() => open({ entryId: id })}
        aria-label={t.inspector.openEntry(label)}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-2 text-left text-[15px] text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-text-subtle" />
      </button>
      {isList && !readOnly && (
        <>
          <IconButton
            icon={ArrowUp}
            label={t.inspector.moveUp(label)}
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
          />
          <IconButton
            icon={ArrowDown}
            label={t.inspector.moveDown(label)}
            disabled={index === count - 1}
            onClick={() => onMove(index, index + 1)}
          />
        </>
      )}
      {!readOnly && canRemove && (
        <IconButton icon={X} label={t.inspector.remove(label)} onClick={() => onRemove(index)} />
      )}
    </li>
  );
}

export function EntryLinksField({
  field,
  label,
  value,
  locales,
  readOnly,
  t,
  onChange,
}: EntryLinksFieldProps) {
  const createEntry = useCreateEntry();
  const isList = field.type === 'Array';
  const ids = (isList ? (Array.isArray(value) ? value : []) : value ? [value] : [])
    .map(linkId)
    .filter((id): id is string => Boolean(id));
  const childType = findContentType(linkedContentTypes(field)[0]);

  const commit = (next: string[]) => {
    if (isList) onChange(next.length > 0 ? next.map((id) => toLink('Entry', id)) : undefined);
    else onChange(next[0] ? toLink('Entry', next[0]) : undefined);
  };

  const move = (from: number, to: number) => {
    const next = [...ids];
    const [item] = next.splice(from, 1);
    if (item) next.splice(to, 0, item);
    commit(next);
  };

  const add = () => {
    if (!childType) return;
    const displayField = childType.fields.find((item) => item.id === childType.displayField);
    const placeholder = `${t.inspector.untitled} ${childType.name.toLowerCase()}`;
    createEntry.mutate(
      {
        contentTypeId: childType.id,
        label: changeLabel(childType.name, placeholder),
        fields: displayField
          ? {
              [displayField.id]: Object.fromEntries(
                (displayField.localized ? LOCALES : (['en'] as const)).map((locale) => [
                  locales[locale],
                  placeholder,
                ]),
              ),
            }
          : {},
      },
      {
        onSuccess: (entry) => {
          commit([...ids, entry.id]);
          const { pushAction } = useSiteEditorStore.getState();
          pushAction(
            entryCreateAction({
              id: entry.id,
              label: t.history.created(changeLabel(childType.name, placeholder)),
            }),
          );
        },
      },
    );
  };

  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-2 text-label font-medium text-text-primary">{label}</legend>
      {field.help && <p className="-mt-1 text-caption text-text-muted">{field.help}</p>}
      {ids.length === 0 ? (
        <p className="text-[14px] text-text-subtle">{t.inspector.noItems}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {ids.map((id, index) => (
            <LinkedEntryRow
              key={`${id}-${index}`}
              id={id}
              index={index}
              count={ids.length}
              isList={isList}
              readOnly={readOnly}
              canRemove={isList || !field.required}
              t={t}
              onMove={move}
              onRemove={(removed) => commit(ids.filter((_, position) => position !== removed))}
            />
          ))}
        </ol>
      )}
      {!readOnly && childType && (isList || ids.length === 0) && (
        <button
          type="button"
          onClick={add}
          disabled={createEntry.isPending}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-dashed border-white/20 px-3 py-2 text-[14px] text-text-primary transition-colors hover:border-viratec-cyan/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
        >
          <Plus aria-hidden="true" className="size-4" />
          {t.inspector.add(childType.name.toLowerCase())}
        </button>
      )}
    </fieldset>
  );
}
