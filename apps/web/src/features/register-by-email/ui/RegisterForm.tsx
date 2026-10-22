import { useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { Input } from '@/shared/ui/auth-input';
import { Button } from '@/shared/ui/auth-button';
import { Checkbox } from '@/shared/ui/checkbox';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { createRegisterFormSchema, type RegisterFormValues } from '../model/schema';
import { useRegister } from '../model/useRegister';

const REGISTER_MESSAGES = defineMessages({
  en: {
    title: 'Get started',
    subtitle: 'Create your profile to join the VIRaTeC research community.',
    fullName: 'Full name',
    fullNamePlaceholder: 'Enter your full name',
    passwordPlaceholder: 'At least 8 characters',
    agreePrefix: 'I agree to the',
    agreeAnd: 'and',
    termsLink: 'Terms of Service',
    privacyLink: 'Privacy Policy',
    submit: 'Create new account',
    haveAccount: 'Already have an account?',
    accountExists: 'An account with this email address already exists.',
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
    subtitle: 'Створіть профіль, щоб долучитися до дослідницької спільноти VIRaTeC.',
    fullName: 'Повне ім’я',
    fullNamePlaceholder: 'Введіть своє повне ім’я',
    passwordPlaceholder: 'Щонайменше 8 символів',
    agreePrefix: 'Я погоджуюся з',
    agreeAnd: 'та',
    termsLink: 'Умовами використання',
    privacyLink: 'Політикою конфіденційності',
    submit: 'Створити обліковий запис',
    haveAccount: 'Вже маєте обліковий запис?',
    accountExists: 'Обліковий запис із цією адресою електронної пошти вже існує.',
    invalidData: 'Некоректні дані для реєстрації. Перевірте введені значення.',
    unexpectedError: 'Сталася неочікувана помилка. Спробуйте пізніше.',
    validation: {
      nameMin: 'Ім’я має містити щонайменше 2 символи',
      invalidEmail: 'Введіть коректну адресу електронної пошти',
      passwordMin: 'Пароль має містити щонайменше 8 символів',
      termsRequired: 'Потрібно погодитися з Умовами використання та Політикою конфіденційності',
    },
  },
});

type RegisterMessages = (typeof REGISTER_MESSAGES)['en'];

const getErrorMessage = (error: Error | null, t: RegisterMessages, networkError: string) => {
  if (!error) return null;
  if (error instanceof ApiError && error.status === NETWORK_ERROR_STATUS) return networkError;
  if (error instanceof ApiError && error.status === 409) return t.accountExists;
  if (error instanceof ApiError && error.status === 400) return error.message || t.invalidData;
  return error.message || t.unexpectedError;
};

const LABEL_CLASS = 'text-xs font-medium text-auth-label';
const FIELD_ERROR_CLASS = 'text-xs text-auth-error';

interface RegisterFormProps {
  socialAuth?: ReactNode;
}

export function RegisterForm({ socialAuth }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending, error } = useRegister();
  const t = useLocalized(REGISTER_MESSAGES);
  const common = useCommonMessages();
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
      password: '',
      terms: false,
    },
  });

  const serverErrorMessage = getErrorMessage(error, t, common.networkError);

  return (
    <div className="w-full space-y-5 lg:space-y-[clamp(8px,1.4svh,20px)]">
      <BrandLogo className="mx-auto h-[66px] w-[260px] lg:h-[clamp(36px,5.5svh,66px)] lg:w-[clamp(142px,21.7svh,260px)]" />

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
            className="h-[54px] lg:h-[clamp(42px,6svh,54px)] text-base"
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
            className="h-[54px] lg:h-[clamp(42px,6svh,54px)] text-base"
          />
          {errors.email && (
            <p id="register-email-error" className={FIELD_ERROR_CLASS}>
              {errors.email.message}
            </p>
          )}
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
              className="h-[54px] lg:h-[clamp(42px,6svh,54px)] pr-14 text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? common.hidePassword : common.showPassword}
              className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-auth-muted hover:text-auth-navy"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
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
          className="h-[58px] lg:h-[clamp(42px,6svh,58px)] justify-between rounded-[9px] bg-auth-navy px-5 hover:bg-auth-navy-hover"
        >
          {t.submit}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-xs text-auth-muted">
        {t.haveAccount}{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-auth-navy hover:underline">
          {common.logIn}
        </Link>
      </p>
    </div>
  );
}
