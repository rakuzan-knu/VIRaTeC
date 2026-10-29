import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStepUp } from '@/features/manage-two-factor';
import { getApiErrorCode } from '@/shared/api/apiClient';
import { flushDrafts } from './autosaveRegistry';
import { useEditorErrorMessage } from './errors';
import { useSiteEditorMessages } from './messages';
import { EDITOR_QUERY_KEY, usePublishContent } from './queries';
import { useSiteEditorStore } from './store';

const STEP_UP_CODES = new Set(['STEP_UP_REQUIRED', 'MFA_REVERIFY_REQUIRED']);

export type PublishPhase = 'idle' | 'confirm' | 'code';

export function usePublishFlow() {
  const t = useSiteEditorMessages();
  const queryClient = useQueryClient();
  const publish = usePublishContent();
  const stepUp = useStepUp();
  const [phase, setPhase] = useState<PublishPhase>('idle');
  const [isFlushing, setFlushing] = useState(false);
  const error = useEditorErrorMessage(
    publish.error && !STEP_UP_CODES.has(getApiErrorCode(publish.error) ?? '')
      ? publish.error
      : null,
  );

  const run = async () => {
    const { setPublishResult, setHistory, announce, setSummaryOpen } =
      useSiteEditorStore.getState();
    setFlushing(true);
    await flushDrafts();
    setFlushing(false);
    setPublishResult(null);
    publish.mutate(
      {},
      {
        onSuccess: (published) => {
          setPhase('idle');
          setPublishResult(published);
          if (published.published.length > 0) {
            setHistory([], []);
            announce(t.announce.published(published.published.length));
          }
          if (published.failed.length > 0) setSummaryOpen(true);
        },
        onError: (publishError) => {
          if (STEP_UP_CODES.has(getApiErrorCode(publishError) ?? '')) {
            stepUp.reset();
            setPhase('code');
            return;
          }
          setPhase('idle');
        },
      },
    );
  };

  const submitCode = (code: string) =>
    stepUp.mutate(code, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: EDITOR_QUERY_KEY });
        void run();
      },
    });

  return {
    phase,
    error,
    isPending: publish.isPending || isFlushing,
    isVerifying: stepUp.isPending,
    codeError: stepUp.error,
    confirm: () => setPhase('confirm'),
    cancel: () => setPhase('idle'),
    run,
    submitCode,
  };
}
