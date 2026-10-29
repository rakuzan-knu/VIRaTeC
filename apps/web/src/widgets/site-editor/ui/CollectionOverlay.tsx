import { useState } from 'react';
import type { RecordResource } from '@viratec/contracts';
import {
  canReorder,
  isOnScreen,
  removalOf,
  type CollectionGrid,
  type CollectionItem,
} from '../model/collections';
import type { SiteEditorMessages } from '../model/messages';
import { useCollectionActions } from '../model/useCollectionActions';
import { CollectionAddButton } from './CollectionAddButton';
import { CollectionItemControls } from './CollectionItemControls';
import { ConfirmDialog } from './ConfirmDialog';

interface CollectionOverlayProps {
  grids: readonly CollectionGrid[];
  activeElement: Element | null;
  t: SiteEditorMessages;
  onAddRecord: (resource: RecordResource) => void;
}

interface PendingRemoval {
  grid: CollectionGrid;
  item: CollectionItem;
  label: string;
}

const findActive = (grids: readonly CollectionGrid[], element: Element | null) => {
  if (!element) return null;
  for (const grid of grids) {
    const item = grid.items.find((candidate) => candidate.cell.contains(element));
    if (item) return { grid, item };
  }
  return null;
};

export function CollectionOverlay({
  grids,
  activeElement,
  t,
  onAddRecord,
}: CollectionOverlayProps) {
  const actions = useCollectionActions();
  const [removing, setRemoving] = useState<PendingRemoval | null>(null);
  const active = findActive(grids, activeElement);
  const removal = removing ? removalOf(removing.grid.collection) : null;

  return (
    <>
      {grids
        .filter((grid) => isOnScreen(grid.container))
        .map((grid) => (
          <CollectionAddButton
            key={grid.key}
            grid={grid}
            isBusy={actions.isBusy}
            t={t}
            onAdd={() => {
              if (grid.collection.kind === 'record') onAddRecord(grid.collection.resource);
              else void actions.addEntry(grid);
            }}
          />
        ))}
      {active && (canReorder(active.grid.collection) || removalOf(active.grid.collection)) && (
        <CollectionItemControls
          key={active.item.target.address.entryId}
          grid={active.grid}
          item={active.item}
          isBusy={actions.isBusy}
          t={t}
          onMove={(direction, label) =>
            void actions.move(active.grid, active.item, direction, label)
          }
          onRemove={(label) => setRemoving({ grid: active.grid, item: active.item, label })}
        />
      )}
      <ConfirmDialog
        open={Boolean(removing)}
        title={removing ? t.collection.removeTitle(removing.label) : ''}
        description={removal === 'hide' ? t.collection.hideText : t.collection.removeText}
        confirmLabel={t.collection.removeConfirm}
        cancelLabel={t.keepEditing}
        closeLabel={t.close}
        isPending={actions.isBusy}
        onConfirm={() => {
          if (!removing) return;
          void actions
            .remove(removing.grid, removing.item, removing.label)
            .finally(() => setRemoving(null));
        }}
        onClose={() => setRemoving(null)}
      />
    </>
  );
}
