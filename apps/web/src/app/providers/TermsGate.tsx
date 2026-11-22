import { TermsUpdateDialog } from '@/features/accept-terms';
import { useLogout } from '@/features/logout';
import { ROUTES } from '@/shared/config/routes';

export function TermsGate() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <TermsUpdateDialog isSigningOut={isPending} onSignOut={() => logout({ to: ROUTES.HOME })} />
  );
}
