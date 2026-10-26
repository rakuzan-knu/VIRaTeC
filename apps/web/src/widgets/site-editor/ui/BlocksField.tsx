import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import type { SiteEditorMessages } from '../model/messages';
import { IconButton } from './IconButton';

type BlockKind = 'paragraph' | 'heading' | 'quote';

interface Block {
  kind: BlockKind;
  text: string;
  author?: string;
}

const toBlocks = (value: unknown): Block[] =>
  Array.isArray(value)
    ? value.flatMap((item): Block[] => {
        if (typeof item !== 'object' || item === null) return [];
        const { kind, text, author } = item as Record<string, unknown>;
        if (kind !== 'paragraph' && kind !== 'heading' && kind !== 'quote') return [];
        return [
          kind === 'quote'
            ? { kind, text: String(text ?? ''), author: String(author ?? '') }
            : { kind, text: String(text ?? '') },
        ];
      })
    : [];

interface BlocksFieldProps {
  value: unknown;
  readOnly: boolean;
  t: SiteEditorMessages;
  onChange: (value: Block[]) => void;
}

export function BlocksField({ value, readOnly, t, onChange }: BlocksFieldProps) {
  const blocks = toBlocks(value);
  const labels = t.records.blocks;

  const update = (index: number, block: Block) =>
    onChange(blocks.map((item, position) => (position === index ? block : item)));

  const move = (from: number, to: number) => {
    const next = [...blocks];
    const [item] = next.splice(from, 1);
    if (item) next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {blocks.length === 0 && <p className="text-[14px] text-text-subtle">{t.inspector.noItems}</p>}
      <ol className="flex flex-col gap-3">
        {blocks.map((block, index) => (
          <li
            key={index}
            className="flex min-w-0 flex-col gap-3 rounded-xl border border-white/8 bg-white/3 p-3"
          >
            <div className="flex items-end gap-1">
              <div className="min-w-0 flex-1">
                <Select
                  label={labels.kind}
                  value={block.kind}
                  disabled={readOnly}
                  options={(['paragraph', 'heading', 'quote'] as const).map((kind) => ({
                    value: kind,
                    label: labels[kind],
                  }))}
                  onChange={(event) => {
                    const kind = event.target.value as BlockKind;
                    update(
                      index,
                      kind === 'quote'
                        ? { kind, text: block.text, author: block.author ?? '' }
                        : { kind, text: block.text },
                    );
                  }}
                />
              </div>
              {!readOnly && (
                <>
                  <IconButton
                    icon={ArrowUp}
                    label={labels.moveUp(index + 1)}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  />
                  <IconButton
                    icon={ArrowDown}
                    label={labels.moveDown(index + 1)}
                    disabled={index === blocks.length - 1}
                    onClick={() => move(index, index + 1)}
                  />
                  <IconButton
                    icon={X}
                    label={labels.remove(index + 1)}
                    onClick={() => onChange(blocks.filter((_, position) => position !== index))}
                  />
                </>
              )}
            </div>
            <Textarea
              label={labels.text}
              value={block.text}
              readOnly={readOnly}
              rows={block.kind === 'heading' ? 2 : 4}
              onChange={(event) => update(index, { ...block, text: event.target.value })}
            />
            {block.kind === 'quote' && (
              <Input
                label={labels.author}
                value={block.author ?? ''}
                readOnly={readOnly}
                onChange={(event) => update(index, { ...block, author: event.target.value })}
              />
            )}
          </li>
        ))}
      </ol>
      {!readOnly && (
        <button
          type="button"
          onClick={() => onChange([...blocks, { kind: 'paragraph', text: '' }])}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-dashed border-white/20 px-3 py-2 text-[14px] text-text-primary transition-colors hover:border-viratec-cyan/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none"
        >
          <Plus aria-hidden="true" className="size-4" />
          {labels.add}
        </button>
      )}
    </div>
  );
}
