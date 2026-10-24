import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { LogoMark } from '@/shared/ui/logo';
import { AuthBannerArt } from './AuthBannerArt';

interface AuthLayoutProps {
  children: ReactNode;
  eyebrow?: string;
  title?: ReactNode;
  accent?: ReactNode;
  description?: string;
  badgeTitle?: string;
  badgeSubtitle?: string;
}

const AUTH_LAYOUT_MESSAGES = defineMessages({
  en: {
    eyebrow: 'VIRaTeC Global Network',
    title: ['Connect your', 'ideas'],
    accent: ['with the global', 'network.'],
    description:
      'Join an international research and education community built at Taras Shevchenko National University of Kyiv.',
    badgeTitle: 'Secure academic community',
    badgeSubtitle: 'KNU · KYIV, UKRAINE',
    copyright: '© 2026 VIRaTeC KNU',
  },
  uk: {
    eyebrow: 'Глобальна мережа VIRaTeC',
    title: ['Об’єднуйте свої', 'ідеї'],
    accent: ['з глобальною', 'мережею.'],
    description:
      'Долучайтеся до міжнародної дослідницької та освітньої спільноти, створеної в Київському національному університеті імені Тараса Шевченка.',
    badgeTitle: 'Захищена академічна спільнота',
    badgeSubtitle: 'КНУ · КИЇВ, УКРАЇНА',
    copyright: '© 2026 VIRaTeC КНУ',
  },
});

function TwoLines({ lines }: { lines: string[] }) {
  return lines.map((line, index) => (
    <Fragment key={line}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ));
}

export function AuthLayout({
  children,
  eyebrow,
  title,
  accent,
  description,
  badgeTitle,
  badgeSubtitle,
}: AuthLayoutProps) {
  const t = useLocalized(AUTH_LAYOUT_MESSAGES);
  const common = useCommonMessages();
  const resolvedTitle = title ?? <TwoLines lines={t.title} />;
  const resolvedAccent = accent ?? <TwoLines lines={t.accent} />;

  return (
    <main className="min-h-svh w-full bg-auth-navy bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-auth-progress/40 via-auth-navy to-auth-navy p-4 sm:p-6 lg:h-svh lg:p-[clamp(16px,3svh,32px)] flex items-center justify-center">
      <div className="w-full lg:h-full bg-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl p-2 sm:p-8 lg:p-[clamp(12px,2.5svh,32px)]">
        {/* Left Side Visual Banner */}
        <div className="hidden lg:col-span-6 relative bg-auth-banner p-14 lg:p-[clamp(32px,6svh,56px)] lg:flex flex-col justify-between overflow-hidden rounded-2xl">
          <AuthBannerArt />

          <div className="relative z-10">
            <span className="font-auth text-[11px] font-medium leading-[16.5px] tracking-[1.76px] text-auth-accent uppercase">
              {eyebrow ?? t.eyebrow}
            </span>
            <h1 className="font-auth mt-6 text-[52px] lg:text-[clamp(40px,7svh,62px)] font-medium text-white leading-[65px] lg:leading-[1.05] tracking-[-0.05em]">
              {resolvedTitle} <br />
              <span className="text-auth-accent">{resolvedAccent}</span>
            </h1>
            <p className="mt-6 text-[17px] text-slate-300 leading-relaxed max-w-md">
              {description ?? t.description}
            </p>
          </div>

          {/* Bottom Badge */}
          <div className="relative z-10 mt-12 bg-auth-overlay rounded-[14px] p-[10px] pr-[18px] border border-white/20 flex items-center gap-[14px] w-fit shadow-lg">
            <div className="w-12 h-12 rounded-[10px] bg-auth-banner border border-white/10 flex items-center justify-center p-1.5 shrink-0">
              <LogoMark className="size-full" />
            </div>

            <div>
              <p className="text-xs font-normal text-white tracking-wide">
                {badgeTitle ?? t.badgeTitle}
              </p>
              <p className="text-[10px] text-slate-300 tracking-wider mt-0.5">
                {badgeSubtitle ?? t.badgeSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:px-10 lg:py-[clamp(8px,2svh,40px)] lg:min-h-0 lg:overflow-y-auto flex flex-col justify-between">
          <div className="w-full max-w-[580px] mx-auto flex-1 flex flex-col justify-center py-4 lg:py-0">
            <h1 className="sr-only lg:hidden">
              {resolvedTitle} {resolvedAccent}
            </h1>
            {children}
          </div>

          {/* Footer Links (опущені вниз завдяки mt-auto / mt-12) */}
          <footer className="mt-16 pt-8 lg:mt-[clamp(12px,2svh,64px)] lg:pt-[clamp(10px,1.8svh,32px)] border-t border-auth-border flex flex-col sm:flex-row justify-between items-center text-xs text-auth-muted gap-2">
            <p>{t.copyright}</p>
            <div className="flex items-center gap-4">
              <Link to={ROUTES.TERMS} className="hover:text-auth-navy transition-colors">
                {common.termsOfService}
              </Link>
              <span aria-hidden="true" className="text-auth-border">
                |
              </span>
              <Link to={ROUTES.PRIVACY} className="hover:text-auth-navy transition-colors">
                {common.privacyPolicy}
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
