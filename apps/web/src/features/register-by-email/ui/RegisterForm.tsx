import { useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'react-router-dom';
import { SELF_ASSIGNABLE_ROLES, UserRole } from '@viratec/contracts';
import { readAuthNavigationState, useAccountLabels } from '@/entities/session';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { Input } from '@/shared/ui/auth-input';
import { Button } from '@/shared/ui/auth-button';
import { Tooltip } from '@/shared/ui/Tooltip';
import { Checkbox } from '@/shared/ui/checkbox';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { createRegisterFormSchema, type RegisterFormValues } from '../model/schema';
import { useRegister } from '../model/useRegister';

const REGISTER_MESSAGES = defineMessages({
  en: {
    title: 'Get started',
    subtitle: 'Join the VIRaTeC research community.',
    fullName: 'Full name',
    fullNamePlaceholder: 'Enter your full name',
    passwordPlaceholder: 'At least 8 characters',
    role: 'Your role',
    agreePrefix: 'I am at least 16 or have a guardian’s consent, and I agree to the',
    agreeAnd: 'and',
    termsLink: 'Terms of Service',
    privacyLink: 'Privacy Policy',
    submit: 'Create new account',
    haveAccount: 'Already have an account?',
    accountExists: 'An account with this email address already exists.',
    accountExistsSignIn: 'Sign in',
    accountExistsReset: 'Reset password',
    tooMany: 'Too many sign-up attempts. Try again in an hour.',
    invalidData: 'Invalid registration data. Please check your inputs.',
    unexpectedError: 'An unexpected error occurred. Please try again later.',
    validation: {
      nameMin: 'Name must be at least 2 characters',
      invalidEmail: 'Please enter a valid email address',
      passwordMin: 'Password must be at least 8 characters',
      termsRequired: 'You must agree to the Terms of Service and Privacy Policy',
    },
  },
  uk: {
    title: 'Почнімо',
    subtitle: 'Долучайтеся до дослідницької спільноти VIRaTeC.',
    fullName: 'Повне ім’я',
    fullNamePlaceholder: 'Введіть своє повне ім’я',
    passwordPlaceholder: 'Щонайменше 8 символів',
    role: 'Ваша роль',
    agreePrefix: 'Мені виповнилося 16 років або я маю згоду батьків чи опікуна, і я погоджуюся з',
    agreeAnd: 'та',
    termsLink: 'Умовами використання',
    privacyLink: 'Політикою конфіденційності',
    submit: 'Створити обліковий запис',
    haveAccount: 'Вже маєте обліковий запис?',
    accountExists: 'Обліковий запис із цією адресою електронної пошти вже існує.',
    accountExistsSignIn: 'Увійти',
    accountExistsReset: 'Відновити пароль',
    tooMany: 'Забагато спроб реєстрації. Спробуйте за годину.',
    invalidData: 'Некоректні дані для реєстрації. Перевірте введені значення.',
    unexpectedError: 'Сталася неочікувана помилка. Спробуйте пізніше.',
    validation: {
      nameMin: 'Ім’я має містити щонайменше 2 символи',
      invalidEmail: 'Введіть коректну адресу електронної пошти',
      passwordMin: 'Пароль має містити щонайменше 8 символів',
      termsRequired: 'Потрібно погодитися з Умовами використання та Політикою конфіденційності',
    },
  },
  de: {
    title: 'Los geht’s',
    subtitle: 'Werden Sie Teil der VIRaTeC-Forschungsgemeinschaft.',
    fullName: 'Vollständiger Name',
    fullNamePlaceholder: 'Vollständigen Namen eingeben',
    passwordPlaceholder: 'Mindestens 8 Zeichen',
    role: 'Ihre Rolle',
    agreePrefix:
      'Ich bin mindestens 16 Jahre alt oder habe die Zustimmung eines Erziehungsberechtigten und akzeptiere die',
    agreeAnd: 'und die',
    termsLink: 'Nutzungsbedingungen',
    privacyLink: 'Datenschutzerklärung',
    submit: 'Neues Konto erstellen',
    haveAccount: 'Sie haben bereits ein Konto?',
    accountExists: 'Ein Konto mit dieser E-Mail-Adresse existiert bereits.',
    accountExistsSignIn: 'Anmelden',
    accountExistsReset: 'Passwort zurücksetzen',
    tooMany: 'Zu viele Registrierungsversuche. Versuchen Sie es in einer Stunde erneut.',
    invalidData: 'Ungültige Registrierungsdaten. Bitte prüfen Sie Ihre Eingaben.',
    unexpectedError:
      'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
    validation: {
      nameMin: 'Der Name muss mindestens 2 Zeichen lang sein',
      invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      passwordMin: 'Das Passwort muss mindestens 8 Zeichen lang sein',
      termsRequired: 'Sie müssen den Nutzungsbedingungen und der Datenschutzerklärung zustimmen',
    },
  },
  fr: {
    title: 'Commencer',
    subtitle: 'Rejoignez la communauté de recherche VIRaTeC.',
    fullName: 'Nom complet',
    fullNamePlaceholder: 'Saisissez votre nom complet',
    passwordPlaceholder: 'Au moins 8 caractères',
    role: 'Votre rôle',
    agreePrefix: 'J’ai au moins 16 ans ou l’accord d’un parent ou tuteur, et j’accepte les',
    agreeAnd: 'et la',
    termsLink: 'Conditions d’utilisation',
    privacyLink: 'Politique de confidentialité',
    submit: 'Créer un nouveau compte',
    haveAccount: 'Vous avez déjà un compte ?',
    accountExists: 'Un compte avec cette adresse e-mail existe déjà.',
    accountExistsSignIn: 'Se connecter',
    accountExistsReset: 'Réinitialiser le mot de passe',
    tooMany: 'Trop de tentatives d’inscription. Réessayez dans une heure.',
    invalidData: 'Données d’inscription invalides. Veuillez vérifier vos saisies.',
    unexpectedError: 'Une erreur inattendue s’est produite. Veuillez réessayer plus tard.',
    validation: {
      nameMin: 'Le nom doit comporter au moins 2 caractères',
      invalidEmail: 'Veuillez saisir une adresse e-mail valide',
      passwordMin: 'Le mot de passe doit comporter au moins 8 caractères',
      termsRequired:
        'Vous devez accepter les Conditions d’utilisation et la Politique de confidentialité',
    },
  },
  ar: {
    title: 'ابدأ الآن',
    subtitle: 'انضم إلى مجتمع VIRaTeC البحثي.',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'أدخل اسمك الكامل',
    passwordPlaceholder: '8 أحرف على الأقل',
    role: 'دورك',
    agreePrefix: 'عمري 16 عامًا على الأقل أو لدي موافقة ولي الأمر، وأوافق على',
    agreeAnd: 'و',
    termsLink: 'شروط الخدمة',
    privacyLink: 'سياسة الخصوصية',
    submit: 'إنشاء حساب جديد',
    haveAccount: 'لديك حساب بالفعل؟',
    accountExists: 'يوجد حساب بهذا البريد الإلكتروني بالفعل.',
    accountExistsSignIn: 'تسجيل الدخول',
    accountExistsReset: 'إعادة تعيين كلمة المرور',
    tooMany: 'محاولات تسجيل كثيرة جدًا. حاول مرة أخرى بعد ساعة.',
    invalidData: 'بيانات التسجيل غير صالحة. يُرجى التحقق من المدخلات.',
    unexpectedError: 'حدث خطأ غير متوقع. يُرجى المحاولة لاحقًا.',
    validation: {
      nameMin: 'يجب ألا يقل الاسم عن حرفين',
      invalidEmail: 'يُرجى إدخال بريد إلكتروني صالح',
      passwordMin: 'يجب ألا تقل كلمة المرور عن 8 أحرف',
      termsRequired: 'يجب أن توافق على شروط الخدمة وسياسة الخصوصية',
    },
  },
});

type RegisterMessages = (typeof REGISTER_MESSAGES)['en'];

const getErrorMessage = (error: Error | null, t: RegisterMessages, networkError: string) => {
  if (!error) return null;
  if (error instanceof ApiError && error.status === NETWORK_ERROR_STATUS) return networkError;
  if (error instanceof ApiError && error.status === 409) return t.accountExists;
  if (error instanceof ApiError && error.status === 429) return t.tooMany;
  if (error instanceof ApiError && error.status === 400) return error.message || t.invalidData;
  return error.message || t.unexpectedError;
};

const LABEL_CLASS = 'text-xs font-medium text-auth-label';
const FIELD_ERROR_CLASS = 'text-xs text-auth-error';

interface RegisterFormProps {
  socialAuth?: ReactNode;
}

export function RegisterForm({ socialAuth }: RegisterFormProps) {
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending, error, variables } = useRegister();
  const t = useLocalized(REGISTER_MESSAGES);
  const common = useCommonMessages();
  const labels = useAccountLabels();
  const schema = useMemo(() => createRegisterFormSchema(t.validation), [t]);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      role: UserRole.STUDENT,
      password: '',
      terms: false,
    },
  });

  const serverErrorMessage = getErrorMessage(error, t, common.networkError);
  const isAccountTaken = error instanceof ApiError && error.status === 409;

  return (
    <div className="w-full space-y-5 lg:space-y-[clamp(8px,1.4svh,20px)]">
      <BrandLogo className="mx-auto h-[66px] w-[260px] lg:h-[clamp(30px,5svh,66px)] lg:w-[clamp(118px,19.7svh,260px)]" />

      <div className="space-y-2">
        <h2 className="font-auth text-[34px] lg:text-[clamp(30px,4.8svh,44px)] font-medium leading-[1.05] tracking-[-0.045em] text-auth-heading">
          {t.title}
        </h2>
        <p className="text-sm text-auth-muted">{t.subtitle}</p>
      </div>

      {socialAuth}

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-auth-border" />
        <span className="absolute bg-white px-3 text-[10px] tracking-[0.8px] text-auth-muted uppercase">
          {common.or}
        </span>
      </div>

      {serverErrorMessage && (
        <div
          role="alert"
          className="p-3 text-xs text-auth-error bg-red-50 border border-red-200 rounded-lg"
        >
          {serverErrorMessage}
          {isAccountTaken && (
            <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              <Link
                to={ROUTES.LOGIN}
                state={{ ...readAuthNavigationState(location.state), email: variables?.email }}
                className="font-medium text-auth-navy underline"
              >
                {t.accountExistsSignIn}
              </Link>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                state={{ ...readAuthNavigationState(location.state), email: variables?.email }}
                className="font-medium text-auth-navy underline"
              >
                {t.accountExistsReset}
              </Link>
            </span>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit((values) => register(values))}
        className="space-y-3.5 lg:space-y-[clamp(8px,1.4svh,14px)]"
        noValidate
      >
        <div className="space-y-1.5">
          <label htmlFor="register-name" className={LABEL_CLASS}>
            {t.fullName}
          </label>
          <Input
            id="register-name"
            {...registerField('name')}
            autoComplete="name"
            placeholder={t.fullNamePlaceholder}
            error={!!errors.name}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            className="h-[54px] lg:h-[clamp(40px,6svh,54px)] text-base"
          />
          {errors.name && (
            <p id="register-name-error" className={FIELD_ERROR_CLASS}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-email" className={LABEL_CLASS}>
            {common.emailAddress}
          </label>
          <Input
            id="register-email"
            {...registerField('email')}
            type="email"
            autoComplete="email"
            placeholder="name@knu.ua"
            error={!!errors.email}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            className="h-[54px] lg:h-[clamp(40px,6svh,54px)] text-base"
          />
          {errors.email && (
            <p id="register-email-error" className={FIELD_ERROR_CLASS}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-role" className={LABEL_CLASS}>
            {t.role}
          </label>
          <select
            id="register-role"
            {...registerField('role')}
            className="h-[54px] w-full cursor-pointer rounded-lg border border-auth-border bg-white px-3.5 text-base text-auth-heading outline-hidden transition-[border-color,box-shadow] focus:border-auth-progress focus:ring-1 focus:ring-auth-progress lg:h-[clamp(40px,6svh,54px)]"
          >
            {SELF_ASSIGNABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {labels.role[role]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-password" className={LABEL_CLASS}>
            {common.password}
          </label>
          <div className="relative">
            <Input
              id="register-password"
              {...registerField('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={t.passwordPlaceholder}
              error={!!errors.password}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
              className="h-[54px] lg:h-[clamp(40px,6svh,54px)] pe-14 text-base"
            />
            <Tooltip
              text={showPassword ? common.hidePassword : common.showPassword}
              className="absolute end-2 top-1/2 -translate-y-1/2"
            >
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? common.hidePassword : common.showPassword}
                className="flex size-10 cursor-pointer items-center justify-center rounded-md text-auth-muted hover:text-auth-navy"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </Tooltip>
          </div>
          {errors.password && (
            <p id="register-password-error" className={FIELD_ERROR_CLASS}>
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 py-2 lg:py-0">
          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox
              {...registerField('terms')}
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? 'register-terms-error' : undefined}
              className="mt-px"
            />
            <span className="text-xs leading-5 text-auth-muted">
              {t.agreePrefix}{' '}
              <Link to={ROUTES.TERMS} className="font-medium text-auth-navy underline">
                {t.termsLink}
              </Link>{' '}
              {t.agreeAnd}{' '}
              <Link to={ROUTES.PRIVACY} className="font-medium text-auth-navy underline">
                {t.privacyLink}
              </Link>
              .
            </span>
          </label>
          {errors.terms && (
            <p id="register-terms-error" className={FIELD_ERROR_CLASS}>
              {errors.terms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="h-[58px] lg:h-[clamp(40px,6svh,58px)] justify-between rounded-[9px] bg-auth-navy px-5 hover:bg-auth-navy-hover"
        >
          {t.submit}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-xs text-auth-muted">
        {t.haveAccount}{' '}
        <Link
          to={ROUTES.LOGIN}
          state={readAuthNavigationState(location.state)}
          className="font-medium text-auth-navy hover:underline"
        >
          {common.logIn}
        </Link>
      </p>
    </div>
  );
}
