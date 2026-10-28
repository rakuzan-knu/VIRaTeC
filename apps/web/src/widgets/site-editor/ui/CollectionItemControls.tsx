import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import {
  canReorder,
  itemLabel,
  removalOf,
  type CollectionGrid,
  type CollectionItem,
} from '../model/collections';
import type { SiteEditorMessages } from '../model/messages';
import type { MoveDirection } from '../model/useCollectionActions';
import { useElementRects } from '../model/useCanvasTargets';
import { targetLabel } from '../model/targetLabel';
import { IconButton } from './IconButton';

const INSET = 8;

interface CollectionItemControlsProps {
  grid: CollectionGrid;
  item: CollectionItem;
  isBusy: boolean;
  t: SiteEditorMessages;
  onMove: (direction: MoveDirection, label: string) => void;
  onRemove: (label: string) => void;
}

export function CollectionItemControls({
  grid,
  item,
  isBusy,
  t,
  onMove,
  onRemove,
}: CollectionItemControlsProps) {
  const [rect] = useElementRects(item.cell);
  if (!rect) return null;
  const index = grid.items.indexOf(item);
  const label = itemLabel(item, targetLabel(item.target, t));
  const removal = removalOf(grid.collection);
  const reorderable = canReorder(grid.collection) && grid.items.length > 1;

  return (
    <div
      role="group"
      aria-label={t.collection.controls(label)}
      className="pointer-events-auto fixed z-[2147483003] flex items-center gap-0.5 rounded-xl border border-white/12 bg-viratec-deep/95 p-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      style={{
        top: rect.top + INSET,
        right: Math.max(window.innerWidth - rect.right + INSET, INSET),
      }}
    >
      {reorderable && (
        <>
          <IconButton
            icon={ArrowUp}
            size="sm"
            label={t.inspector.moveUp(`«${label}»`)}
            disabled={isBusy || index <= 0}
            onClick={() => onMove(-1, label)}
          />
          <IconButton
            icon={ArrowDown}
            size="sm"
            label={t.inspector.moveDown(`«${label}»`)}
            disabled={isBusy || index >= grid.items.length - 1}
            onClick={() => onMove(1, label)}
          />
        </>
      )}
      {removal && (
        <IconButton
          icon={Trash2}
          size="sm"
          label={
            removal === 'delete'
              ? t.collection.remove(label)
              : removal === 'hide'
                ? t.collection.hide(label)
                : t.inspector.remove(`«${label}»`)
          }
          disabled={isBusy}
          className="hover:text-state-error"
          onClick={() => onRemove(label)}
        />
      )}
    </div>
  );
}
