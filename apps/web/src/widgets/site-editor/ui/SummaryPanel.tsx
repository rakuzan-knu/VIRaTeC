import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  ListRestart,
  Redo2,
  Trash2,
  Undo2,
} from 'lucide-react';
import {
  AdminPermission,
  recordTypeId,
  type ContentChangeDto,
  type ContentResourceKind,
  type PublishContentResultDto,
  type RecordResource,
} from '@viratec/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/entities/session';
import { NO_PERMISSIONS } from '../model/permissions';
import { CodePrompt, useStepUp } from '@/features/manage-two-factor';
import { getApiErrorCode } from '@/shared/api/apiClient';
import { INTL_LOCALE, useLocale } from '@/shared/i18n';
import { cn, useContentPreviewStore } from '@/shared/lib';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/dialog';
import { findContentType } from '../model/contentModel';
import { useEditorErrorMessage } from '../model/errors';
import { useEditorHistory } from '../model/history';
import type { SiteEditorMessages } from '../model/messages';
import {
  EDITOR_QUERY_KEY,
  useContentChanges,
  useDiscardChange,
  usePublishContent,
} from '../model/queries';
import { SHORTCUTS } from '../model/shortcuts';
import { useSiteEditorStore } from '../model/store';
import { EDITOR_ROOT_ATTRIBUTE } from '../model/useCanvasTargets';
import { AddRecordMenu } from './AddRecordMenu';
import { ConfirmDialog } from './ConfirmDialog';
import { IconButton } from './IconButton';

const RECORD_KINDS: Partial<Record<ContentResourceKind, RecordResource>> = {
  PROJECT: 'project',
  EVENT: 'event',
  PUBLICATION: 'publication',
};

const STEP_UP_CODES = new Set(['STEP_UP_REQUIRED', 'MFA_REVERIFY_REQUIRED']);

const changeLabel = (change: ContentChangeDto, t: SiteEditorMessages) => {
  const resource = RECORD_KINDS[change.resourceType];
  if (change.label) return change.label;
  if (resource) return t.records.resource[resource];
  return change.resourceType === 'ASSET'
    ? t.changes.image
    : (findContentType(change.contentTypeId)?.name ?? change.resourceId);
};

