import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { ApiError } from '@/shared/api/apiClient';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
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
        <h2 className="text-[34px] lg:text-[44px] font-medium leading-[1.05] tracking-[-0.045em] text-[#041a3a]">
          Welcome back
        </h2>
        <p className="text-sm text-[#677588]">
          Sign in to continue to the VIRaTeC research community.
        </p>
      </div>

      <Button variant="outline" type="button" className="h-[58px] font-medium text-[#082455]">
        <GoogleIcon className="mr-1" />
        Continue with Google
      </Button>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-[#d7e0e8]" />
        <span className="absolute bg-white px-3 text-[10px] tracking-[0.8px] text-[#8b97a6] uppercase">
          or
        </span>
      </div>

      {serverErrorMessage && (
        <div
          role="alert"
          className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg"
        >
          {serverErrorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit((values) => login(values))} className="space-y-3.5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-xs font-medium text-[#0b1f3a]">
            Email address
          </label>
          <Input
            id="login-email"
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="name@knu.ua"
            error={!!errors.email}
            className="h-[54px] text-base"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-xs font-medium text-[#0b1f3a]">
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
              className="h-[54px] pr-12 text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <p className="text-right text-xs text-[#8b97a6]">
          Forgot your password?{' '}
          <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-[#082455] hover:underline">
            Reset it
          </Link>
        </p>

        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="h-[58px] justify-between rounded-[9px] bg-[#082455] px-5 hover:bg-[#0d3170]"
        >
          Log in to your account
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-xs text-[#8b97a6]">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.REGISTER} className="font-medium text-[#082455] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
