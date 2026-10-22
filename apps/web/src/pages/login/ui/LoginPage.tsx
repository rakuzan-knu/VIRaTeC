import { AuthLayout } from '@/widgets/auth-layout';
import { LoginForm } from '@/features/login-by-email';
import { GoogleAuthButton } from '@/features/login-by-google';
import { TwoFactorChallenge } from '@/features/verify-two-factor';
import { useSessionStore } from '@/entities/session';
import { useSeo } from '@/shared/lib';
import { useCommonMessages } from '@/shared/i18n';

export function LoginPage() {
  const common = useCommonMessages();
  useSeo(common.logIn);
  const awaitingSecondFactor = useSessionStore((state) => state.awaitingSecondFactor);

  return (
    <AuthLayout>
      {awaitingSecondFactor ? (
        <TwoFactorChallenge />
      ) : (
        <LoginForm
          socialAuth={
            <GoogleAuthButton
              text="signin_with"
              className="h-[58px] lg:h-[clamp(44px,6.5svh,58px)]"
            />
          }
        />
      )}
    </AuthLayout>
  );
}
