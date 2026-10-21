import { AuthLayout } from '@/widgets/auth-layout';
import { ResetPasswordFlow } from '@/features/reset-password';
import { useDocumentTitle } from '@/shared/lib';
import { defineMessages, useLocalized } from '@/shared/i18n';

const FORGOT_PASSWORD_MESSAGES = defineMessages({
  en: {
    documentTitle: 'Reset password',
    title: 'Recover access.',
    accent: 'Keep your research moving.',
    description:
      'Secure account recovery for the international research and education community at Taras Shevchenko National University of Kyiv.',
    badgeTitle: 'Protected account recovery',
    badgeSubtitle: 'VIRATEC · KNU IDENTITY',
  },
  uk: {
    documentTitle: 'Відновлення пароля',
    title: 'Відновіть доступ.',
    accent: 'Продовжуйте свої дослідження.',
    description:
      'Захищене відновлення облікового запису для міжнародної дослідницької та освітньої спільноти Київського національного університету імені Тараса Шевченка.',
    badgeTitle: 'Захищене відновлення доступу',
    badgeSubtitle: 'VIRATEC · ІДЕНТИФІКАЦІЯ КНУ',
  },
});

export function ForgotPasswordPage() {
  const t = useLocalized(FORGOT_PASSWORD_MESSAGES);
  useDocumentTitle(t.documentTitle);

  return (
    <AuthLayout
      title={t.title}
      accent={t.accent}
      description={t.description}
      badgeTitle={t.badgeTitle}
      badgeSubtitle={t.badgeSubtitle}
    >
      <ResetPasswordFlow />
    </AuthLayout>
  );
}
