import { AuthLayout } from '@/widgets/auth-layout';
import { LoginForm } from '@/features/login-by-email';
import { GoogleAuthButton } from '@/features/login-by-google';
import { useDocumentTitle } from '@/shared/lib';
import { useCommonMessages } from '@/shared/i18n';

export function LoginPage() {
  const common = useCommonMessages();
  useDocumentTitle(common.logIn);

  return (
    <AuthLayout>
      <LoginForm
        socialAuth={
          <GoogleAuthButton
            text="signin_with"
            className="h-[58px] lg:h-[clamp(44px,6.5svh,58px)]"
          />
        }
      />
    </AuthLayout>
  );
}
