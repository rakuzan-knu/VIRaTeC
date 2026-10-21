import { defineMessages, useLocalized } from '@/shared/i18n';
import type { PasswordRuleId, ResetPasswordSchemaMessages } from './schema';

interface ResetPasswordMessages {
  accountRecovery: string;
  stepOf: (step: number, total: number) => string;
  progressLabel: string;
  needHelp: string;
  contactSupport: string;
  backToLogin: string;
  back: string;
  request: {
    title: string;
    description: string;
    submit: string;
    unavailableTitle: string;
    unavailablePrefix: string;
    secureTitle: string;
    secureDescription: string;
  };
  verify: {
    title: string;
    descriptionPrefix: string;
    descriptionSuffix: string;
    codeLabel: string;
    codeHint: string;
    submit: string;
    noEmail: string;
    resendIn: (time: string) => string;
    resend: string;
  };
  reset: {
    title: string;
    description: string;
    newPassword: string;
    newPasswordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    ruleMet: string;
    ruleNotMet: string;
    rules: Record<PasswordRuleId, string>;
    submit: string;
  };
  done: {
    title: string;
    description: string;
    action: string;
  };
  validation: ResetPasswordSchemaMessages;
}

const RESET_PASSWORD_MESSAGES = defineMessages<ResetPasswordMessages>({
  en: {
    accountRecovery: 'Account recovery',
    stepOf: (step, total) => `Step ${step} of ${total}`,
    progressLabel: 'Account recovery progress',
    needHelp: 'Need help recovering your account?',
    contactSupport: 'Contact support',
    backToLogin: 'Back to login',
    back: 'Back',
    request: {
      title: 'Forgot your password?',
      description:
        'Enter your account email. If it matches a VIRaTeC account, we’ll send a secure 6-digit recovery code.',
      submit: 'Send recovery code',
      unavailableTitle: 'Password recovery by email',
      unavailablePrefix: 'No code was sent. To restore access, write to',
      secureTitle: 'Secure by design',
      secureDescription:
        'For privacy, we’ll show the same confirmation whether or not an account exists for this email.',
    },
    verify: {
      title: 'Check your inbox',
      descriptionPrefix: 'If an account exists for',
      descriptionSuffix: ', a recovery code has been sent. It expires in 10 minutes.',
      codeLabel: 'Recovery code',
      codeHint: 'Enter the 6 digits from your recovery email.',
      submit: 'Verify code',
      noEmail: 'Didn’t receive the email?',
      resendIn: (time) => `Resend in ${time}`,
      resend: 'Resend code',
    },
    reset: {
      title: 'Create a new password',
      description: 'Choose a strong, unique password for your VIRaTeC account.',
      newPassword: 'New password',
      newPasswordPlaceholder: 'Enter a strong password',
      confirmPassword: 'Confirm new password',
      confirmPasswordPlaceholder: 'Repeat your new password',
      ruleMet: ': met',
      ruleNotMet: ': not met',
      rules: { length: '8+ characters', uppercase: 'Uppercase letter', number: 'Number' },
      submit: 'Update password',
    },
    done: {
      title: 'Password updated',
      description:
        'Your VIRaTeC password has been changed successfully. You can now sign in with your new credentials.',
      action: 'Return to login',
    },
    validation: {
      invalidEmail: 'Please enter a valid email address',
      invalidCode: 'Enter the 6-digit code',
      passwordMin: 'Password must be at least 8 characters',
      passwordUppercase: 'Add at least one uppercase letter',
      passwordNumber: 'Add at least one number',
      passwordsMismatch: 'Passwords do not match',
    },
  },
  uk: {
    accountRecovery: 'Відновлення доступу',
    stepOf: (step, total) => `Крок ${step} з ${total}`,
    progressLabel: 'Прогрес відновлення доступу',
    needHelp: 'Потрібна допомога з відновленням доступу?',
    contactSupport: 'Звернутися до підтримки',
    backToLogin: 'Повернутися до входу',
    back: 'Назад',
    request: {
      title: 'Забули пароль?',
      description:
        'Введіть електронну пошту облікового запису. Якщо вона збігається з обліковим записом VIRaTeC, ми надішлемо захищений 6-значний код відновлення.',
      submit: 'Надіслати код відновлення',
      unavailableTitle: 'Відновлення пароля через електронну пошту',
      unavailablePrefix: 'Код не надіслано. Щоб відновити доступ, напишіть на',
      secureTitle: 'Безпека за замовчуванням',
      secureDescription:
        'З міркувань конфіденційності ми показуємо однакове підтвердження незалежно від того, чи існує обліковий запис із цією адресою.',
    },
    verify: {
      title: 'Перевірте пошту',
      descriptionPrefix: 'Якщо обліковий запис для',
      descriptionSuffix: ' існує, ми надіслали код відновлення. Він дійсний 10 хвилин.',
      codeLabel: 'Код відновлення',
      codeHint: 'Введіть 6 цифр із листа для відновлення.',
      submit: 'Підтвердити код',
      noEmail: 'Не отримали листа?',
      resendIn: (time) => `Повторне надсилання через ${time}`,
      resend: 'Надіслати код ще раз',
    },
    reset: {
      title: 'Створіть новий пароль',
      description: 'Оберіть надійний унікальний пароль для облікового запису VIRaTeC.',
      newPassword: 'Новий пароль',
      newPasswordPlaceholder: 'Введіть надійний пароль',
      confirmPassword: 'Підтвердіть новий пароль',
      confirmPasswordPlaceholder: 'Повторіть новий пароль',
      ruleMet: ': виконано',
      ruleNotMet: ': не виконано',
      rules: { length: '8+ символів', uppercase: 'Велика літера', number: 'Цифра' },
      submit: 'Оновити пароль',
    },
    done: {
      title: 'Пароль оновлено',
      description:
        'Пароль вашого облікового запису VIRaTeC успішно змінено. Тепер ви можете увійти з новими даними.',
      action: 'Повернутися до входу',
    },
    validation: {
      invalidEmail: 'Введіть коректну адресу електронної пошти',
      invalidCode: 'Введіть 6-значний код',
      passwordMin: 'Пароль має містити щонайменше 8 символів',
      passwordUppercase: 'Додайте щонайменше одну велику літеру',
      passwordNumber: 'Додайте щонайменше одну цифру',
      passwordsMismatch: 'Паролі не збігаються',
    },
  },
});

export const useResetPasswordMessages = () => useLocalized(RESET_PASSWORD_MESSAGES);
