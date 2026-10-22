import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getApiErrorCode } from '@/shared/api/apiClient';
import { CodePrompt, useStepUp } from '@/features/manage-two-factor';
import { Dialog } from '@/shared/ui/dialog';
import { useAdminMessages } from './messages';
import { ADMIN_QUERY_KEY } from './queries';

const STEP_UP_CODES = new Set(['STEP_UP_REQUIRED', 'MFA_REVERIFY_REQUIRED']);

export const needsStepUp = (error: unknown) => STEP_UP_CODES.has(getApiErrorCode(error) ?? '');

type RunWithStepUp = <T>(action: () => Promise<T>) => Promise<T>;

const StepUpContext = createContext<RunWithStepUp | null>(null);

export function StepUpProvider({ children }: { children: ReactNode }) {
  const t = useAdminMessages();
  const queryClient = useQueryClient();
  const stepUp = useStepUp();
  const [isOpen, setIsOpen] = useState(false);
  const pending = useRef<((confirmed: boolean) => void) | null>(null);

  const requestStepUp = useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        pending.current = resolve;
        stepUp.reset();
        setIsOpen(true);
      }),
    [stepUp],
  );

  const settle = (confirmed: boolean) => {
    setIsOpen(false);
    pending.current?.(confirmed);
    pending.current = null;
  };

  const runWithStepUp = useCallback<RunWithStepUp>(
    async (action) => {
      try {
        return await action();
      } catch (error) {
        if (!needsStepUp(error) || !(await requestStepUp())) throw error;
        return action();
      }
    },
    [requestStepUp],
  );

  return (
    <StepUpContext.Provider value={runWithStepUp}>
      {children}
      <Dialog
        open={isOpen}
        title={t.stepUp.title}
        description={t.stepUp.description}
        closeLabel={t.close}
        onClose={() => settle(false)}
      >
        <CodePrompt
          submitLabel={t.stepUp.confirm}
          isPending={stepUp.isPending}
          error={stepUp.error}
          onCancel={() => settle(false)}
          onSubmit={(code) =>
            stepUp.mutate(code, {
              onSuccess: () => {
                void queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEY });
                settle(true);
              },
            })
          }
        />
      </Dialog>
    </StepUpContext.Provider>
  );
}

export function useRunWithStepUp() {
  const context = useContext(StepUpContext);
  if (!context) throw new Error('useRunWithStepUp must be used inside StepUpProvider');
  return context;
}
