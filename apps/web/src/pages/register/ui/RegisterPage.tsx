import { AuthLayout } from '@/widgets/auth-layout';
import { RegisterForm } from '@/features/register-by-email';
import { useDocumentTitle } from '@/shared/lib';

export function RegisterPage() {
  useDocumentTitle('Create account');

  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
