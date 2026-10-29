import { useMutation } from '@tanstack/react-query';
import { LoaderCircle, WandSparkles } from 'lucide-react';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore } from '../model/store';
import { translationErrorMessage } from '../model/useTranslateText';

interface TranslateAllButtonProps {
  count: number;
  t: SiteEditorMessages;
  onRun: () => Promise<number>;
}

export function TranslateAllButton({ count, t, onRun }: TranslateAllButtonProps) {
  const run = useMutation({
    mutationFn: onRun,
    onSuccess: (done) => useSiteEditorStore.getState().announce(t.translation.allDone(done)),
  });
  const error = translationErrorMessage(run.error, t);
  if (count === 0 && !run.isPending) return null;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={run.isPending}
        aria-busy={run.isPending}
        onClick={() => {
          useSiteEditorStore.getState().announce(t.translation.translating);
          run.mutate();
        }}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-xl border border-viratec-cyan/50 px-3 py-2 text-[14px] font-medium text-viratec-cyan transition-colors hover:bg-viratec-cyan/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
      >
        {run.isPending ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
        ) : (
          <WandSparkles aria-hidden="true" className="size-4" />
        )}
        {run.isPending ? t.translation.translating : t.translation.all(count)}
      </button>
      {error && (
        <p role="alert" className="text-[13px] text-state-error">
          {error}
        </p>
      )}
    </div>
  );
}
