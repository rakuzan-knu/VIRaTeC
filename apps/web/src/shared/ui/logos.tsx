export function ViratecRoundLogo({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" stroke="url(#roundGrad)" strokeWidth="4" />
      <ellipse
        cx="50"
        cy="50"
        rx="42"
        ry="18"
        stroke="#1d4ed8"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.4"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="20"
        ry="42"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.4"
      />
      <line x1="8" y1="50" x2="92" y2="50" stroke="#0284c7" strokeWidth="1.5" opacity="0.4" />
      <path d="M 28 32 L 48 72 L 56 72 L 38 32 Z" fill="#002868" />
      <path d="M 44 54 L 68 28 L 76 34 L 52 68 Z" fill="#16a34a" />
      <defs>
        <linearGradient id="roundGrad" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#002868" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ViratecFullLogo({ className = 'h-12' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <ViratecRoundLogo className="h-10 w-10 shrink-0" />
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline">
          <span className="text-xl font-extrabold tracking-tight text-[#002868]">VIR</span>
          <span className="text-xl font-extrabold tracking-tight text-[#0284c7]">a</span>
          <span className="text-xl font-extrabold tracking-tight text-[#16a34a]">TeC</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-semibold text-[#002868]">
          <span className="h-[1px] w-2 bg-[#002868]" />
          <span className="tracking-wider uppercase">Global network</span>
          <span className="h-[1px] w-2 bg-[#16a34a]" />
        </div>
      </div>
    </div>
  );
}
