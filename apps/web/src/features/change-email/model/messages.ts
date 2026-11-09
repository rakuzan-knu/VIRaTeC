import { EMAIL_TOKEN_LIMITS } from '@viratec/contracts';
import { defineMessages, useLocalized } from '@/shared/i18n';

const HOURS = EMAIL_TOKEN_LIMITS.verifyLinkTtlHours;

const CHANGE_EMAIL_MESSAGES = defineMessages({
  en: {
    current: (email: string) => `Current address: ${email}`,
    newEmail: 'New email address',
    password: 'Your password',
    code: 'Two-step verification code',
    googleLabel: 'Confirm with Google',
    googleConfirmed: 'Google account confirmed.',
    googleUnavailable: 'Google confirmation is unavailable right now. Please try again later.',
    submit: 'Send confirmation link',
    pending: (email: string) =>
      `Waiting for confirmation of ${email}. Open the link we sent to that address within ${HOURS} hours.`,
    cancel: 'Cancel change',
    validation: {
      invalidEmail: 'Please enter a valid email address',
      passwordRequired: 'Enter your password',
      codeRequired: 'Enter the code from your authenticator app',
    },
    errors: {
      unchanged: 'This is already your email address.',
      taken: 'This email address is already in use.',
      wrongPassword: 'The password is incorrect.',
      wrongCode: 'The code is incorrect or expired.',
      googleRetry: 'Confirm with Google again.',
      googleRequired: 'Confirm with Google first.',
      tooMany: 'Too many attempts. Please try again later.',
      unavailable: 'Email delivery is unavailable right now. Please try again later.',
      unexpected: 'Could not change the email. Please try again.',
    },
  },
  uk: {
    current: (email: string) => `Поточна адреса: ${email}`,
    newEmail: 'Нова адреса пошти',
    password: 'Ваш пароль',
    code: 'Код двоетапної перевірки',
    googleLabel: 'Підтвердьте через Google',
    googleConfirmed: 'Обліковий запис Google підтверджено.',
    googleUnavailable: 'Підтвердження через Google зараз недоступне. Спробуйте пізніше.',
    submit: 'Надіслати посилання',
    pending: (email: string) =>
      `Очікуємо підтвердження ${email}. Відкрийте посилання, надіслане на цю адресу, протягом ${HOURS} годин.`,
    cancel: 'Скасувати зміну',
    validation: {
      invalidEmail: 'Введіть коректну адресу електронної пошти',
      passwordRequired: 'Введіть пароль',
      codeRequired: 'Введіть код із застосунку-автентифікатора',
    },
    errors: {
      unchanged: 'Це вже ваша адреса пошти.',
      taken: 'Ця адреса пошти вже використовується.',
      wrongPassword: 'Неправильний пароль.',
      wrongCode: 'Код неправильний або застарів.',
      googleRetry: 'Підтвердьте через Google ще раз.',
      googleRequired: 'Спершу підтвердьте через Google.',
      tooMany: 'Забагато спроб. Спробуйте пізніше.',
      unavailable: 'Надсилання листів зараз недоступне. Спробуйте пізніше.',
      unexpected: 'Не вдалося змінити пошту. Спробуйте ще раз.',
    },
  },
  de: {
    current: (email: string) => `Aktuelle Adresse: ${email}`,
    newEmail: 'Neue E-Mail-Adresse',
    password: 'Ihr Passwort',
    code: 'Code der zweistufigen Bestätigung',
    googleLabel: 'Mit Google bestätigen',
    googleConfirmed: 'Google-Konto bestätigt.',
    googleUnavailable:
      'Die Bestätigung mit Google ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.',
    submit: 'Bestätigungslink senden',
    pending: (email: string) =>
      `Warten auf die Bestätigung von ${email}. Öffnen Sie innerhalb von ${HOURS} Stunden den Link, den wir an diese Adresse gesendet haben.`,
    cancel: 'Änderung abbrechen',
    validation: {
      invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      passwordRequired: 'Geben Sie Ihr Passwort ein',
      codeRequired: 'Geben Sie den Code aus Ihrer Authentifizierungs-App ein',
    },
    errors: {
      unchanged: 'Das ist bereits Ihre E-Mail-Adresse.',
      taken: 'Diese E-Mail-Adresse wird bereits verwendet.',
      wrongPassword: 'Das Passwort ist falsch.',
      wrongCode: 'Der Code ist falsch oder abgelaufen.',
      googleRetry: 'Bestätigen Sie erneut mit Google.',
      googleRequired: 'Bestätigen Sie zuerst mit Google.',
      tooMany: 'Zu viele Versuche. Bitte versuchen Sie es später erneut.',
      unavailable:
        'Der E-Mail-Versand ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.',
      unexpected: 'Die E-Mail konnte nicht geändert werden. Bitte versuchen Sie es erneut.',
    },
  },
  fr: {
    current: (email: string) => `Adresse actuelle : ${email}`,
    newEmail: 'Nouvelle adresse e-mail',
    password: 'Votre mot de passe',
    code: 'Code de vérification en deux étapes',
    googleLabel: 'Confirmer avec Google',
    googleConfirmed: 'Compte Google confirmé.',
    googleUnavailable:
      'La confirmation avec Google est indisponible pour le moment. Veuillez réessayer plus tard.',
    submit: 'Envoyer le lien de confirmation',
    pending: (email: string) =>
      `En attente de la confirmation de ${email}. Ouvrez le lien envoyé à cette adresse dans les ${HOURS} heures.`,
    cancel: 'Annuler le changement',
    validation: {
      invalidEmail: 'Veuillez saisir une adresse e-mail valide',
      passwordRequired: 'Saisissez votre mot de passe',
      codeRequired: 'Saisissez le code de votre application d’authentification',
    },
    errors: {
      unchanged: 'C’est déjà votre adresse e-mail.',
      taken: 'Cette adresse e-mail est déjà utilisée.',
      wrongPassword: 'Le mot de passe est incorrect.',
      wrongCode: 'Le code est incorrect ou expiré.',
      googleRetry: 'Confirmez de nouveau avec Google.',
      googleRequired: 'Confirmez d’abord avec Google.',
      tooMany: 'Trop de tentatives. Veuillez réessayer plus tard.',
      unavailable: 'L’envoi d’e-mails est indisponible pour le moment. Réessayez plus tard.',
      unexpected: 'Impossible de modifier l’e-mail. Veuillez réessayer.',
    },
  },
  ar: {
    current: (email: string) => `العنوان الحالي: ${email}`,
    newEmail: 'عنوان البريد الإلكتروني الجديد',
    password: 'كلمة المرور',
    code: 'رمز التحقق بخطوتين',
    googleLabel: 'التأكيد عبر Google',
    googleConfirmed: 'تم تأكيد حساب Google.',
    googleUnavailable: 'التأكيد عبر Google غير متاح حاليًا. يُرجى المحاولة لاحقًا.',
    submit: 'إرسال رابط التأكيد',
    pending: (email: string) =>
      `في انتظار تأكيد ${email}. افتح الرابط المرسل إلى هذا العنوان خلال ${HOURS} ساعة.`,
    cancel: 'إلغاء التغيير',
    validation: {
      invalidEmail: 'يُرجى إدخال بريد إلكتروني صالح',
      passwordRequired: 'أدخل كلمة المرور',
      codeRequired: 'أدخل الرمز من تطبيق المصادقة',
    },
    errors: {
      unchanged: 'هذا هو عنوان بريدك الإلكتروني بالفعل.',
      taken: 'عنوان البريد الإلكتروني هذا مستخدم بالفعل.',
      wrongPassword: 'كلمة المرور غير صحيحة.',
      wrongCode: 'الرمز غير صحيح أو منتهي الصلاحية.',
      googleRetry: 'أكّد عبر Google مرة أخرى.',
      googleRequired: 'أكّد عبر Google أولًا.',
      tooMany: 'محاولات كثيرة جدًا. يُرجى المحاولة لاحقًا.',
      unavailable: 'إرسال البريد الإلكتروني غير متاح حاليًا. حاول لاحقًا.',
      unexpected: 'تعذّر تغيير البريد الإلكتروني. يُرجى المحاولة مرة أخرى.',
    },
  },
});

export type ChangeEmailMessages = (typeof CHANGE_EMAIL_MESSAGES)['en'];

export const useChangeEmailMessages = () => useLocalized(CHANGE_EMAIL_MESSAGES);
