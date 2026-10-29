import { AuthLayout } from '@/widgets/auth-layout';
import { VerifyEmailStatus } from '@/features/verify-email';
import { defineMessages, useLocalized } from '@/shared/i18n';
import { useSeo } from '@/shared/lib';

const VERIFY_EMAIL_PAGE_MESSAGES = defineMessages({
  en: {
    documentTitle: 'Confirm email',
    title: 'Confirm your email.',
    accent: 'Join the conversation.',
    description:
      'Confirming your address protects your identity in the international research and education community at Taras Shevchenko National University of Kyiv.',
    badgeTitle: 'Verified academic community',
    badgeSubtitle: 'VIRATEC · KNU IDENTITY',
  },
  uk: {
    documentTitle: 'Підтвердження пошти',
    title: 'Підтвердьте пошту.',
    accent: 'Долучайтеся до спільноти.',
    description:
      'Підтвердження адреси захищає вашу ідентичність у міжнародній дослідницькій та освітній спільноті Київського національного університету імені Тараса Шевченка.',
    badgeTitle: 'Перевірена академічна спільнота',
    badgeSubtitle: 'VIRATEC · ІДЕНТИФІКАЦІЯ КНУ',
  },
});

export function VerifyEmailPage() {
  const t = useLocalized(VERIFY_EMAIL_PAGE_MESSAGES);
  useSeo(t.documentTitle, { noindex: true });

  return (
    <AuthLayout
      title={t.title}
      accent={t.accent}
      description={t.description}
      badgeTitle={t.badgeTitle}
      badgeSubtitle={t.badgeSubtitle}
    >
      <VerifyEmailStatus />
    </AuthLayout>
  );
}
