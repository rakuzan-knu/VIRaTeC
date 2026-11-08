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
    tooMany: string;
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
    codeRejected: string;
    resent: string;
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
    tooMany: string;
  };
  done: {
    title: string;
    description: string;
    action: string;
  };
  unexpectedError: string;
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
      tooMany: 'Too many recovery emails were requested. Try again in an hour.',
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
      codeRejected: 'The code is incorrect or has expired. Check it or request a new one.',
      resent: 'If the account exists, a new code is on its way.',
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
      tooMany: 'Too many attempts. Wait 15 minutes and try again.',
    },
    done: {
      title: 'Password updated',
      description:
        'Your VIRaTeC password has been changed successfully. You can now sign in with your new credentials.',
      action: 'Return to login',
    },
    unexpectedError: 'Something went wrong. Please try again.',
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
      tooMany: 'Забагато запитів на відновлення. Спробуйте за годину.',
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
      codeRejected:
        'Код неправильний або строк його дії минув. Перевірте його або запросіть новий.',
      resent: 'Якщо обліковий запис існує, новий код уже в дорозі.',
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
      tooMany: 'Забагато спроб. Зачекайте 15 хвилин і спробуйте ще раз.',
    },
    done: {
      title: 'Пароль оновлено',
      description:
        'Пароль вашого облікового запису VIRaTeC успішно змінено. Тепер ви можете увійти з новими даними.',
      action: 'Повернутися до входу',
    },
    unexpectedError: 'Щось пішло не так. Спробуйте ще раз.',
    validation: {
      invalidEmail: 'Введіть коректну адресу електронної пошти',
      invalidCode: 'Введіть 6-значний код',
      passwordMin: 'Пароль має містити щонайменше 8 символів',
      passwordUppercase: 'Додайте щонайменше одну велику літеру',
      passwordNumber: 'Додайте щонайменше одну цифру',
      passwordsMismatch: 'Паролі не збігаються',
    },
  },
  de: {
    accountRecovery: 'Kontowiederherstellung',
    stepOf: (step, total) => `Schritt ${step} von ${total}`,
    progressLabel: 'Fortschritt der Kontowiederherstellung',
    needHelp: 'Brauchen Sie Hilfe bei der Wiederherstellung Ihres Kontos?',
    contactSupport: 'Support kontaktieren',
    backToLogin: 'Zurück zur Anmeldung',
    back: 'Zurück',
    request: {
      title: 'Passwort vergessen?',
      description:
        'Geben Sie die E-Mail Ihres Kontos ein. Wenn sie zu einem VIRaTeC-Konto gehört, senden wir einen sicheren 6-stelligen Wiederherstellungscode.',
      submit: 'Wiederherstellungscode senden',
      unavailableTitle: 'Passwortwiederherstellung per E-Mail',
      unavailablePrefix:
        'Es wurde kein Code gesendet. Um den Zugang wiederherzustellen, schreiben Sie an',
      secureTitle: 'Sicher durch Design',
      secureDescription:
        'Aus Datenschutzgründen zeigen wir dieselbe Bestätigung an, unabhängig davon, ob für diese E-Mail ein Konto existiert.',
      tooMany:
        'Es wurden zu viele Wiederherstellungs-E-Mails angefordert. Versuchen Sie es in einer Stunde erneut.',
    },
    verify: {
      title: 'Prüfen Sie Ihren Posteingang',
      descriptionPrefix: 'Wenn ein Konto für',
      descriptionSuffix:
        ' existiert, wurde ein Wiederherstellungscode gesendet. Er läuft in 10 Minuten ab.',
      codeLabel: 'Wiederherstellungscode',
      codeHint: 'Geben Sie die 6 Ziffern aus Ihrer Wiederherstellungs-E-Mail ein.',
      submit: 'Code bestätigen',
      noEmail: 'Keine E-Mail erhalten?',
      resendIn: (time) => `Erneut senden in ${time}`,
      resend: 'Code erneut senden',
      codeRejected:
        'Der Code ist falsch oder abgelaufen. Prüfen Sie ihn oder fordern Sie einen neuen an.',
      resent: 'Wenn das Konto existiert, ist ein neuer Code unterwegs.',
    },
    reset: {
      title: 'Neues Passwort erstellen',
      description: 'Wählen Sie ein starkes, einzigartiges Passwort für Ihr VIRaTeC-Konto.',
      newPassword: 'Neues Passwort',
      newPasswordPlaceholder: 'Starkes Passwort eingeben',
      confirmPassword: 'Neues Passwort bestätigen',
      confirmPasswordPlaceholder: 'Neues Passwort wiederholen',
      ruleMet: ': erfüllt',
      ruleNotMet: ': nicht erfüllt',
      rules: { length: '8+ Zeichen', uppercase: 'Großbuchstabe', number: 'Ziffer' },
      submit: 'Passwort aktualisieren',
      tooMany: 'Zu viele Versuche. Warten Sie 15 Minuten und versuchen Sie es erneut.',
    },
    done: {
      title: 'Passwort aktualisiert',
      description:
        'Ihr VIRaTeC-Passwort wurde erfolgreich geändert. Sie können sich jetzt mit Ihren neuen Zugangsdaten anmelden.',
      action: 'Zurück zur Anmeldung',
    },
    unexpectedError: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    validation: {
      invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      invalidCode: 'Geben Sie den 6-stelligen Code ein',
      passwordMin: 'Das Passwort muss mindestens 8 Zeichen lang sein',
      passwordUppercase: 'Fügen Sie mindestens einen Großbuchstaben hinzu',
      passwordNumber: 'Fügen Sie mindestens eine Ziffer hinzu',
      passwordsMismatch: 'Die Passwörter stimmen nicht überein',
    },
  },
  fr: {
    accountRecovery: 'Récupération du compte',
    stepOf: (step, total) => `Étape ${step} sur ${total}`,
    progressLabel: 'Progression de la récupération du compte',
    needHelp: 'Besoin d’aide pour récupérer votre compte ?',
    contactSupport: 'Contacter l’assistance',
    backToLogin: 'Retour à la connexion',
    back: 'Retour',
    request: {
      title: 'Mot de passe oublié ?',
      description:
        'Saisissez l’e-mail de votre compte. S’il correspond à un compte VIRaTeC, nous enverrons un code de récupération sécurisé à 6 chiffres.',
      submit: 'Envoyer le code de récupération',
      unavailableTitle: 'Récupération du mot de passe par e-mail',
      unavailablePrefix: 'Aucun code n’a été envoyé. Pour rétablir l’accès, écrivez à',
      secureTitle: 'Sécurisé dès la conception',
      secureDescription:
        'Par souci de confidentialité, nous affichons la même confirmation qu’un compte existe ou non pour cet e-mail.',
      tooMany: 'Trop d’e-mails de récupération ont été demandés. Réessayez dans une heure.',
    },
    verify: {
      title: 'Vérifiez votre boîte de réception',
      descriptionPrefix: 'Si un compte existe pour',
      descriptionSuffix: ', un code de récupération a été envoyé. Il expire dans 10 minutes.',
      codeLabel: 'Code de récupération',
      codeHint: 'Saisissez les 6 chiffres de votre e-mail de récupération.',
      submit: 'Vérifier le code',
      noEmail: 'Vous n’avez pas reçu l’e-mail ?',
      resendIn: (time) => `Renvoyer dans ${time}`,
      resend: 'Renvoyer le code',
      codeRejected: 'Le code est incorrect ou a expiré. Vérifiez-le ou demandez-en un nouveau.',
      resent: 'Si le compte existe, un nouveau code est en route.',
    },
    reset: {
      title: 'Créez un nouveau mot de passe',
      description: 'Choisissez un mot de passe fort et unique pour votre compte VIRaTeC.',
      newPassword: 'Nouveau mot de passe',
      newPasswordPlaceholder: 'Saisissez un mot de passe fort',
      confirmPassword: 'Confirmez le nouveau mot de passe',
      confirmPasswordPlaceholder: 'Répétez votre nouveau mot de passe',
      ruleMet: ' : respecté',
      ruleNotMet: ' : non respecté',
      rules: { length: '8 caractères ou plus', uppercase: 'Lettre majuscule', number: 'Chiffre' },
      submit: 'Mettre à jour le mot de passe',
      tooMany: 'Trop de tentatives. Attendez 15 minutes et réessayez.',
    },
    done: {
      title: 'Mot de passe mis à jour',
      description:
        'Votre mot de passe VIRaTeC a bien été modifié. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.',
      action: 'Retour à la connexion',
    },
    unexpectedError: 'Une erreur s’est produite. Veuillez réessayer.',
    validation: {
      invalidEmail: 'Veuillez saisir une adresse e-mail valide',
      invalidCode: 'Saisissez le code à 6 chiffres',
      passwordMin: 'Le mot de passe doit comporter au moins 8 caractères',
      passwordUppercase: 'Ajoutez au moins une lettre majuscule',
      passwordNumber: 'Ajoutez au moins un chiffre',
      passwordsMismatch: 'Les mots de passe ne correspondent pas',
    },
  },
  ar: {
    accountRecovery: 'استعادة الحساب',
    stepOf: (step, total) => `الخطوة ${step} من ${total}`,
    progressLabel: 'تقدّم استعادة الحساب',
    needHelp: 'هل تحتاج إلى مساعدة في استعادة حسابك؟',
    contactSupport: 'تواصل مع الدعم',
    backToLogin: 'العودة إلى تسجيل الدخول',
    back: 'رجوع',
    request: {
      title: 'هل نسيت كلمة المرور؟',
      description:
        'أدخل البريد الإلكتروني لحسابك. إذا كان مطابقًا لحساب في VIRaTeC، فسنرسل رمز استعادة آمنًا من 6 أرقام.',
      submit: 'إرسال رمز الاستعادة',
      unavailableTitle: 'استعادة كلمة المرور عبر البريد الإلكتروني',
      unavailablePrefix: 'لم يُرسَل أي رمز. لاستعادة الوصول، راسل',
      secureTitle: 'آمن من حيث التصميم',
      secureDescription:
        'حفاظًا على الخصوصية، نعرض التأكيد نفسه سواء كان هناك حساب لهذا البريد الإلكتروني أم لا.',
      tooMany: 'تم طلب عدد كبير جدًا من رسائل الاستعادة. حاول مرة أخرى بعد ساعة.',
    },
    verify: {
      title: 'تحقّق من بريدك الوارد',
      descriptionPrefix: 'إذا كان هناك حساب لـ',
      descriptionSuffix: '، فقد أُرسل رمز استعادة. تنتهي صلاحيته خلال 10 دقائق.',
      codeLabel: 'رمز الاستعادة',
      codeHint: 'أدخل الأرقام الستة من رسالة الاستعادة.',
      submit: 'تحقّق من الرمز',
      noEmail: 'ألم تصلك الرسالة؟',
      resendIn: (time) => `إعادة الإرسال بعد ${time}`,
      resend: 'إعادة إرسال الرمز',
      codeRejected: 'الرمز غير صحيح أو انتهت صلاحيته. تحقّق منه أو اطلب رمزًا جديدًا.',
      resent: 'إذا كان الحساب موجودًا، فهناك رمز جديد في الطريق إليك.',
    },
    reset: {
      title: 'أنشئ كلمة مرور جديدة',
      description: 'اختر كلمة مرور قوية وفريدة لحسابك في VIRaTeC.',
      newPassword: 'كلمة المرور الجديدة',
      newPasswordPlaceholder: 'أدخل كلمة مرور قوية',
      confirmPassword: 'تأكيد كلمة المرور الجديدة',
      confirmPasswordPlaceholder: 'أعد إدخال كلمة المرور الجديدة',
      ruleMet: ': مستوفى',
      ruleNotMet: ': غير مستوفى',
      rules: { length: '8 أحرف أو أكثر', uppercase: 'حرف كبير', number: 'رقم' },
      submit: 'تحديث كلمة المرور',
      tooMany: 'محاولات كثيرة جدًا. انتظر 15 دقيقة ثم حاول مرة أخرى.',
    },
    done: {
      title: 'تم تحديث كلمة المرور',
      description:
        'تم تغيير كلمة مرورك في VIRaTeC بنجاح. يمكنك الآن تسجيل الدخول ببيانات الاعتماد الجديدة.',
      action: 'العودة إلى تسجيل الدخول',
    },
    unexpectedError: 'حدث خطأ ما. يُرجى المحاولة مرة أخرى.',
    validation: {
      invalidEmail: 'يُرجى إدخال بريد إلكتروني صالح',
      invalidCode: 'أدخل الرمز المكوّن من 6 أرقام',
      passwordMin: 'يجب ألا تقل كلمة المرور عن 8 أحرف',
      passwordUppercase: 'أضف حرفًا كبيرًا واحدًا على الأقل',
      passwordNumber: 'أضف رقمًا واحدًا على الأقل',
      passwordsMismatch: 'كلمتا المرور غير متطابقتين',
    },
  },
});

export const useResetPasswordMessages = () => useLocalized(RESET_PASSWORD_MESSAGES);
