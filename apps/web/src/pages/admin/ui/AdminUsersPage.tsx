import { useDeferredValue, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AdminPermission, StaffRole, type AdminUserDto } from '@viratec/contracts';
import { INTL_LOCALE, useLocale } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { useSessionStore } from '@/entities/session';
import type { AdminCapabilities } from '../api/adminApi';
import { useAdminMessages } from '../model/messages';
import {
  useAdminUsers,
  useRevokeStaffAccess,
  useRevokeUserSessions,
  useSetUserBlocked,
} from '../model/queries';
import { useRunWithStepUp } from '../model/stepUp';
import { ADMIN_CARD_CLASS, AdminSectionHeader } from './AdminLayout';
import { AccessDialog } from './AccessDialog';
import { Badge } from './Badge';

const ACTION_CLASS =
  'rounded-full border border-white/16 px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:opacity-50';

export function AdminUsersPage() {
  const t = useAdminMessages();
  const locale = useLocale();
  const capabilities = useOutletContext<AdminCapabilities>();
  const currentUserId = useSessionStore((state) => state.user?.id);
  const runWithStepUp = useRunWithStepUp();
  const [search, setSearch] = useState('');
  const [staffOnly, setStaffOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminUserDto | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const deferredSearch = useDeferredValue(search);
  const { data, isPending } = useAdminUsers({ search: deferredSearch, page, staffOnly });
  const revokeAccess = useRevokeStaffAccess();
  const setBlocked = useSetUserBlocked();
  const revokeSessions = useRevokeUserSessions();

  const isOwner = capabilities.staffRole === StaffRole.OWNER;
  const canManageUsers = capabilities.permissions.includes(AdminPermission.USERS_MANAGE);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'medium' }).format(new Date(iso));

  const perform = async (confirmText: string, action: () => Promise<unknown>) => {
    if (!window.confirm(confirmText)) return;
    setFeedback(null);
    try {
      await runWithStepUp(action);
      setFeedback({ ok: true, text: t.users.done });
    } catch (error) {
      setFeedback({
        ok: false,
        text: error instanceof Error && error.message ? error.message : t.users.actionFailed,
      });
    }
  };

  return (
    <>
      <AdminSectionHeader title={t.users.title} subtitle={t.users.subtitle} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">{t.users.search}</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-viratec-subtle"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={t.users.search}
            className="w-full rounded-full border border-white/14 bg-white/4 py-3 pr-4 pl-11 text-[15px] text-white placeholder:text-viratec-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
          />
        </label>
        <label className="flex items-center gap-2 text-[15px] text-white">
          <input
            type="checkbox"
            checked={staffOnly}
            onChange={(event) => {
              setStaffOnly(event.target.checked);
              setPage(1);
            }}
            className="size-4 accent-viratec-lime"
          />
          {t.users.staffOnly}
        </label>
      </div>

      <p
        aria-live="polite"
        className={cn('text-sm', feedback?.ok ? 'text-viratec-accent' : 'text-state-error')}
      >
        {feedback?.text}
      </p>

      <div className={cn(ADMIN_CARD_CLASS, 'overflow-x-auto p-0 lg:p-0')}>
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="text-viratec-subtle">
            <tr className="border-b border-white/8">
              <th scope="col" className="px-5 py-4 font-medium">
                {t.users.columns.user}
              </th>
              <th scope="col" className="px-5 py-4 font-medium">
                {t.users.columns.access}
              </th>
              <th scope="col" className="px-5 py-4 font-medium">
                {t.users.columns.security}
              </th>
              <th scope="col" className="px-5 py-4 font-medium">
                {t.users.columns.joined}
              </th>
              <th scope="col" className="px-5 py-4 font-medium">
                {t.users.columns.actions}
              </th>
            </tr>
          </thead>
          <tbody aria-busy={isPending}>
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-viratec-muted">
                  {t.users.empty}
                </td>
              </tr>
            )}
            {data?.items.map((user) => {
              const isSelf = user.id === currentUserId;
              const isTargetOwner = user.staffRole === StaffRole.OWNER;
              const canEditAccess = isOwner && !isSelf && !isTargetOwner;
              const canModerate =
                canManageUsers &&
                !isSelf &&
                !isTargetOwner &&
                (isOwner || user.staffRole === StaffRole.NONE);

              return (
                <tr key={user.id} className="border-b border-white/6 align-top last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">
                      {user.name}
                      {isSelf && (
                        <span className="ml-2 text-xs text-viratec-subtle">({t.users.you})</span>
                      )}
                    </p>
                    <p className="text-viratec-muted">{user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <Badge
                        tone={
                          user.staffRole === StaffRole.NONE
                            ? 'muted'
                            : user.staffRole === StaffRole.OWNER
                              ? 'lime'
                              : 'cyan'
                        }
                      >
                        {t.staffRole[user.staffRole]}
                      </Badge>
                      {user.staffRole === StaffRole.ADMIN && (
                        <span className="text-xs text-viratec-subtle">
                          {t.users.permissionsCount(user.permissions.length)}
                          {user.staffExpiresAt &&
                            ` · ${t.users.expires(formatDate(user.staffExpiresAt))}`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <Badge tone={user.twoFactorEnabled ? 'lime' : 'muted'}>
                        {user.twoFactorEnabled ? t.users.twoFactorOn : t.users.twoFactorOff}
                      </Badge>
                      {user.isBlocked && <Badge tone="error">{t.users.blocked}</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-viratec-muted">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {canEditAccess && (
                        <button
                          type="button"
                          className={ACTION_CLASS}
                          onClick={() => setEditing(user)}
                        >
                          {user.staffRole === StaffRole.ADMIN
                            ? t.users.manageAccess
                            : t.users.grantAccess}
                        </button>
                      )}
                      {canEditAccess && user.staffRole === StaffRole.ADMIN && (
                        <button
                          type="button"
                          className={cn(ACTION_CLASS, 'border-red-400/40 text-red-200')}
                          onClick={() =>
                            perform(t.users.confirmRevoke(user.name), () =>
                              revokeAccess.mutateAsync(user.id),
                            )
                          }
                        >
                          {t.users.revokeAccess}
                        </button>
                      )}
                      {canModerate && (
                        <button
                          type="button"
                          className={ACTION_CLASS}
                          onClick={() =>
                            user.isBlocked
                              ? perform(t.users.unblock, () =>
                                  setBlocked.mutateAsync({ userId: user.id, blocked: false }),
                                )
                              : perform(t.users.confirmBlock(user.name), () =>
                                  setBlocked.mutateAsync({ userId: user.id, blocked: true }),
                                )
                          }
                        >
                          {user.isBlocked ? t.users.unblock : t.users.block}
                        </button>
                      )}
                      {canModerate && (
                        <button
                          type="button"
                          className={ACTION_CLASS}
                          onClick={() =>
                            perform(t.users.confirmSignOut(user.name), () =>
                              revokeSessions.mutateAsync(user.id),
                            )
                          }
                        >
                          {t.users.signOut}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="flex items-center justify-between gap-4 text-sm text-viratec-muted">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
            className={ACTION_CLASS}
          >
            {t.users.previous}
          </button>
          <span>{t.users.page(page, pages)}</span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((value) => value + 1)}
            className={ACTION_CLASS}
          >
            {t.users.next}
          </button>
        </nav>
      )}

      {editing && <AccessDialog user={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
