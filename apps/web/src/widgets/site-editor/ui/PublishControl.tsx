import { Check, Rocket } from 'lucide-react';
import { CodePrompt } from '@/features/manage-two-factor';
import { Dialog } from '@/shared/ui/dialog';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore } from '../model/store';
import { usePublishFlow } from '../model/usePublishFlow';
import { ConfirmDialog } from './ConfirmDialog';

interface PublishControlProps {
  count: number;
  t: SiteEditorMessages;
}

export function PublishControl({ count, t }: PublishControlProps) {
  const flow = usePublishFlow();
  const published = useSiteEditorStore((state) => state.publishResult?.published.length ?? 0);

  return (
    <span className="relative flex">
      {(count > 0 || flow.isPending) && (
        <button
          type="button"
          disabled={flow.isPending}
          aria-busy={flow.isPending}
          aria-label={t.publish.button(count)}
          onClick={flow.confirm}
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-brand-lime px-3 text-[14px] font-medium text-text-on-lime transition-colors hover:bg-brand-lime/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none"
        >
          <Rocket aria-hidden="true" className="size-4" />
          <span aria-hidden="true" className="hidden sm:inline">
            {t.publish.button(count)}
          </span>
          <span aria-hidden="true" className="tabular-nums sm:hidden">
            {count}
          </span>
        </button>
      )}
      {count === 0 && !flow.isPending && published > 0 && (
        <span className="flex items-center gap-1.5 px-2 text-[13px] whitespace-nowrap text-viratec-cyan">
          <Check aria-hidden="true" className="size-4" />
          <span className="sr-only sm:not-sr-only">{t.announce.published(published)}</span>
        </span>
      )}
      {flow.error && (
        <span
          role="alert"
          className="absolute top-full right-0 mt-2 w-[min(320px,calc(100vw-24px))] rounded-xl border border-state-error/40 bg-viratec-deep px-3 py-2 text-[13px] text-state-error"
        >
          {flow.error}
        </span>
      )}
      <ConfirmDialog
        open={flow.phase === 'confirm'}
        title={t.changes.publishTitle}
        description={t.changes.publishText(count)}
        confirmLabel={t.changes.publishConfirm}
        cancelLabel={t.keepEditing}
        closeLabel={t.close}
        isPending={flow.isPending}
        onConfirm={() => void flow.run()}
        onClose={flow.cancel}
      />
      <Dialog
        open={flow.phase === 'code'}
        title={t.stepUp.title}
        description={t.stepUp.description}
        closeLabel={t.close}
        onClose={flow.cancel}
      >
        <CodePrompt
          submitLabel={t.stepUp.confirm}
          isPending={flow.isVerifying || flow.isPending}
          error={flow.codeError}
          onCancel={flow.cancel}
          onSubmit={flow.submitCode}
        />
      </Dialog>
    </span>
  );
}
