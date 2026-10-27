import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  closeLabel,
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      description={description}
      closeLabel={closeLabel}
      onClose={onClose}
    >
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button label={cancelLabel} variant="secondary" onClick={onClose} />
        <Button label={confirmLabel} loading={isPending} onClick={onConfirm} />
      </div>
    </Dialog>
  );
}
