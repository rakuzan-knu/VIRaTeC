import { AuthLayout } from '@/widgets/auth-layout';
import { ResetPasswordFlow } from '@/features/reset-password';
import { useDocumentTitle } from '@/shared/lib';

export function ForgotPasswordPage() {
  useDocumentTitle('Reset password');

  return (
    <AuthLayout
      title="Recover access."
      accent="Keep your research moving."
      description="Secure account recovery for the international research and education community at Taras Shevchenko National University of Kyiv."
      badgeTitle="Protected account recovery"
      badgeSubtitle="VIRATEC · KNU IDENTITY"
    >
      <ResetPasswordFlow />
    </AuthLayout>
  );
}
