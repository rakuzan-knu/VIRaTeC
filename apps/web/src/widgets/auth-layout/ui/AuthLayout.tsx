import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#030914] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-[1240px] min-h-[760px] bg-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl">
        {/* Left Side Visual Banner */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-[#021329] via-[#052C42] to-[#085340] p-8 lg:p-12 flex flex-col justify-between overflow-hidden m-3 rounded-2xl">
          {/* Subtle background network grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_1px,_transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative z-10">
            <span className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
              VIRATEC GLOBAL NETWORK
            </span>
            <h1 className="mt-6 text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight">
              Connect your <br />
              ideas <br />
              <span className="text-[#52E880]">
                with the global <br />
                network.
              </span>
            </h1>
            <p className="mt-6 text-slate-300 text-sm leading-relaxed max-w-md">
              Join an international research and education community built at Taras Shevchenko
              National University of Kyiv.
            </p>
          </div>

          {/* Bottom Badge */}
          <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3 w-fit pr-6">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
              <span className="text-xs font-bold text-slate-900">VIRaTeC</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Secure academic community</p>
              <p className="text-[10px] text-slate-300">KNU · KYIV, UKRAINE</p>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between">
          <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col justify-center py-4">
            {children}
          </div>

          {/* Footer Links */}
          <footer className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
            <p>© 2025 VIRaTeC KNU</p>
            <div className="flex items-center gap-4">
              <Link to={ROUTES.TERMS} className="hover:text-slate-600 transition-colors">
                Terms of Service
              </Link>
              <span className="text-slate-300">|</span>
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
