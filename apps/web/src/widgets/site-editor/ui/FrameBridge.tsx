import { lazy, Suspense } from 'react';
import { useFrameGuest } from '../model/useFrameSync';

const FrameCanvas = lazy(() =>
  import('./FrameCanvas').then((module) => ({ default: module.FrameCanvas })),
);

export function FrameBridge() {
  const { isEditing, hasSelection } = useFrameGuest();
  if (!isEditing) return null;
  return (
    <Suspense fallback={null}>
      <FrameCanvas hasSelection={hasSelection} />
    </Suspense>
  );
}
