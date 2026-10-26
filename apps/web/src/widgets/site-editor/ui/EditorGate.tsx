import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { CodePrompt, useStepUp } from '@/features/manage-two-factor';
import { buildAccountPath } from '@/shared/config/routes';
import { PREVIEW_CONTENT_QUERY_KEY } from '@/shared/lib';
import { linkButtonClassName } from '@/shared/ui/link-button';
import type { SiteEditorMessages } from '../model/messages';
import { EDITOR_QUERY_KEY, useRefreshRecordQueries } from '../model/queries';
import { EDITOR_ROOT_ATTRIBUTE } from '../model/useCanvasTargets';

export type EditorGateCode = 'MFA_REVERIFY_REQUIRED' | 'MFA_SETUP_REQUIRED' | 'NO_ACCESS';

function GateCard({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <section
      {...{ [EDITOR_ROOT_ATTRIBUTE]: '' }}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      className="pointer-events-auto fixed top-[128px] right-3 left-3 z-[2147483003] xl:top-[152px] flex flex-col gap-4 rounded-3xl border border-white/12 bg-viratec-deep p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:left-auto sm:w-[400px]"
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-white/6">
        <Icon aria-hidden="true" className="size-5 text-viratec-cyan" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[19px] font-medium text-text-primary">{title}</h2>
        <p className="text-[14px] leading-6 text-text-muted">{text}</p>
      </div>
      {children}
    </section>
  );
}

export function EditorGate({ code, t }: { code: EditorGateCode; t: SiteEditorMessages }) {
  const queryClient = useQueryClient();
  const stepUp = useStepUp();
  const refreshRecords = useRefreshRecordQueries();

  if (code === 'MFA_REVERIFY_REQUIRED') {
    return (
      <GateCard icon={ShieldCheck} title={t.gate.reverifyTitle} text={t.gate.reverifyText}>
        <CodePrompt
          submitLabel={t.gate.reverifyAction}
          isPending={stepUp.isPending}
          error={stepUp.error}
          onSubmit={(code) =>
            stepUp.mutate(code, {
              onSuccess: () =>
                Promise.all([
                  queryClient.invalidateQueries({ queryKey: EDITOR_QUERY_KEY }),
                  queryClient.invalidateQueries({ queryKey: PREVIEW_CONTENT_QUERY_KEY }),
                  refreshRecords(),
                ]),
            })
          }
        />
      </GateCard>
    );
  }
  if (code === 'MFA_SETUP_REQUIRED') {
    return (
      <GateCard icon={ShieldAlert} title={t.gate.mfaTitle} text={t.gate.mfaText}>
        <Link
          to={buildAccountPath('security')}
          className={linkButtonClassName({ size: 'md', className: 'self-start' })}
        >
          {t.gate.mfaAction}
        </Link>
      </GateCard>
    );
  }
  return <GateCard icon={ShieldAlert} title={t.gate.noAccessTitle} text={t.gate.noAccessText} />;
}
