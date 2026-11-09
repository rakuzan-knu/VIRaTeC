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
      emailChangedDescription: 'Your account now uses this email address.',
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
      emailChangedDescription: 'Ваш обліковий запис тепер використовує цю адресу пошти.',
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
  de: {
    notice: {
      title: 'Bestätigen Sie Ihre E-Mail-Adresse',
      description: (email: string) =>
        `Wir haben einen Bestätigungslink an ${email} gesendet. Bis Sie ihn öffnen, können Sie nicht in der Community posten, nicht im Mitgliederverzeichnis erscheinen und keine Profile nur für Mitglieder ansehen.`,
      resend: 'Neuen Link senden',
      sent: 'Ein neuer Link ist unterwegs. Prüfen Sie Ihren Posteingang und Spam-Ordner.',
    },
    status: {
      pendingTitle: 'E-Mail wird bestätigt…',
      pendingDescription: 'Das dauert einen Moment.',
      successTitle: 'E-Mail bestätigt',
      successDescription: 'Vielen Dank. Ihr Konto hat jetzt vollen Zugang zur VIRaTeC-Community.',
      emailChangedDescription: 'Ihr Konto verwendet jetzt diese E-Mail-Adresse.',
      invalidTitle: 'Dieser Link funktioniert nicht mehr',
      invalidDescription:
        'Der Link wurde bereits verwendet oder ist abgelaufen. Melden Sie sich an und senden Sie auf Ihrer Kontoseite einen neuen.',
      failedTitle: 'Wir konnten Ihre E-Mail nicht bestätigen',
      retry: 'Erneut versuchen',
      missingTitle: 'Kein Bestätigungslink',
      missingDescription: 'Öffnen Sie den Link aus der Bestätigungs-E-Mail, um fortzufahren.',
      toAccount: 'Zu Ihrem Konto',
      toLogin: 'Anmelden',
    },
    errors: {
      tooMany: 'Es wurden zu viele E-Mails gesendet. Versuchen Sie es in einer Stunde erneut.',
      unavailable:
        'Der E-Mail-Versand ist derzeit nicht verfügbar. Versuchen Sie es später erneut.',
      unexpected: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    },
  },
  fr: {
    notice: {
      title: 'Confirmez votre adresse e-mail',
      description: (email: string) =>
        `Nous avons envoyé un lien de confirmation à ${email}. Tant que vous ne l’avez pas ouvert, vous ne pouvez pas publier dans la communauté, apparaître dans l’annuaire des membres ni consulter les profils réservés aux membres.`,
      resend: 'Envoyer un nouveau lien',
      sent: 'Un nouveau lien est en route. Vérifiez votre boîte de réception et vos spams.',
    },
    status: {
      pendingTitle: 'Confirmation de votre e-mail…',
      pendingDescription: 'Cela prend un instant.',
      successTitle: 'E-mail confirmé',
      successDescription:
        'Merci. Votre compte a désormais un accès complet à la communauté VIRaTeC.',
      emailChangedDescription: 'Votre compte utilise désormais cette adresse e-mail.',
      invalidTitle: 'Ce lien ne fonctionne plus',
      invalidDescription:
        'Le lien a déjà été utilisé ou a expiré. Connectez-vous et envoyez-en un nouveau depuis la page de votre compte.',
      failedTitle: 'Nous n’avons pas pu confirmer votre e-mail',
      retry: 'Réessayer',
      missingTitle: 'Aucun lien de confirmation',
      missingDescription: 'Ouvrez le lien de l’e-mail de confirmation pour terminer.',
      toAccount: 'Aller à votre compte',
      toLogin: 'Se connecter',
    },
    errors: {
      tooMany: 'Trop d’e-mails ont été envoyés. Réessayez dans une heure.',
      unavailable: 'L’envoi d’e-mails est indisponible pour le moment. Réessayez plus tard.',
      unexpected: 'Une erreur s’est produite. Veuillez réessayer.',
    },
  },
  ar: {
    notice: {
      title: 'أكّد عنوان بريدك الإلكتروني',
      description: (email: string) =>
        `أرسلنا رابط تأكيد إلى ${email}. إلى أن تفتحه، لا يمكنك النشر في المجتمع أو الظهور في دليل الأعضاء أو عرض الملفات الشخصية المخصصة للأعضاء.`,
      resend: 'إرسال رابط جديد',
      sent: 'رابط جديد في الطريق إليك. تحقّق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها.',
    },
    status: {
      pendingTitle: 'جارٍ تأكيد بريدك الإلكتروني…',
      pendingDescription: 'يستغرق هذا لحظة.',
      successTitle: 'تم تأكيد البريد الإلكتروني',
      successDescription: 'شكرًا لك. أصبح لحسابك الآن وصول كامل إلى مجتمع VIRaTeC.',
      emailChangedDescription: 'يستخدم حسابك الآن عنوان البريد الإلكتروني هذا.',
      invalidTitle: 'لم يعد هذا الرابط صالحًا',
      invalidDescription:
        'تم استخدام الرابط من قبل أو انتهت صلاحيته. سجّل الدخول وأرسل رابطًا جديدًا من صفحة حسابك.',
      failedTitle: 'تعذّر علينا تأكيد بريدك الإلكتروني',
      retry: 'حاول مرة أخرى',
      missingTitle: 'لا يوجد رابط تأكيد',
      missingDescription: 'افتح الرابط من رسالة التأكيد لإتمام العملية.',
      toAccount: 'الانتقال إلى حسابك',
      toLogin: 'تسجيل الدخول',
    },
    errors: {
      tooMany: 'تم إرسال عدد كبير جدًا من الرسائل. حاول مرة أخرى بعد ساعة.',
      unavailable: 'إرسال البريد الإلكتروني غير متاح حاليًا. حاول لاحقًا.',
      unexpected: 'حدث خطأ ما. يُرجى المحاولة مرة أخرى.',
    },
  },
});

export const useVerifyEmailMessages = () => useLocalized(VERIFY_EMAIL_MESSAGES);
