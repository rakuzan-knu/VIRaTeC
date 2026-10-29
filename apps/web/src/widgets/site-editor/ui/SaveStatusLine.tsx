import { Check, LoaderCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { resolveConflict, retryFailedSaves } from '../model/autosaveRegistry';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore } from '../model/store';

interface SaveStatusLineProps {
  saveKey: string;
  t: SiteEditorMessages;
}

export function SaveStatusLine({ saveKey, t }: SaveStatusLineProps) {
  const status = useSiteEditorStore((state) => state.saveStates[saveKey]);

  if (status === 'conflict') {
    return (
      <div role="alert" className="flex flex-col gap-3 text-[14px] text-text-primary">
        <p className="text-state-error">{t.autosave.conflict}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            label={t.autosave.keepMine}
            variant="secondary"
            className="flex-1"
            onClick={() => void resolveConflict(saveKey, 'mine')}
          />
          <Button
            label={t.autosave.takeTheirs}
            variant="secondary"
            className="flex-1"
            onClick={() => void resolveConflict(saveKey, 'theirs')}
          />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div role="alert" className="flex items-center gap-3 text-[14px] text-state-error">
        <span className="flex-1">{t.autosave.failed}</span>
        <Button
          label={t.autosave.retry}
          variant="secondary"
          onClick={() => void retryFailedSaves()}
        />
      </div>
    );
  }

  return (
    <p className="flex min-h-5 items-center gap-1.5 text-[13px] text-text-muted">
      {status === 'saving' && (
        <>
          <LoaderCircle
            aria-hidden="true"
            className="size-3.5 animate-spin motion-reduce:animate-none"
          />
          {t.autosave.saving}
        </>
      )}
      {status === 'saved' && (
        <>
          <Check aria-hidden="true" className="size-3.5 text-viratec-cyan" />
          {t.autosave.savedPrivate}
        </>
      )}
    </p>
  );
}
