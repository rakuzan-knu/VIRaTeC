import { useId, useRef, useState } from 'react';
import { ImageUp, Trash2 } from 'lucide-react';
import type { ContentAssetDto } from '@viratec/contracts';
import { cn } from '@/shared/lib';
import { ACCEPTED_IMAGE_TYPES, ImageFileError, prepareImage } from '../lib/prepareImage';
import { useEditorErrorMessage } from '../model/errors';
import type { SiteEditorMessages } from '../model/messages';
import { useUploadAsset } from '../model/queries';

interface ImageUploadFieldProps {
  label: string;
  help?: string;
  previewSrc: string | undefined;
  previewAlt: string;
  hasValue: boolean;
  canRemove: boolean;
  readOnly: boolean;
  uploadName?: string;
  t: SiteEditorMessages;
  onUploaded: (asset: ContentAssetDto) => string | null;
  onRemove: () => void;
}

const ACTION_CLASS =
  'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[14px] text-text-primary transition-colors hover:border-viratec-cyan/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none';

export function ImageUploadField({
  label,
  help,
  previewSrc,
  previewAlt,
  hasValue,
  canRemove,
  readOnly,
  uploadName,
  t,
  onUploaded,
  onRemove,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const hintId = useId();
  const [isDragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAsset();
  const uploadError = useEditorErrorMessage(upload.error);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileError(null);
    try {
      const prepared = await prepareImage(file);
      const dot = prepared.fileName.lastIndexOf('.');
      const extension = dot >= 0 ? prepared.fileName.slice(dot) : '';
      const uploaded = await upload.mutateAsync({
        ...prepared,
        fileName: uploadName ? `${uploadName}${extension}` : prepared.fileName,
        title: file.name.replace(/\.[^.]+$/, '') || 'Image',
      });
      setFileError(onUploaded(uploaded));
    } catch (error) {
      if (error instanceof ImageFileError) {
        setFileError(error.reason === 'size' ? t.inspector.imageTooLarge : t.inspector.imageType);
      }
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const error = fileError ?? uploadError;

  return (
    <div className="flex flex-col gap-3">
      <span className="text-label font-medium text-text-primary">{label}</span>
      <div
        className={cn(
          'rounded-xl border border-dashed p-2 transition-colors motion-reduce:transition-none',
          isDragging ? 'border-viratec-cyan bg-viratec-cyan/6' : 'border-transparent',
        )}
        onDragOver={(event) => {
          if (readOnly || upload.isPending) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          if (readOnly || upload.isPending) return;
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
      >
        {previewSrc ? (
          <img
            src={previewSrc}
            alt={previewAlt}
            className="max-h-56 w-full rounded-xl border border-white/8 bg-white/4 object-contain"
          />
        ) : (
          <p className="rounded-xl bg-white/4 px-3 py-6 text-center text-[14px] text-text-subtle">
            {t.inspector.noImage}
          </p>
        )}
      </div>
      <p id={hintId} className="text-[13px] text-text-muted">
        {[help, readOnly ? null : t.inspector.imageHint].filter(Boolean).join(' ')}
      </p>
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <button
            type="button"
            className={ACTION_CLASS}
            disabled={upload.isPending}
            aria-busy={upload.isPending || undefined}
            aria-describedby={hintId}
            onClick={() => inputRef.current?.click()}
          >
            <ImageUp aria-hidden="true" className="size-4" />
            {upload.isPending
              ? t.inspector.uploading
              : hasValue
                ? t.inspector.replaceImage
                : t.inspector.uploadImage}
          </button>
          {hasValue && canRemove && (
            <button type="button" className={ACTION_CLASS} onClick={onRemove}>
              <Trash2 aria-hidden="true" className="size-4" />
              {t.inspector.removeImage}
            </button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-caption text-state-error">
          {error}
        </p>
      )}
    </div>
  );
}
