import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { useCommonMessages } from '@/shared/i18n';
import { Logo } from '@/shared/ui/logo';

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  const common = useCommonMessages();

  return (
    <Link to={ROUTES.HOME} aria-label={common.homeAriaLabel} className={cn('block', className)}>
      <Logo tone="dark" className="size-full" />
    </Link>
  );
}
