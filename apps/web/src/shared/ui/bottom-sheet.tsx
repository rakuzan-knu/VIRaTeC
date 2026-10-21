import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock, useFocusTrap } from '@/shared/lib';

interface BottomSheetSectionProps {
  title: string;
  children: ReactNode;
}

export function BottomSheetSection({ title, children }: BottomSheetSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-[13px] font-medium text-viratec-subtle">{title}</h3>
      {children}
    </section>
  );
}

interface BottomSheetProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  headerAction?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function BottomSheet({
  isOpen,
  title,
  onClose,
  headerAction,
  footer,
  children,
}: BottomSheetProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(isOpen);
  useFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end font-viratec">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[rgba(1,6,18,0.72)]"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[85vh] w-full flex-col rounded-t-[22px] border-t border-white/10 bg-[#0b1d3d] px-5 pt-3 pb-8"
      >
        <span aria-hidden="true" className="mx-auto h-1 w-10 shrink-0 rounded-full bg-white/25" />
        <div className="flex items-center justify-between pt-5 pb-4">
          <h2 id={titleId} className="text-[22px] font-medium text-white">
            {title}
          </h2>
          {headerAction}
        </div>
        <div className="flex flex-col gap-6 overflow-y-auto pb-6">{children}</div>
        {footer}
      </div>
    </div>,
    document.body,
  );
}
