import type { ReactNode } from 'react';
import { CodePrompt } from '@/features/manage-two-factor';
import { Dialog } from '@/shared/ui/dialog';
import { useAdminMessages } from '../model/messages';
import { StepUpContext, useStepUpController } from '../model/stepUp';

export function StepUpProvider({ children }: { children: ReactNode }) {
  const t = useAdminMessages();
  const { isOpen, isPending, error, runWithStepUp, confirm, cancel } = useStepUpController();

  return (
    <StepUpContext.Provider value={runWithStepUp}>
      {children}
      <Dialog
        open={isOpen}
        title={t.stepUp.title}
        description={t.stepUp.description}
        closeLabel={t.close}
        onClose={cancel}
      >
        <CodePrompt
          submitLabel={t.stepUp.confirm}
          isPending={isPending}
          error={error}
          onCancel={cancel}
          onSubmit={confirm}
        />
      </Dialog>
    </StepUpContext.Provider>
  );
}
