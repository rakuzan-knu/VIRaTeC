import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BookOpen,
  CalendarDays,
  FolderKanban,
  MessagesSquare,
  ShieldCheck,
  UserX,
  Users,
} from 'lucide-react';
import { INTL_LOCALE, useLocale } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { useAdminMessages } from '../model/messages';
import { useAdminMetrics } from '../model/queries';
import { ADMIN_CARD_CLASS, AdminSectionHeader } from './AdminLayout';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  details?: string[];
}

function MetricCard({ icon: Icon, label, value, details = [] }: MetricCardProps) {
  return (
    <li className={cn(ADMIN_CARD_CLASS, 'flex flex-col gap-3 lg:p-6')}>
      <span className="flex items-center gap-2 text-sm text-viratec-muted">
        <Icon aria-hidden="true" className="size-4 text-viratec-accent" />
        {label}
      </span>
      <span className="font-display text-[40px] leading-none font-medium tracking-[-0.03em] text-white tabular-nums">
        {value}
      </span>
      {details.map((detail) => (
        <span key={detail} className="text-sm text-viratec-subtle">
          {detail}
        </span>
      ))}
    </li>
  );
}

interface BreakdownProps {
  title: string;
  rows: { label: string; value: number }[];
}

function Breakdown({ title, rows }: BreakdownProps) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <section className={cn(ADMIN_CARD_CLASS, 'flex flex-col gap-4')}>
      <h3 className="font-display text-xl font-medium text-white">{title}</h3>
      <dl className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1.5">
            <div className="flex justify-between gap-4 text-sm">
              <dt className="text-viratec-soft">{row.label}</dt>
              <dd className="text-white tabular-nums">{row.value}</dd>
            </div>
            <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-viratec-lime"
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function AdminDashboardPage() {
  const t = useAdminMessages();
  const locale = useLocale();
  const { data, isPending, isError } = useAdminMetrics();
  const d = t.dashboard;

  const updatedAt = data
    ? new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeStyle: 'short' }).format(
        new Date(data.generatedAt),
      )
    : null;

  return (
    <>
      <AdminSectionHeader
        title={d.title}
        subtitle={d.subtitle}
        aside={updatedAt && <p className="text-sm text-viratec-subtle">{d.updated(updatedAt)}</p>}
      />
      {isPending && (
        <p role="status" className="text-viratec-muted">
          {t.gate.loading}
        </p>
      )}
      {isError && (
        <p role="alert" className="text-state-error">
          {t.gate.error}
        </p>
      )}
      {data && (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Users}
              label={d.users}
              value={data.users.total}
              details={[d.newWeek(data.users.last7Days), d.newMonth(data.users.last30Days)]}
            />
            <MetricCard
              icon={ShieldCheck}
              label={d.admins}
              value={data.staff.admins}
              details={[d.adminsTwoFactor(data.staff.withTwoFactor, data.staff.admins)]}
            />
            <MetricCard icon={FolderKanban} label={d.projects} value={data.projects.total} />
            <MetricCard
              icon={CalendarDays}
              label={d.events}
              value={data.events.total}
              details={[d.upcoming(data.events.upcoming), d.past(data.events.past)]}
            />
            <MetricCard icon={BookOpen} label={d.papers} value={data.research.papers} />
            <MetricCard icon={MessagesSquare} label={d.posts} value={data.community.posts} />
            <MetricCard icon={Activity} label={d.sessions} value={data.sessions.active} />
            <MetricCard icon={UserX} label={d.blocked} value={data.users.blocked} />
          </ul>
          <div className="grid gap-4 xl:grid-cols-3">
            <Breakdown
              title={d.usersByRole}
              rows={Object.entries(data.users.byRole).map(([role, value]) => ({
                label: t.roles[role as keyof typeof t.roles],
                value,
              }))}
            />
            <Breakdown
              title={d.projectsByStatus}
              rows={Object.entries(data.projects.byStatus).map(([status, value]) => ({
                label: t.projectStatus[status as keyof typeof t.projectStatus],
                value,
              }))}
            />
            <Breakdown
              title={d.eventsByType}
              rows={Object.entries(data.events.byType).map(([type, value]) => ({
                label: t.eventTypes[type as keyof typeof t.eventTypes],
                value,
              }))}
            />
          </div>
        </>
      )}
    </>
  );
}
