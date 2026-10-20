import { AuthLayout } from '@/widgets/auth-layout';
import { LoginForm } from '@/features/login-by-email';

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
