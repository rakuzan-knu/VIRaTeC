import { ImageUp, LoaderCircle } from 'lucide-react';
import type { SiteEditorMessages } from '../model/messages';
import { useElementRects } from '../model/useCanvasTargets';
import type { DropTarget } from '../model/useImageDrop';

interface ImageDropOverlayProps {
  target: DropTarget;
  isUploading: boolean;
  t: SiteEditorMessages;
}

export function ImageDropOverlay({ target, isUploading, t }: ImageDropOverlayProps) {
  const [rect] = useElementRects(target.element);
  if (!rect) return null;

  return (
    <div
      role={isUploading ? 'status' : undefined}
      style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      className="pointer-events-none fixed z-[2147483001] flex items-center justify-center rounded-xl border-2 border-dashed border-viratec-cyan bg-viratec-deep/75 p-3 text-center text-[15px] font-medium text-text-primary"
    >
      <span className="flex items-center gap-2">
        {isUploading ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-5 animate-spin motion-reduce:animate-none"
          />
        ) : (
          <ImageUp aria-hidden="true" className="size-5 text-viratec-cyan" />
        )}
        {isUploading ? t.drop.uploading : t.drop.hint}
      </span>
    </div>
  );
}