function ChangeRow({
  change,
  t,
  canEdit,
  onDiscard,
}: {
  change: ContentChangeDto;
  t: SiteEditorMessages;
  canEdit: boolean;
  onDiscard: (change: ContentChangeDto) => void;
}) {
  const locale = useLocale();
  const select = useSiteEditorStore((state) => state.select);
  const label = changeLabel(change, t);
  const resource = RECORD_KINDS[change.resourceType];
  const time = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  }).format(new Date(change.updatedAt));
  const meta = [
    change.resourceType !== 'ASSET' && !change.isDeleted && change.fieldIds.length > 0
      ? t.changes.fields(change.fieldIds.length)
      : null,
    change.actor ? t.changes.by(change.actor.name) : null,
    time,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/3 p-3">
      {change.resourceType === 'ASSET' && (
        <ImageIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-text-subtle" />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[15px] text-text-primary">{label}</span>
          {change.isNew && (
            <span className="shrink-0 rounded-full bg-viratec-cyan/15 px-2 py-0.5 text-[11px] font-medium text-viratec-cyan">
              {t.changes.newBadge}
            </span>
          )}
          {change.isDeleted && (
            <span className="shrink-0 rounded-full bg-state-error/15 px-2 py-0.5 text-[11px] font-medium text-state-error">
              {t.records.deletedBadge}
            </span>
          )}
        </span>
        <span className="text-[13px] text-text-subtle">{meta}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {change.resourceType !== 'ASSET' && (
          <button
            type="button"
            onClick={() =>
              select(
                resource
                  ? { entryId: change.resourceId, contentTypeId: recordTypeId(resource) }
                  : { entryId: change.resourceId },
              )
            }
            className="cursor-pointer rounded-lg px-2 py-1.5 text-[13px] text-viratec-cyan hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            {t.changes.open}
          </button>
        )}
        {canEdit && (
          <IconButton
            size="sm"
            icon={Trash2}
            label={`${t.changes.discard}: ${label}`}
            onClick={() => onDiscard(change)}
          />
        )}
      </div>
    </li>
  );
}

export function SummaryPanel({ t, onExit }: { t: SiteEditorMessages; onExit: () => void }) {
  const queryClient = useQueryClient();
  const permissions = useSessionStore((state) => state.user?.permissions ?? NO_PERMISSIONS);
  const canEdit = permissions.includes(AdminPermission.CONTENT_EDIT);
  const canPublish = permissions.includes(AdminPermission.CONTENT_PUBLISH);
  const issuesByDomain = useContentPreviewStore((state) => state.issues);
  const issues = useMemo(
    () => [...new Set(Object.values(issuesByDomain).flat())],
    [issuesByDomain],
  );
  const changes = useContentChanges();
  const discard = useDiscardChange();
  const publish = usePublishContent();
  const stepUp = useStepUp();
  const publishError = useEditorErrorMessage(
    publish.error && !STEP_UP_CODES.has(getApiErrorCode(publish.error) ?? '')
      ? publish.error
      : null,
  );
  const [discarding, setDiscarding] = useState<ContentChangeDto | null>(null);
  const [isConfirmingPublish, setConfirmingPublish] = useState(false);
  const [isSteppingUp, setSteppingUp] = useState(false);
  const [result, setResult] = useState<PublishContentResultDto | null>(null);
  const [isConfirmingUndoAll, setConfirmingUndoAll] = useState(false);
  const isCollapsed = useSiteEditorStore((state) => state.isSummaryCollapsed);
  const past = useSiteEditorStore((state) => state.past);
  const future = useSiteEditorStore((state) => state.future);
  const isHistoryBusy = useSiteEditorStore((state) => state.isHistoryBusy);
  const hasHistoryError = useSiteEditorStore((state) => state.hasHistoryError);
  const { setSummaryCollapsed, setHistory, announce } = useSiteEditorStore.getState();
  const history = useEditorHistory();
  const lastAction = past[past.length - 1];
  const nextAction = future[future.length - 1];
  const bodyId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  const items = changes.data ?? [];

  const runPublish = () => {
    setResult(null);
    publish.mutate(
      {},
      {
        onSuccess: (published) => {
          setConfirmingPublish(false);
          setResult(published);
          if (published.published.length > 0) {
            setHistory([], []);
            announce(t.announce.published(published.published.length));
          }
        },
        onError: (error) => {
          setConfirmingPublish(false);
          if (STEP_UP_CODES.has(getApiErrorCode(error) ?? '')) {
            stepUp.reset();
            setSteppingUp(true);
          }
        },
      },
    );
  };

  return (
    <section
      {...{ [EDITOR_ROOT_ATTRIBUTE]: '' }}
      aria-label={t.changes.title}
      className="pointer-events-auto fixed top-[128px] right-3 left-3 z-[2147483003] xl:top-[152px] flex max-h-[min(640px,calc(100svh-144px))] xl:max-h-[min(640px,calc(100svh-168px))] flex-col rounded-3xl border border-white/12 bg-viratec-deep shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:left-auto sm:w-[400px]"
    >
      <header className="flex flex-col gap-3 border-b border-white/8 p-4">
        <div className="flex items-center gap-2">
          <h2
            ref={titleRef}
            tabIndex={-1}
            className="flex-1 text-[17px] font-medium text-text-primary outline-none"
          >
            {t.changes.title}
            {items.length > 0 && (
              <span className="ml-2 rounded-full bg-brand-lime px-2 py-0.5 align-middle text-[12px] text-text-on-lime">
                {items.length}
              </span>
            )}
          </h2>
          <IconButton
            icon={isCollapsed ? ChevronDown : ChevronUp}
            label={isCollapsed ? t.expand : t.collapse}
            aria-expanded={!isCollapsed}
            aria-controls={bodyId}
            onClick={() => setSummaryCollapsed(!isCollapsed)}
          />
        </div>
        <div
          role="group"
          aria-label={t.history.title}
          className="flex flex-wrap items-center gap-1 rounded-xl bg-white/5 p-1"
        >
          <IconButton
            icon={Undo2}
            label={lastAction ? t.history.undoAction(lastAction.label) : t.history.nothingToUndo}
            shortcut={SHORTCUTS.undo}
            disabled={!lastAction || isHistoryBusy}
            onClick={() => void history.undo()}
          />
          <IconButton
            icon={Redo2}
            label={nextAction ? t.history.redoAction(nextAction.label) : t.history.nothingToRedo}
            shortcut={SHORTCUTS.redo}
            disabled={!nextAction || isHistoryBusy}
            onClick={() => void history.redo()}
          />
          <button
            type="button"
            disabled={past.length === 0 || isHistoryBusy}
            onClick={() => setConfirmingUndoAll(true)}
            className="ml-auto inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl px-3 text-[13px] font-medium text-text-muted transition-colors hover:bg-white/8 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
          >
            <ListRestart aria-hidden="true" className="size-4" />
            {t.history.undoAll}
            {past.length > 0 && <span className="tabular-nums">({past.length})</span>}
          </button>
        </div>
        {hasHistoryError && (
          <p role="alert" className="text-[13px] text-state-error">
            {t.history.failed}
          </p>
        )}
      </header>

      <div
        id={bodyId}
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-contain p-4',
          isCollapsed && 'hidden',
        )}
      >
        <p className="rounded-xl bg-white/5 px-3 py-2 text-[13px] leading-5 text-text-muted">
          {t.draftsExplained} {t.hint}
        </p>
        {issues.length > 0 && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-2xl border border-state-error/40 bg-state-error/8 p-3"
          >
            <span className="flex items-center gap-2 text-[14px] font-medium text-state-error">
              <AlertTriangle aria-hidden="true" className="size-4" />
              {t.changes.issuesTitle}
            </span>
            <p className="text-[13px] text-text-muted">{t.changes.issuesText}</p>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-[13px] text-text-primary">
              {issues.slice(0, 8).map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {changes.isPending && (
          <p role="status" className="text-text-muted">
            {t.loading}
          </p>
        )}
        {changes.isError && (
          <div role="alert" className="flex flex-col items-start gap-3 text-[14px] text-text-muted">
            {t.loadFailed}
            <Button label={t.retry} variant="secondary" onClick={() => void changes.refetch()} />
          </div>
        )}
        <AddRecordMenu t={t} />
        {changes.isSuccess && items.length === 0 && (
          <p className="text-[14px] text-text-muted">{t.changes.empty}</p>
        )}
        {items.length > 0 && (
          <ul className="flex flex-col gap-2">
            {items.map((change) => (
              <ChangeRow
                key={change.id}
                change={change}
                t={t}
                canEdit={canEdit}
                onDiscard={setDiscarding}
              />
            ))}
          </ul>
        )}

        {result && (
          <div role="status" className="flex flex-col gap-2 text-[14px]">
            {result.published.length > 0 && (
              <p className="text-viratec-cyan">{t.changes.published(result.published.length)}</p>
            )}
            {result.failed.length > 0 && (
              <div className="flex flex-col gap-1 text-state-error">
                <span className="font-medium">{t.changes.failedTitle}</span>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-[13px]">
                  {result.failed.map((failure) => (
                    <li key={failure.changeId}>
                      {failure.label ?? failure.changeId}: {failure.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {publishError && (
          <p role="alert" className="text-[14px] text-state-error">
            {publishError}
          </p>
        )}
      </div>

      <footer className="flex flex-col gap-2 border-t border-white/8 p-4">
        {items.length > 0 &&
          (canPublish ? (
            <Button
              label={t.changes.publishAll(items.length)}
              className="w-full"
              loading={publish.isPending}
              onClick={() => setConfirmingPublish(true)}
            />
          ) : (
            <p className="text-[13px] text-text-muted">{t.changes.noPublishRight}</p>
          ))}
        <Button label={t.exit} variant="secondary" className="w-full" onClick={onExit} />
      </footer>

      <ConfirmDialog
        open={isConfirmingPublish}
        title={t.changes.publishTitle}
        description={t.changes.publishText(items.length)}
        confirmLabel={t.changes.publishConfirm}
        cancelLabel={t.keepEditing}
        closeLabel={t.close}
        isPending={publish.isPending}
        onConfirm={runPublish}
        onClose={() => setConfirmingPublish(false)}
      />
      <ConfirmDialog
        open={Boolean(discarding)}
        title={discarding ? t.changes.discardTitle(changeLabel(discarding, t)) : ''}
        description={t.changes.discardText}
        confirmLabel={t.changes.discardConfirm}
        cancelLabel={t.keepEditing}
        closeLabel={t.close}
        isPending={discard.isPending}
        onConfirm={() => {
          if (!discarding) return;
          useSiteEditorStore.getState().dropDraft(discarding.resourceId);
          discard.mutate(discarding.id, { onSettled: () => setDiscarding(null) });
        }}
        onClose={() => setDiscarding(null)}
      />
      <ConfirmDialog
        open={isConfirmingUndoAll}
        title={t.history.undoAllTitle}
        description={t.history.undoAllText(past.length)}
        confirmLabel={t.history.undoAllConfirm}
        cancelLabel={t.keepEditing}
        closeLabel={t.close}
        isPending={isHistoryBusy}
        onConfirm={() => {
          setConfirmingUndoAll(false);
          void history.undoAll();
        }}
        onClose={() => setConfirmingUndoAll(false)}
      />
      <Dialog
        open={isSteppingUp}
        title={t.stepUp.title}
        description={t.stepUp.description}
        closeLabel={t.close}
        onClose={() => setSteppingUp(false)}
      >
        <CodePrompt
          submitLabel={t.stepUp.confirm}
          isPending={stepUp.isPending || publish.isPending}
          error={stepUp.error}
          onCancel={() => setSteppingUp(false)}
          onSubmit={(code) =>
            stepUp.mutate(code, {
              onSuccess: () => {
                setSteppingUp(false);
                void queryClient.invalidateQueries({ queryKey: EDITOR_QUERY_KEY });
                runPublish();
              },
            })
          }
        />
      </Dialog>
    </section>
  );
}
