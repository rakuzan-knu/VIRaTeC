import React from 'react';
import { HeroBanner } from '@/widgets/hero-banner';
import { GoogleAuthButton } from '@/features/auth-by-google';
import { LoginForm } from '@/features/auth-by-email';

export const LoginPage: React.FC = () => {
  return (
    <div className="w-full h-screen bg-[#082455] relative overflow-hidden font-['Instrument_Sans',sans-serif] flex items-center justify-center p-4 sm:p-6">
      {/* Radial Background Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(25, 118, 191, 0.34) 0%, rgba(25, 118, 191, 0) 18%)',
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-[1365px] h-[min(944px,calc(100vh-48px))] bg-[#F6F8FA] rounded-[34px] border border-white/20 shadow-[0_32px_90px_rgba(1,14,34,0.36)] relative overflow-hidden flex items-stretch">
        {/* Left Hero Block */}
        <HeroBanner />

        {/* Right Form Section — контрольовані відступи без зрізання кутів */}
        <div className="flex-1 bg-transparent relative flex flex-col items-center justify-between pt-6 lg:pt-8 pb-8 lg:pb-10 px-6 lg:px-12 xl:px-[151px]">
          {/* Центрований контейнер форми (без my-auto) */}
          <div className="w-full max-w-[449px] flex flex-col items-center justify-center flex-1 my-2">
            {/* Header Logo — оптимізована висота */}
            <img
              src="https://firebasestorage.googleapis.com/v0/b/codeless-app.appspot.com/o/projects%2F0SdWTi9_BSMxQsBO8Gfv%2Ff2630a918c2655631afa708c0c08dcc06ee45eedImage%20(VIRaTeC%20Global%20Network).png?alt=media&token=5136761b-bec4-43f8-aea0-fbc05831a2f4"
              alt="VIRaTeC Logo"
              className="w-[220px] lg:w-[250px] h-[65px] lg:h-[80px] object-contain mb-2 lg:mb-3 mix-blend-multiply"
            />

            {/* Title & Subtitle */}
            <div className="w-full text-left mb-3 lg:mb-5">
              <h2 className="text-[28px] lg:text-[38px] xl:text-[44px] font-medium text-[#041A3A] tracking-[-2px] leading-none mb-1.5">
                Welcome back
              </h2>
              <p className="text-[13px] lg:text-[14px] text-[#677588] leading-[1.4]">
                Sign in to continue to the VIRaTeC research community.
              </p>
            </div>

            {/* Google Feature */}
            <GoogleAuthButton />

            {/* OR Divider */}
            <div className="w-full flex items-center justify-between mb-3 lg:mb-5">
              <div className="flex-1 h-[1px] bg-[#D7E0E8]" />
              <span className="px-3 text-[10px] font-medium text-[#8B97A6] tracking-[1px]">OR</span>
              <div className="flex-1 h-[1px] bg-[#D7E0E8]" />
            </div>

            {/* Email Form Feature */}
            <LoginForm />
          </div>

          {/* Footer — надійно піднятий над закругленням 34px */}
          <div className="w-full max-w-[449px] flex items-center justify-between text-[10px] text-[#8B97A6] border-t border-[#D7E0E8] pt-3 shrink-0">
            <span>© 2025 VIRaTeC KNU</span>
            <div className="flex items-center gap-3">
              <a href="#privacy" className="hover:underline">
                Privacy Policy
              </a>
              <span className="w-[1px] h-3 bg-[#D7E0E8]" />
              <a href="#terms" className="hover:underline">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
