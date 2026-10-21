import { AuthLayout } from '@/widgets/auth-layout';
import { LoginForm } from '@/features/login-by-email';
import { useDocumentTitle } from '@/shared/lib';

export function LoginPage() {
  useDocumentTitle('Log in');

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
