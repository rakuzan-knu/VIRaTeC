import { useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { readAuthNavigationState } from '@/entities/session';
import { Input } from '@/shared/ui/auth-input';
import { Button } from '@/shared/ui/auth-button';
import { Tooltip } from '@/shared/ui/Tooltip';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { createLoginFormSchema, type LoginFormValues } from '../model/schema';
import { useLogin } from '../model/useLogin';

const LOGIN_MESSAGES = defineMessages({
  en: {
    title: 'Welcome back',
    subtitle: 'Sign in to continue to the VIRaTeC research community.',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot your password?',
    resetIt: 'Reset it',
    submit: 'Log in to your account',
    noAccount: 'Don’t have an account?',
    createAccount: 'Create an account',
    invalidCredentials: 'Invalid email or password.',
    unexpectedError: 'An unexpected error occurred. Please try again later.',
    validation: {
      invalidEmail: 'Please enter a valid email address',
      passwordMin: 'Password must be at least 6 characters',
    },
  },
  uk: {
    title: 'З поверненням',
    subtitle: 'Увійдіть, щоб продовжити роботу в дослідницькій спільноті VIRaTeC.',
    passwordPlaceholder: 'Введіть пароль',
    forgotPassword: 'Забули пароль?',
    resetIt: 'Відновити',
    submit: 'Увійти до облікового запису',
    noAccount: 'Ще не маєте облікового запису?',
    createAccount: 'Створити обліковий запис',
    invalidCredentials: 'Неправильна електронна пошта або пароль.',
    unexpectedError: 'Сталася неочікувана помилка. Спробуйте пізніше.',
    validation: {
      invalidEmail: 'Введіть коректну адресу електронної пошти',
      passwordMin: 'Пароль має містити щонайменше 6 символів',
    },
  },
});

type LoginMessages = (typeof LOGIN_MESSAGES)['en'];

const getErrorMessage = (error: Error | null, t: LoginMessages, networkError: string) => {
  if (!error) return null;
  if (error instanceof ApiError && error.status === NETWORK_ERROR_STATUS) return networkError;
  if (error instanceof ApiError && error.status === 401) return t.invalidCredentials;
  return error.message || t.unexpectedError;
};

interface LoginFormProps {
  socialAuth?: ReactNode;
}

export function LoginForm({ socialAuth }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const { mutate: login, isPending, error } = useLogin();
  const t = useLocalized(LOGIN_MESSAGES);
  const common = useCommonMessages();
  const schema = useMemo(() => createLoginFormSchema(t.validation), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: readAuthNavigationState(location.state).email ?? '', password: '' },
  });

  const serverErrorMessage = getErrorMessage(error, t, common.networkError);

  return (
    <div className="w-full space-y-5 lg:space-y-[clamp(10px,1.8svh,20px)]">
      <BrandLogo className="mx-auto h-[100px] w-[280px] lg:h-[clamp(44px,8svh,100px)] lg:w-[clamp(124px,22.4svh,280px)]" />

      <div className="space-y-2">
        <h2 className="text-[34px] lg:text-[clamp(32px,5svh,44px)] font-medium leading-[1.05] tracking-[-0.045em] text-auth-heading">
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

      <form onSubmit={handleSubmit((values) => login(values))} className="space-y-3.5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-xs font-medium text-auth-label">
            {common.emailAddress}
          </label>
          <Input
            id="login-email"
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="name@knu.ua"
            error={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className="h-[54px] lg:h-[clamp(44px,6.5svh,54px)] text-base"
          />
          {errors.email && (
            <p id="login-email-error" className="text-xs text-auth-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-xs font-medium text-auth-label">
            {common.password}
          </label>
          <div className="relative">
            <Input
              id="login-password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t.passwordPlaceholder}
              error={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              className="h-[54px] lg:h-[clamp(44px,6.5svh,54px)] pr-14 text-base"
            />
            <Tooltip
              text={showPassword ? common.hidePassword : common.showPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2"
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
            <p id="login-password-error" className="text-xs text-auth-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <p className="text-right text-xs text-auth-muted">
          {t.forgotPassword}{' '}
          <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-auth-navy hover:underline">
            {t.resetIt}
          </Link>
        </p>

        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="h-[58px] lg:h-[clamp(44px,6.5svh,58px)] justify-between rounded-[9px] bg-auth-navy px-5 hover:bg-auth-navy-hover"
        >
          {t.submit}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-xs text-auth-muted">
        {t.noAccount}{' '}
        <Link to={ROUTES.REGISTER} className="font-medium text-auth-navy hover:underline">
          {t.createAccount}
        </Link>
      </p>
    </div>
  );
}
