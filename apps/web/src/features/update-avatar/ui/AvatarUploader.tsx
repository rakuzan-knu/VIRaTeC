import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Camera, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { AVATAR_LIMITS } from '@viratec/contracts';
import { UserAvatar } from '@/entities/session';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Tooltip } from '@/shared/ui/Tooltip';
import { ACCEPTED_AVATAR_TYPES, AvatarFileError } from '../lib/prepareAvatar';
import { useDeleteAvatar, useUploadAvatar } from '../model/useAvatar';

const SOURCE_LIMIT_MB = AVATAR_LIMITS.sourceMaxBytes / (1024 * 1024);

const AVATAR_MESSAGES = defineMessages({
  en: {
    title: 'Profile photo',
    hint: `PNG, JPG or WebP up to ${SOURCE_LIMIT_MB} MB. We crop it to a square — or drop a file onto the photo.`,
    upload: 'Upload photo',
    change: 'Change photo',
    remove: 'Remove',
    choose: 'Choose a profile photo',
    uploaded: 'Photo updated.',
    removed: 'Photo removed.',
    errors: {
      type: 'Use a PNG, JPG or WebP image.',
      size: `The file is larger than ${SOURCE_LIMIT_MB} MB.`,
      decode: 'This image could not be read. Try another file.',
      encode: 'This image could not be processed. Try another file.',
      server: 'Could not save the photo. Please try again.',
    },
  },
  uk: {
    title: 'Фото профілю',
    hint: `PNG, JPG або WebP до ${SOURCE_LIMIT_MB} МБ. Ми обріжемо його до квадрата — можна й перетягнути файл на фото.`,
    upload: 'Завантажити фото',
    change: 'Змінити фото',
    remove: 'Видалити',
    choose: 'Вибрати фото профілю',
    uploaded: 'Фото оновлено.',
    removed: 'Фото видалено.',
    errors: {
      type: 'Використайте зображення PNG, JPG або WebP.',
      size: `Файл більший за ${SOURCE_LIMIT_MB} МБ.`,
      decode: 'Не вдалося прочитати зображення. Спробуйте інший файл.',
      encode: 'Не вдалося обробити зображення. Спробуйте інший файл.',
      server: 'Не вдалося зберегти фото. Спробуйте ще раз.',
    },
  },
});

type AvatarMessages = (typeof AVATAR_MESSAGES)['en'];

const getErrorMessage = (error: Error | null, t: AvatarMessages, networkError: string) => {
  if (!error) return null;
  if (error instanceof AvatarFileError) return t.errors[error.reason];
  if (error instanceof ApiError && error.status === NETWORK_ERROR_STATUS) return networkError;
  return t.errors.server;
};

const SECONDARY_BUTTON_CLASS =
  'inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/22 bg-white/4 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:cursor-not-allowed disabled:opacity-50';

interface AvatarUploaderProps {
  name: string;
  avatarUrl?: string | null;
}

export function AvatarUploader({ name, avatarUrl }: AvatarUploaderProps) {
  const t = useLocalized(AVATAR_MESSAGES);
  const common = useCommonMessages();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const upload = useUploadAvatar();
  const remove = useDeleteAvatar();
  const isBusy = upload.isPending || remove.isPending;
  const errorMessage =
    getErrorMessage(upload.error, t, common.networkError) ??
    getErrorMessage(remove.error, t, common.networkError);
  const status = upload.isSuccess ? t.uploaded : remove.isSuccess ? t.removed : '';

  const startUpload = (file: File | undefined) => {
    if (!file || isBusy) return;
    remove.reset();
    upload.mutate(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    startUpload(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    startUpload(event.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <Tooltip text={t.choose} className="shrink-0 self-start">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          disabled={isBusy}
          aria-label={t.choose}
          className={cn(
            'group relative size-24 shrink-0 cursor-pointer rounded-full outline-offset-4 transition-shadow focus-visible:outline-2 focus-visible:outline-viratec-lime disabled:cursor-wait',
            isDragging && 'ring-2 ring-viratec-lime ring-offset-4 ring-offset-viratec-deep',
          )}
        >
          <UserAvatar name={name} avatarUrl={avatarUrl} className="size-24 text-3xl" />
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-full bg-viratec-ink/60 text-white transition-opacity',
              isBusy || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
          >
            {isBusy ? (
              <LoaderCircle className="size-6 animate-spin motion-reduce:animate-none" />
            ) : (
              <Camera className="size-6" />
            )}
          </span>
        </button>
      </Tooltip>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={inputId} className="text-label font-medium text-white">
            {t.title}
          </label>
          <p className="text-sm leading-5 text-viratec-muted">{t.hint}</p>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED_AVATAR_TYPES}
          onChange={handleChange}
          disabled={isBusy}
          className="sr-only"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isBusy}
            className={SECONDARY_BUTTON_CLASS}
          >
            <Upload aria-hidden="true" className="size-4" />
            {avatarUrl ? t.change : t.upload}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => {
                upload.reset();
                remove.mutate();
              }}
              disabled={isBusy}
              className={SECONDARY_BUTTON_CLASS}
            >
              <Trash2 aria-hidden="true" className="size-4" />
              {t.remove}
            </button>
          )}
        </div>
        {errorMessage && (
          <p role="alert" className="text-sm text-state-error">
            {errorMessage}
          </p>
        )}
        <p role="status" className="text-sm text-viratec-accent empty:hidden">
          {status}
        </p>
      </div>
    </div>
  );
}
