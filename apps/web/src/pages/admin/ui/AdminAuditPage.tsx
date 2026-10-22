import { useState } from 'react';
import { INTL_LOCALE, useLocale } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { useAdminMessages } from '../model/messages';
import { useAuditLog } from '../model/queries';
import { ADMIN_CARD_CLASS, AdminSectionHeader } from './AdminLayout';

const PAGER_CLASS =
  'rounded-full border border-white/16 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:opacity-50';

export function AdminAuditPage() {
  const t = useAdminMessages();
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const { data, isPending } = useAuditLog(page, action);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const formatTime = (iso: string) =>
    new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date(iso));

  return (
    <>
      <AdminSectionHeader
        title={t.audit.title}
        subtitle={t.audit.subtitle}
        aside={
          <label className="flex flex-col gap-1.5 text-sm text-viratec-muted">
            {t.audit.filter}
            <select
              value={action}
              onChange={(event) => {
                setAction(event.target.value);
                setPage(1);
              }}
              className="rounded-full border border-white/14 bg-viratec-deep px-4 py-2.5 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
            >
              <option value="">{t.audit.all}</option>
              {Object.entries(t.auditActions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <div className={cn(ADMIN_CARD_CLASS, 'overflow-x-auto p-0 lg:p-0')}>
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="text-viratec-subtle">
            <tr className="border-b border-white/8">
              <th scope="col" className="px-5 py-4 font-medium">
                {t.audit.columns.time}
              </th>
              <th scope="col" className="px-5 py-4 font-medium">
                {t.audit.columns.actor}
              </th>
              <th scope="col" className="px-5 py-4 font-medium">
                {t.audit.columns.action}
              </th>
              <th scope="col" className="px-5 py-4 font-medium">
                {t.audit.columns.target}
              </th>
              <th scope="col" className="px-5 py-4 font-medium">
                {t.audit.columns.ip}
              </th>
            </tr>
          </thead>
          <tbody aria-busy={isPending}>
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-viratec-muted">
                  {t.audit.empty}
                </td>
              </tr>
            )}
            {data?.items.map((entry) => (
              <tr key={entry.id} className="border-b border-white/6 align-top last:border-0">
                <td className="px-5 py-3.5 whitespace-nowrap text-viratec-muted">
                  <time dateTime={entry.createdAt}>{formatTime(entry.createdAt)}</time>
                </td>
                <td className="px-5 py-3.5">
                  {entry.actor ? (
                    <>
                      <p className="text-white">{entry.actor.name}</p>
                      <p className="text-xs text-viratec-subtle">{entry.actor.email}</p>
                    </>
                  ) : (
                    <span className="text-viratec-subtle">{t.audit.system}</span>
                  )}
                </td>
                <td
                  className={cn(
                    'px-5 py-3.5',
                    /failed|reuse|blocked/.test(entry.action) ? 'text-red-300' : 'text-white',
                  )}
                >
                  {t.auditActions[entry.action] ?? entry.action}
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-viratec-subtle">
                  {entry.targetId ? `${entry.targetType ?? ''} ${entry.targetId.slice(0, 8)}` : '—'}
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-viratec-subtle">
                  {entry.ipAddress ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="flex items-center justify-between gap-4 text-sm text-viratec-muted">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
            className={PAGER_CLASS}
          >
            {t.users.previous}
          </button>
          <span>{t.users.page(page, pages)}</span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((value) => value + 1)}
            className={PAGER_CLASS}
          >
            {t.users.next}
          </button>
        </nav>
      )}
    </>
  );
}
