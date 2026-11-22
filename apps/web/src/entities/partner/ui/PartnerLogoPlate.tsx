import { cn } from '@/shared/lib';

interface PartnerLogoPlateProps {
  logo: string;
  alt: string;
  className?: string;
}

export function PartnerLogoPlate({ logo, alt, className }: PartnerLogoPlateProps) {
  return (
    <span className={cn('flex items-center justify-center bg-white', className)}>
      <img src={logo} alt={alt} loading="lazy" className="max-h-full max-w-full object-contain" />
    </span>
  );
}
