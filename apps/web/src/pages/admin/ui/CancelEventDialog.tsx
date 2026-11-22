import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/dialog';
import { Textarea } from '@/shared/ui/Textarea';
import { useAdminMessages } from '../model/messages';

const REASON_MAX_LENGTH = 500;

interface CancelEventDialogProps {
  label: string;
  subscribers: number;
  closeLabel: string;
  keepLabel: string;
  isPending: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function CancelEventDialog({
  label,
  subscribers,
  closeLabel,
  keepLabel,
  isPending,
  onConfirm,
  onClose,
}: CancelEventDialogProps) {
  const t = useAdminMessages().eventCancel;
  const [reason, setReason] = useState('');

  return (
    <Dialog
      open
      title={t.title(label)}
      description={t.description(subscribers)}
      closeLabel={closeLabel}
      onClose={onClose}
    >
      <div className="flex flex-col gap-5">
        <Textarea
          label={t.reasonLabel}
          helperText={t.reasonHelp}
          value={reason}
          rows={3}
          maxLength={REASON_MAX_LENGTH}
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button label={keepLabel} variant="secondary" onClick={onClose} />
          <Button label={t.confirm} loading={isPending} onClick={() => onConfirm(reason)} />
        </div>
      </div>
    </Dialog>
  );
}
