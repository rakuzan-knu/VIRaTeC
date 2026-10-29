import { Check, CircleAlert, LoaderCircle, RotateCw } from 'lucide-react';
import { retryFailedSaves } from '../model/autosaveRegistry';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore, type SaveStatus } from '../model/store';

const STATUS_ORDER: readonly SaveStatus[] = ['conflict', 'error', 'saving', 'saved'];

const overallStatus = (statuses: Record<string, SaveStatus>) => {
  const values = new Set(Object.values(statuses));
  return STATUS_ORDER.find((status) => values.has(status)) ?? null;
};

export function SaveIndicator({ t }: { t: SiteEditorMessages }) {
  const status = useSiteEditorStore((state) => overallStatus(state.saveStates));

  return (
    <span role="status" className="flex items-center gap-1.5 px-2 text-[13px] text-text-muted">
      {status === 'saving' && (
        <>
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
          <span className="sr-only sm:not-sr-only">{t.autosave.saving}</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check aria-hidden="true" className="editor-pop-in size-4 text-viratec-cyan" />
          <span className="sr-only sm:not-sr-only">{t.autosave.saved}</span>
        </>
      )}
      {status === 'conflict' && (
        <>
          <CircleAlert aria-hidden="true" className="size-4 text-state-error" />
          <span className="sr-only sm:not-sr-only">{t.autosave.conflictShort}</span>
        </>
      )}
      {status === 'error' && (
        <button
          type="button"
          onClick={() => void retryFailedSaves()}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-state-error hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <RotateCw aria-hidden="true" className="size-4" />
          {t.autosave.failed}. {t.autosave.retry}
        </button>
      )}
    </span>
  );
}
