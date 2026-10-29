import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { usePublications } from '@/entities/publication';
import { stripFieldMarks } from '@/shared/lib';
import { Select } from '@/shared/ui/Select';
import type { SiteEditorMessages } from '../model/messages';
import { IconButton } from './IconButton';

interface PublicationKeysFieldProps {
  label: string;
  help?: string;
  value: unknown;
  readOnly: boolean;
  t: SiteEditorMessages;
  onChange: (value: string[] | undefined) => void;
}

const toKeys = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

export function PublicationKeysField({
  label,
  help,
  value,
  readOnly,
  t,
  onChange,
}: PublicationKeysFieldProps) {
  const { publications } = usePublications();
  const keys = toKeys(value);
  const titleOf = (key: string) => {
    const publication = publications.find((item) => item.slug === key);
    return publication ? stripFieldMarks(publication.title) : null;
  };

  const commit = (next: string[]) => onChange(next.length > 0 ? next : undefined);

  const move = (from: number, to: number) => {
    const next = [...keys];
    const [item] = next.splice(from, 1);
    if (item) next.splice(to, 0, item);
    commit(next);
  };

  const options = publications
    .filter((publication) => !keys.includes(publication.slug))
    .map((publication) => ({
      value: publication.slug,
      label: `${stripFieldMarks(publication.title)} · ${publication.year}`,
    }));

  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-2 text-label font-medium text-text-primary">{label}</legend>
      {help && <p className="-mt-1 text-caption text-text-muted">{help}</p>}
      {keys.length === 0 ? (
        <p className="text-[14px] text-text-subtle">{t.inspector.noItems}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {keys.map((key, index) => {
            const title = titleOf(key);
            const name = title ?? key;
            return (
              <li
                key={key}
                className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/3 py-1 pr-1 pl-3"
              >
                <span className="flex min-w-0 flex-1 flex-col py-1.5">
                  <span className="text-[15px] break-words text-text-primary">
                    {title ?? t.inspector.publicationNotFound(key)}
                  </span>
                  <span className="font-mono text-xs break-all text-text-subtle">{key}</span>
                </span>
                {!readOnly && (
                  <>
                    <IconButton
                      icon={ArrowUp}
                      label={t.inspector.moveUp(name)}
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    />
                    <IconButton
                      icon={ArrowDown}
                      label={t.inspector.moveDown(name)}
                      disabled={index === keys.length - 1}
                      onClick={() => move(index, index + 1)}
                    />
                    <IconButton
                      icon={X}
                      label={t.inspector.remove(name)}
                      onClick={() => commit(keys.filter((item) => item !== key))}
                    />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {!readOnly && options.length > 0 && (
        <Select
          label={t.inspector.pickPublication}
          placeholder={t.inspector.pickPublicationPlaceholder}
          options={options}
          value=""
          onChange={(event) => {
            if (event.target.value) commit([...keys, event.target.value]);
          }}
        />
      )}
    </fieldset>
  );
}
