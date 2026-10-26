import type { ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  PencilRuler,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AdminPermission } from '@viratec/contracts';
import { getApiErrorCode } from '@/shared/api/apiClient';
import { ROUTES, SITE_EDITOR_PATH, buildAccountPath } from '@/shared/config/routes';
import { cn, useSeo } from '@/shared/lib';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { CodePrompt, useStepUp } from '@/features/manage-two-factor';
import { PageIntro } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import { useAdminMessages, type AdminMessages } from '../model/messages';
import { adminKeys, useAdminCapabilities } from '../model/queries';
import { StepUpProvider } from './StepUpProvider';

export const ADMIN_CARD_CLASS =
  'rounded-[28px] border border-white/10 bg-viratec-deep/80 p-6 lg:p-8';

const NAV_ITEMS = [
  {
    to: ROUTES.ADMIN,
    key: 'dashboard',
    icon: LayoutDashboard,
    permission: AdminPermission.DASHBOARD_VIEW,
  },
  { to: ROUTES.ADMIN_USERS, key: 'users', icon: Users, permission: AdminPermission.USERS_VIEW },
  {
    to: ROUTES.ADMIN_AUDIT,
    key: 'audit',
    icon: ScrollText,
    permission: AdminPermission.AUDIT_VIEW,
  },
  {
    to: SITE_EDITOR_PATH,
    key: 'siteEditor',
    icon: PencilRuler,
    permission: AdminPermission.CONTENT_VIEW,
  },
] as const;

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
    <section className={cn(ADMIN_CARD_CLASS, 'mx-auto flex max-w-[560px] flex-col gap-5')}>
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white/6">
        <Icon aria-hidden="true" className="size-6 text-viratec-accent" />
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-medium text-white">{title}</h2>
        <p className="text-[15px] leading-6 text-viratec-muted">{text}</p>
      </div>
      {children}
    </section>
  );
}

function Reverify({ t }: { t: AdminMessages }) {
  const queryClient = useQueryClient();
  const stepUp = useStepUp();
  return (
    <GateCard icon={ShieldCheck} title={t.gate.reverifyTitle} text={t.gate.reverifyText}>
      <CodePrompt
        submitLabel={t.gate.reverifyAction}
        isPending={stepUp.isPending}
        error={stepUp.error}
        onSubmit={(code) =>
          stepUp.mutate(code, {
            onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
          })
        }
      />
    </GateCard>
  );
}

function AdminGate({ t }: { t: AdminMessages }) {
  const { data, error, isPending } = useAdminCapabilities();

  if (isPending) {
    return (
      <p role="status" className="text-center text-viratec-muted">
        {t.gate.loading}
      </p>
    );
  }

  const code = getApiErrorCode(error);
  if (code === 'MFA_SETUP_REQUIRED') {
    return (
      <GateCard icon={ShieldAlert} title={t.gate.mfaSetupTitle} text={t.gate.mfaSetupText}>
        <Link
          to={buildAccountPath('security')}
          className={linkButtonClassName({ size: 'md', className: 'self-start' })}
        >
          {t.gate.mfaSetupAction}
        </Link>
      </GateCard>
    );
  }
  if (code === 'MFA_REVERIFY_REQUIRED') return <Reverify t={t} />;
  if (code === 'ADMIN_ACCESS_REQUIRED') {
    return <GateCard icon={ShieldAlert} title={t.gate.noAccess} text={t.gate.noAccessHint} />;
  }
  if (error || !data) {
    return <GateCard icon={ShieldAlert} title={t.panel} text={t.gate.error} />;
  }

  const items = NAV_ITEMS.filter((item) => data.permissions.includes(item.permission));

  return (
    <StepUpProvider>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <nav aria-label={t.nav.label} className="lg:sticky lg:top-28 lg:w-[260px] lg:shrink-0">
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {items.map(({ to, key, icon: Icon }) => (
              <li key={key} className="shrink-0">
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-[15px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime lg:rounded-[14px] lg:py-3',
                      isActive
                        ? 'bg-white text-viratec-ink'
                        : 'border border-white/14 bg-white/4 text-white hover:bg-white/10 lg:border-transparent lg:bg-transparent',
                    )
                  }
                >
                  <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                  {t.nav[key]}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Outlet context={data} />
        </div>
      </div>
    </StepUpProvider>
  );
}

export function AdminLayout() {
  const t = useAdminMessages();
  useSeo(t.seoTitle, { noindex: true });

  return (
    <PageLayout
      footer={<SiteFooter />}
      intro={
        <PageIntro
          header={<SiteHeader />}
          breadcrumb={[{ label: 'VIRaTeC', to: ROUTES.HOME }, t.panel]}
          title={t.panel}
          description={t.description}
          className="lg:pb-12"
        />
      }
    >
      <div className="mx-auto max-w-[1440px] px-5 pb-[72px] lg:px-[85px] lg:pb-[120px]">
        <AdminGate t={t} />
      </div>
    </PageLayout>
  );
}

export function AdminSectionHeader({
  title,
  subtitle,
  aside,
}: {
  title: string;
  subtitle: string;
  aside?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-[30px] leading-9 font-medium tracking-[-0.025em] text-white lg:text-[40px] lg:leading-[46px]">
          {title}
        </h2>
        <p className="text-[15px] leading-6 text-viratec-muted lg:text-base">{subtitle}</p>
      </div>
      {aside}
    </header>
  );
}
