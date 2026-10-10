import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#082455] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1976BF]/40 via-[#082455] to-[#082455] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-[1240px] min-h-[760px] bg-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl p-8">
        {/* Left Side Visual Banner */}
        <div className="lg:col-span-6 relative bg-[#021329] p-14 flex flex-col justify-between overflow-hidden rounded-2xl">
          {/* Background Image from Figma */}
          <img
            src="/auth-bg.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
          />

          {/* Темний градієнтний оверлей як у Figma */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#041A3A]/70 via-[#041A3A]/30 to-[#041A3A]/80 pointer-events-none z-0" />

          <div className="relative z-10">
            <span
              className="text-[11px] font-medium leading-[16.5px] tracking-[1.76px] text-[#77C447] uppercase"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              VIRaTeC Global Network
            </span>
            <h1
              className="mt-6 text-[52px] lg:text-[62px] font-medium text-white leading-[65px] tracking-[-0.05em]"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              Connect your <br />
              ideas <br />
              <span className="text-[#77C447]">
                with the global <br />
                network.
              </span>
            </h1>
            <p className="mt-6 text-[17px] text-slate-300 leading-relaxed max-w-md">
              Join an international research and education community built at Taras Shevchenko
              National University of Kyiv.
            </p>
          </div>

          {/* Bottom Badge */}
          <div className="relative z-10 mt-12 bg-[#041A3A]/40 backdrop-blur-md rounded-[14px] p-[10px] pr-[18px] border border-white/20 flex items-center gap-[14px] w-fit shadow-lg">
            {/* Маленька біла картка з експортованою іконкою */}
            <div className="w-12 h-12 rounded-[10px] bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img
                src="/community-logo.svg"
                alt="VIRaTeC"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <p className="text-xs font-normal text-white tracking-wide">
                Secure academic community
              </p>
              <p className="text-[10px] text-slate-300 tracking-wider mt-0.5">
                KNU · KYIV, UKRAINE
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div className="w-full max-w-[580px] mx-auto flex-1 flex flex-col justify-center py-4">
            {children}
          </div>

          {/* Footer Links (опущені вниз завдяки mt-auto / mt-12) */}
          <footer className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
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
