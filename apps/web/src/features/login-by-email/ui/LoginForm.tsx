import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { NOT_AVAILABLE_YET } from '@/shared/config/navigation';
import { ApiError } from '@/shared/api/apiClient';
import { Input } from '@/shared/ui/auth-input';
import { Button } from '@/shared/ui/auth-button';
import { GoogleIcon } from '@/shared/ui/google-icon';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { loginFormSchema, type LoginFormValues } from '../model/schema';
import { useLogin } from '../model/useLogin';

const getErrorMessage = (error: Error | null) => {
  if (!error) return null;
  if (error instanceof ApiError && error.status === 401) return 'Invalid email or password.';
  return error.message || 'An unexpected error occurred. Please try again later.';
};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const serverErrorMessage = getErrorMessage(error);

  return (
    <div className="w-full space-y-5">
      <BrandLogo className="mx-auto h-[100px] w-[280px]" />

      <div className="space-y-2">
        <h2 className="text-[34px] lg:text-[44px] font-medium leading-[1.05] tracking-[-0.045em] text-auth-heading">
          Welcome back
        </h2>
        <p className="text-sm text-auth-muted">
          Sign in to continue to the VIRaTeC research community.
        </p>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled
        title={`Google sign-in: ${NOT_AVAILABLE_YET}`}
        className="h-[58px] font-medium text-auth-navy"
      >
        <GoogleIcon className="mr-1" />
        Continue with Google
        <span className="text-xs font-normal text-auth-muted">· {NOT_AVAILABLE_YET}</span>
      </Button>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-auth-border" />
        <span className="absolute bg-white px-3 text-[10px] tracking-[0.8px] text-auth-muted uppercase">
          or
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
            Email address
          </label>
          <Input
            id="login-email"
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="name@knu.ua"
            error={!!errors.email}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className="h-[54px] text-base"
          />
          {errors.email && (
            <p id="login-email-error" className="text-xs text-auth-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-xs font-medium text-auth-label">
            Password
          </label>
          <div className="relative">
            <Input
              id="login-password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              error={!!errors.password}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              className="h-[54px] pr-14 text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-auth-muted hover:text-auth-navy"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" className="text-xs text-auth-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <p className="text-right text-xs text-auth-muted">
          Forgot your password?{' '}
          <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-auth-navy hover:underline">
            Reset it
          </Link>
        </p>

        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="h-[58px] justify-between rounded-[9px] bg-auth-navy px-5 hover:bg-auth-navy-hover"
        >
          Log in to your account
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-xs text-auth-muted">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.REGISTER} className="font-medium text-auth-navy hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
