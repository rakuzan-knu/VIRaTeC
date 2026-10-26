import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getApiErrorCode } from '@/shared/api/apiClient';
import { useStepUp } from '@/features/manage-two-factor';
import { adminKeys } from './queries';

const STEP_UP_CODES = new Set(['STEP_UP_REQUIRED', 'MFA_REVERIFY_REQUIRED']);

export const needsStepUp = (error: unknown) => STEP_UP_CODES.has(getApiErrorCode(error) ?? '');

type RunWithStepUp = <T>(action: () => Promise<T>) => Promise<T>;

export const StepUpContext = createContext<RunWithStepUp | null>(null);

export function useStepUpController() {
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

  const confirm = (code: string) =>
    stepUp.mutate(code, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: adminKeys.all });
        settle(true);
      },
    });

  return {
    isOpen,
    isPending: stepUp.isPending,
    error: stepUp.error,
    runWithStepUp,
    confirm,
    cancel: () => settle(false),
  };
}

export function useRunWithStepUp() {
  const context = useContext(StepUpContext);
  if (!context) throw new Error('useRunWithStepUp must be used inside StepUpProvider');
  return context;
}
