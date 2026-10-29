import { defineMessages, useLocalized } from '@/shared/i18n';

const VERIFY_EMAIL_MESSAGES = defineMessages({
  en: {
    notice: {
      title: 'Confirm your email address',
      description: (email: string) =>
        `We sent a confirmation link to ${email}. Until you open it, you can’t post in the community, appear in the people directory or view members-only profiles.`,
      resend: 'Send a new link',
      sent: 'A new link is on its way. Check your inbox and spam folder.',
    },
    status: {
      pendingTitle: 'Confirming your email…',
      pendingDescription: 'This takes a moment.',
      successTitle: 'Email confirmed',
      successDescription: 'Thank you. Your account now has full access to the VIRaTeC community.',
      invalidTitle: 'This link no longer works',
      invalidDescription:
        'The link was already used or has expired. Sign in and send a new one from your account page.',
      failedTitle: 'We couldn’t confirm your email',
      retry: 'Try again',
      missingTitle: 'No confirmation link',
      missingDescription: 'Open the link from the confirmation email to finish.',
      toAccount: 'Go to your account',
      toLogin: 'Sign in',
    },
    errors: {
      tooMany: 'Too many emails were sent. Try again in an hour.',
      unavailable: 'Email delivery is unavailable right now. Try again later.',
      unexpected: 'Something went wrong. Please try again.',
    },
  },
  uk: {
    notice: {
      title: 'Підтвердьте адресу електронної пошти',
      description: (email: string) =>
        `Ми надіслали посилання для підтвердження на ${email}. Доки ви його не відкриєте, ви не можете писати в спільноті, з’являтися в каталозі людей і переглядати профілі лише для учасників.`,
      resend: 'Надіслати нове посилання',
      sent: 'Нове посилання вже в дорозі. Перевірте вхідні та папку «Спам».',
    },
    status: {
      pendingTitle: 'Підтверджуємо пошту…',
      pendingDescription: 'Це займе мить.',
      successTitle: 'Пошту підтверджено',
      successDescription:
        'Дякуємо. Ваш обліковий запис тепер має повний доступ до спільноти VIRaTeC.',
      invalidTitle: 'Посилання більше не діє',
      invalidDescription:
        'Посилання вже використано або строк його дії минув. Увійдіть і надішліть нове зі сторінки облікового запису.',
      failedTitle: 'Не вдалося підтвердити пошту',
      retry: 'Спробувати ще раз',
      missingTitle: 'Немає посилання для підтвердження',
      missingDescription: 'Відкрийте посилання з листа для підтвердження.',
      toAccount: 'До облікового запису',
      toLogin: 'Увійти',
    },
    errors: {
      tooMany: 'Надіслано забагато листів. Спробуйте за годину.',
      unavailable: 'Надсилання листів зараз недоступне. Спробуйте пізніше.',
      unexpected: 'Щось пішло не так. Спробуйте ще раз.',
    },
  },
});

export const useVerifyEmailMessages = () => useLocalized(VERIFY_EMAIL_MESSAGES);
