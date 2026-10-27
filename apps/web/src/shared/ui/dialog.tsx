import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib';

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Dialog({
  open,
  title,
  description,
  closeLabel,
  onClose,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      (dialog.querySelector<HTMLElement>('[data-autofocus]') ?? dialog).focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'm-auto outline-none max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[640px] overflow-y-auto rounded-[28px] border border-white/12 bg-viratec-surface p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm',
        className,
      )}
    >
      {open && (
        <div className="flex flex-col gap-5 p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h2
                id={titleId}
                className="font-display text-2xl leading-8 font-medium tracking-[-0.02em]"
              >
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-[15px] leading-6 text-viratec-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-viratec-soft hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-viratec-lime"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
