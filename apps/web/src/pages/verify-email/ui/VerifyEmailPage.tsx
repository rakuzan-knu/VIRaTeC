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
  de: {
    documentTitle: 'E-Mail bestätigen',
    title: 'Bestätigen Sie Ihre E-Mail.',
    accent: 'Machen Sie mit.',
    description:
      'Die Bestätigung Ihrer Adresse schützt Ihre Identität in der internationalen Forschungs- und Bildungsgemeinschaft der Taras-Schewtschenko-Nationaluniversität Kyjiw.',
    badgeTitle: 'Verifizierte akademische Gemeinschaft',
    badgeSubtitle: 'VIRATEC · KNU IDENTITY',
  },
  fr: {
    documentTitle: 'Confirmer l’e-mail',
    title: 'Confirmez votre e-mail.',
    accent: 'Rejoignez la conversation.',
    description:
      'Confirmer votre adresse protège votre identité au sein de la communauté internationale de recherche et d’enseignement de l’Université nationale Taras Chevtchenko de Kyiv.',
    badgeTitle: 'Communauté académique vérifiée',
    badgeSubtitle: 'VIRATEC · KNU IDENTITY',
  },
  ar: {
    documentTitle: 'تأكيد البريد الإلكتروني',
    title: 'أكّد بريدك الإلكتروني.',
    accent: 'انضم إلى الحوار.',
    description:
      'يحمي تأكيد عنوانك هويتك في مجتمع البحث والتعليم الدولي في جامعة كييف الوطنية تاراس شيفتشينكو.',
    badgeTitle: 'مجتمع أكاديمي موثّق',
    badgeSubtitle: 'VIRATEC · KNU IDENTITY',
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
