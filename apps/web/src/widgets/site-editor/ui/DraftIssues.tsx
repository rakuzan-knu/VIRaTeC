import { AlertTriangle } from 'lucide-react';
import type { ContentChangeDto } from '@viratec/contracts';
import type { ContentIssue } from '@/shared/lib';
import { groupIssues, issueGroupTitle, issueText } from '../model/issues';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore } from '../model/store';

export function DraftIssues({
  issues,
  changes,
  t,
}: {
  issues: readonly ContentIssue[];
  changes: readonly ContentChangeDto[];
  t: SiteEditorMessages;
}) {
  const select = useSiteEditorStore((state) => state.select);
  const groups = groupIssues(issues);

  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-state-error/40 bg-state-error/8 p-3"
    >
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-[14px] font-medium text-state-error">
          <AlertTriangle aria-hidden="true" className="size-4" />
          {t.changes.issuesTitle}
        </span>
        <p className="text-[13px] text-text-muted">{t.changes.issuesText}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {groups.map((group) => {
          const label = changes.find((change) => change.resourceId === group.key)?.label;
          const title = issueGroupTitle(group, label, t);
          return (
            <li
              key={group.key}
              className="flex flex-col gap-1.5 rounded-xl border border-white/8 bg-white/3 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 text-[14px] font-medium break-words text-text-primary">
                  {title}
                </span>
                {group.selection && (
                  <button
                    type="button"
                    aria-label={`${t.changes.open}: ${title}`}
                    onClick={() => group.selection && select(group.selection)}
                    className="-my-1 shrink-0 cursor-pointer rounded-lg px-2 py-1 text-[13px] text-viratec-cyan hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
                  >
                    {t.changes.open}
                  </button>
                )}
              </div>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-[13px] leading-5 break-words text-text-muted">
                {group.lines.map((line) => (
                  <li key={line.key}>{issueText(line, t)}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
