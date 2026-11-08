import { AuthLayout } from '@/widgets/auth-layout';
import { ResetPasswordFlow } from '@/features/reset-password';
import { useSeo } from '@/shared/lib';
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
  de: {
    documentTitle: 'Passwort zurücksetzen',
    title: 'Zugang wiederherstellen.',
    accent: 'Damit Ihre Forschung weiterläuft.',
    description:
      'Sichere Kontowiederherstellung für die internationale Forschungs- und Bildungsgemeinschaft der Taras-Schewtschenko-Nationaluniversität Kyjiw.',
    badgeTitle: 'Geschützte Kontowiederherstellung',
    badgeSubtitle: 'VIRATEC · KNU IDENTITY',
  },
  fr: {
    documentTitle: 'Réinitialiser le mot de passe',
    title: 'Récupérez votre accès.',
    accent: 'Poursuivez vos recherches.',
    description:
      'Récupération sécurisée du compte pour la communauté internationale de recherche et d’enseignement de l’Université nationale Taras Chevtchenko de Kyiv.',
    badgeTitle: 'Récupération de compte protégée',
    badgeSubtitle: 'VIRATEC · KNU IDENTITY',
  },
  ar: {
    documentTitle: 'إعادة تعيين كلمة المرور',
    title: 'استعد وصولك.',
    accent: 'واصل أبحاثك.',
    description:
      'استعادة آمنة للحساب لمجتمع البحث والتعليم الدولي في جامعة كييف الوطنية تاراس شيفتشينكو.',
    badgeTitle: 'استعادة محمية للحساب',
    badgeSubtitle: 'VIRATEC · KNU IDENTITY',
  },
});

export function ForgotPasswordPage() {
  const t = useLocalized(FORGOT_PASSWORD_MESSAGES);
  useSeo(t.documentTitle);

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
