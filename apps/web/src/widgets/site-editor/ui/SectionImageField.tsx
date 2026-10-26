import { useId, useRef, useState } from 'react';
import { ImageUp, Trash2 } from 'lucide-react';
import { AdminPermission } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import type { SectionImage } from '@/shared/config/pageLayout';
import { ACCEPTED_IMAGE_TYPES, ImageFileError, prepareImage } from '../lib/prepareImage';
import { useEditorErrorMessage } from '../model/errors';
import type { SiteEditorMessages } from '../model/messages';
import { NO_PERMISSIONS } from '../model/permissions';
import { useUploadAsset } from '../model/queries';
import { LocalizedInput } from './LocalizedInput';

const ACTION_CLASS =
  'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[14px] text-text-primary transition-colors hover:border-viratec-cyan/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none';

interface SectionImageFieldProps {
  value: SectionImage | null | undefined;
  readOnly: boolean;
  t: SiteEditorMessages;
  onChange: (value: SectionImage | null) => void;
}

export function SectionImageField({ value, readOnly, t, onChange }: SectionImageFieldProps) {
  const labels = t.structure;
  const helpId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const permissions = useSessionStore((state) => state.user?.permissions ?? NO_PERMISSIONS);
  const canUpload = permissions.includes(AdminPermission.MEDIA_MANAGE);
  const upload = useUploadAsset();
  const uploadError = useEditorErrorMessage(upload.error);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileError(null);
    try {
      const prepared = await prepareImage(file);
      const title = file.name.replace(/\.[^.]+$/, '') || 'Image';
      const uploaded = await upload.mutateAsync({ ...prepared, title });
      onChange({
        assetId: uploaded.id,
        url: uploaded.url,
        alt: value?.alt ?? { en: '', uk: '' },
      });
    } catch (error) {
      if (error instanceof ImageFileError) {
        setFileError(error.reason === 'size' ? t.inspector.imageTooLarge : t.inspector.imageType);
      }
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const error = fileError ?? uploadError;
  const editable = !readOnly && canUpload;

  return (
    <fieldset className="flex min-w-0 flex-col gap-3" aria-describedby={helpId}>
      <legend className="mb-1 text-label font-medium text-text-primary">{labels.image}</legend>
      {value ? (
        <img
          src={`${value.url}${value.url.includes('?') ? '&' : '?'}w=640&fm=webp`}
          alt={value.alt.uk || value.alt.en}
          className="max-h-56 w-full rounded-xl border border-white/8 bg-white/4 object-contain"
        />
      ) : (
        <p className="rounded-xl border border-dashed border-white/15 p-4 text-center text-[14px] text-text-subtle">
          {labels.noImage}
        </p>
      )}
      <p id={helpId} className="text-caption text-text-muted">
        {readOnly || canUpload ? labels.imageFormats : labels.imageNoPermission}
      </p>
      {editable && (
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
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
            onClick={() => inputRef.current?.click()}
          >
            <ImageUp aria-hidden="true" className="size-4" />
            {upload.isPending ? labels.uploading : value ? labels.replaceImage : labels.uploadImage}
          </button>
          {value && (
            <button type="button" className={ACTION_CLASS} onClick={() => onChange(null)}>
              <Trash2 aria-hidden="true" className="size-4" />
              {labels.removeImage}
            </button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-caption text-state-error">
          {error}
        </p>
      )}
      {value && (
        <LocalizedInput
          label={labels.imageAlt}
          helperText={labels.imageAltHelp}
          value={value.alt}
          readOnly={readOnly}
          t={t}
          onChange={(alt) => onChange({ ...value, alt })}
        />
      )}
    </fieldset>
  );
}
