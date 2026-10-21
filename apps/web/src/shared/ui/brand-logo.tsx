import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { useCommonMessages } from '@/shared/i18n';
import globalNetworkLogo from '@/shared/assets/auth/logo-global-network.webp';

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  const common = useCommonMessages();

  return (
    <Link to={ROUTES.HOME} aria-label={common.homeAriaLabel} className={cn('block', className)}>
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
