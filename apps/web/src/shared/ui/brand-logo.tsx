import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import globalNetworkLogo from '@/shared/assets/auth/logo-global-network.webp';

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <Link to={ROUTES.HOME} aria-label="VIRaTeC home" className={cn('block', className)}>
      <img
        src={globalNetworkLogo}
        alt="VIRaTeC Global Network"
        width={483}
        height={300}
        className="size-full object-contain"
      />
    </Link>
  );
}
