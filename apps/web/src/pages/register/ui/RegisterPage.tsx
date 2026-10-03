import { AuthLayout } from '@/widgets/auth-layout';
import { RegisterForm } from '@/features/register-by-email';

export function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
