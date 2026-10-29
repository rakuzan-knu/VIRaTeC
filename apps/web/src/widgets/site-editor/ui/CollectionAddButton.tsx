import { Plus } from 'lucide-react';
import { cn } from '@/shared/lib';
import { addSlotOf, type CollectionGrid } from '../model/collections';
import { findContentType } from '../model/contentModel';
import { typeName } from '../model/fieldText';
import type { SiteEditorMessages } from '../model/messages';

interface CollectionAddButtonProps {
  grid: CollectionGrid;
  isBusy: boolean;
  t: SiteEditorMessages;
  onAdd: () => void;
}

const addLabel = (grid: CollectionGrid, t: SiteEditorMessages) => {
  if (grid.collection.kind === 'record') {
    return t.collection.add(t.records.add[grid.collection.resource]);
  }
  const type = findContentType(grid.contentTypeId);
  return t.inspector.add(typeName(t.fields, grid.contentTypeId, type?.name).toLowerCase());
};

export function CollectionAddButton({ grid, isBusy, t, onAdd }: CollectionAddButtonProps) {
  const slot = addSlotOf(grid);
  if (!slot) return null;
  const label = addLabel(grid, t);

  return (
    <button
      type="button"
      data-tour="add"
      disabled={isBusy}
      onClick={onAdd}
      style={{ top: slot.top, left: slot.left, width: slot.width, height: slot.height }}
      className={cn(
        'pointer-events-auto fixed z-[2147483001] flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-white/20 bg-bg-page/70 text-[15px] font-medium text-text-muted transition-colors hover:border-viratec-cyan/80 hover:text-text-primary focus-visible:border-viratec-cyan focus-visible:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none',
        slot.isCompact ? 'rounded-2xl' : 'flex-col rounded-[24px]',
      )}
    >
      <Plus aria-hidden="true" className={slot.isCompact ? 'size-4' : 'size-8'} />
      {label}
    </button>
  );
}
