import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import sidebarImage from '@/shared/assets/auth/sidebar.webp';
import badgeLogo from '@/shared/assets/auth/logo-badge.webp';

interface AuthLayoutProps {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  accent?: string;
  description?: string;
  badgeTitle?: string;
  badgeSubtitle?: string;
}

export function AuthLayout({
  children,
  eyebrow = 'VIRaTeC Global Network',
  title = 'Connect your ideas',
  accent = 'with the global network.',
  description = 'Join an international research and education community built at Taras Shevchenko National University of Kyiv.',
  badgeTitle = 'Secure academic community',
  badgeSubtitle = 'KNU · Kyiv, Ukraine',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#082455] bg-[radial-gradient(circle_at_8%_5%,rgba(25,118,191,0.34),transparent_30%)] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-[1365px] min-h-[760px] bg-white rounded-3xl lg:rounded-[34px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-[0px_32px_90px_0px_rgba(1,14,34,0.36)]">
        <div className="lg:col-span-5 relative p-8 lg:p-[62px] flex flex-col justify-between overflow-hidden m-3 lg:m-10 lg:mr-0 rounded-2xl lg:rounded-[26px] min-h-[420px]">
          <img
            src={sidebarImage}
            alt=""
            className="absolute inset-0 size-full object-cover pointer-events-none"
          />
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(4,26,58,0.72)_0%,rgba(4,26,58,0.1)_55%,rgba(4,26,58,0.68)_100%),linear-gradient(90deg,rgba(4,26,58,0.36)_0%,rgba(4,26,58,0)_100%)]" />

          <div className="relative z-10">
            <span className="text-[11px] font-medium tracking-[1.76px] text-[#77c447] uppercase">
              {eyebrow}
            </span>
            <h1 className="mt-5 text-4xl lg:text-[58px] font-medium text-white leading-[1.03] tracking-[-0.05em]">
              {title} <span className="text-[#77c447]">{accent}</span>
            </h1>
            <p className="mt-7 text-white/74 text-[15px] lg:text-[17px] leading-relaxed max-w-[415px]">
              {description}
            </p>
          </div>

          <div className="relative z-10 mt-12 bg-[rgba(4,26,58,0.42)] backdrop-blur-[14px] rounded-[14px] p-2.5 pr-[18px] border border-white/18 flex items-center gap-3.5 w-fit">
            <img
              src={badgeLogo}
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-[9px] object-contain shrink-0"
            />
            <div>
              <p className="text-xs font-medium text-white">{badgeTitle}</p>
              <p className="mt-1 text-[10px] tracking-[0.8px] text-white/58 uppercase">
                {badgeSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-10 lg:px-20 lg:py-5 flex flex-col justify-between">
          <div className="w-full max-w-[449px] mx-auto flex-1 flex flex-col justify-center py-4">
            {children}
          </div>

          <footer className="w-full max-w-[449px] mx-auto pt-5 border-t border-[#d7e0e8] flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#8b97a6] gap-2">
            <p>© 2025 VIRaTeC KNU</p>
            <div className="flex items-center gap-4">
              <Link to={ROUTES.TERMS} className="hover:text-slate-600 transition-colors">
                Terms of Service
              </Link>
              <span className="text-[#d7e0e8]">|</span>
              <Link to={ROUTES.PRIVACY} className="hover:text-slate-600 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
