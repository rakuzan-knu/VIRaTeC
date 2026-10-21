import { AuthLayout } from '@/widgets/auth-layout';
import { RegisterForm } from '@/features/register-by-email';
import { GoogleAuthButton } from '@/features/login-by-google';
import { useSeo } from '@/shared/lib';
import { defineMessages, useLocalized } from '@/shared/i18n';

const REGISTER_PAGE_MESSAGES = defineMessages({
  en: { documentTitle: 'Create account' },
  uk: { documentTitle: 'Реєстрація' },
});

export function RegisterPage() {
  const t = useLocalized(REGISTER_PAGE_MESSAGES);
  useSeo(t.documentTitle);

  return (
    <AuthLayout>
      <RegisterForm
        socialAuth={
          <GoogleAuthButton text="signup_with" className="h-[58px] lg:h-[clamp(42px,6svh,58px)]" />
        }
      />
    </AuthLayout>
  );
}
