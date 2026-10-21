import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import authBackground from '@/shared/assets/auth/sidebar.webp';

interface AuthLayoutProps {
  children: ReactNode;
  eyebrow?: string;
  title?: ReactNode;
  accent?: ReactNode;
  description?: string;
  badgeTitle?: string;
  badgeSubtitle?: string;
}

const DEFAULT_TITLE = (
  <>
    Connect your <br />
    ideas
  </>
);

const DEFAULT_ACCENT = (
  <>
    with the global <br />
    network.
  </>
);

export function AuthLayout({
  children,
  eyebrow = 'VIRaTeC Global Network',
  title = DEFAULT_TITLE,
  accent = DEFAULT_ACCENT,
  description = 'Join an international research and education community built at Taras Shevchenko National University of Kyiv.',
  badgeTitle = 'Secure academic community',
  badgeSubtitle = 'KNU · KYIV, UKRAINE',
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen w-full bg-auth-navy bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-auth-progress/40 via-auth-navy to-auth-navy p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-[1240px] lg:min-h-[760px] bg-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl p-2 sm:p-8">
        {/* Left Side Visual Banner */}
        <div className="hidden lg:col-span-6 relative bg-auth-banner p-14 lg:flex flex-col justify-between overflow-hidden rounded-2xl">
          {/* Background Image from Figma */}
          <img
            src={authBackground}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
          />

          {/* Темний градієнтний оверлей як у Figma */}
          <div className="absolute inset-0 bg-gradient-to-b from-auth-overlay/70 via-auth-overlay/30 to-auth-overlay/80 pointer-events-none z-0" />

          <div className="relative z-10">
            <span className="font-auth text-[11px] font-medium leading-[16.5px] tracking-[1.76px] text-auth-accent uppercase">
              {eyebrow}
            </span>
            <h1 className="font-auth mt-6 text-[52px] lg:text-[62px] font-medium text-white leading-[65px] tracking-[-0.05em]">
              {title} <br />
              <span className="text-auth-accent">{accent}</span>
            </h1>
            <p className="mt-6 text-[17px] text-slate-300 leading-relaxed max-w-md">
              {description}
            </p>
          </div>

          {/* Bottom Badge */}
          <div className="relative z-10 mt-12 bg-auth-overlay/40 backdrop-blur-md rounded-[14px] p-[10px] pr-[18px] border border-white/20 flex items-center gap-[14px] w-fit shadow-lg">
            {/* Маленька біла картка з експортованою іконкою */}
            <div className="w-12 h-12 rounded-[10px] bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img
                src="/community-logo.svg"
                alt="VIRaTeC"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <p className="text-xs font-normal text-white tracking-wide">{badgeTitle}</p>
              <p className="text-[10px] text-slate-300 tracking-wider mt-0.5">{badgeSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div className="w-full max-w-[580px] mx-auto flex-1 flex flex-col justify-center py-4">
            <h1 className="sr-only lg:hidden">
              {title} {accent}
            </h1>
            {children}
          </div>

          {/* Footer Links (опущені вниз завдяки mt-auto / mt-12) */}
          <footer className="mt-16 pt-8 border-t border-auth-border flex flex-col sm:flex-row justify-between items-center text-xs text-auth-muted gap-2">
            <p>© 2026 VIRaTeC KNU</p>
            <div className="flex items-center gap-4">
              <Link to={ROUTES.TERMS} className="hover:text-auth-navy transition-colors">
                Terms of Service
              </Link>
              <span aria-hidden="true" className="text-auth-border">
                |
              </span>
              <Link to={ROUTES.PRIVACY} className="hover:text-auth-navy transition-colors">
                Privacy Policy
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
