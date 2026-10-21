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
import { Checkbox } from '@/shared/ui/checkbox';
import { GoogleIcon } from '@/shared/ui/google-icon';
import { registerFormSchema, type RegisterFormValues } from '../model/schema';
import { useRegister } from '../model/useRegister';

const getErrorMessage = (error: Error | null) => {
  if (!error) return null;
  if (error instanceof ApiError && error.status === 409)
    return 'An account with this email address already exists.';
  if (error instanceof ApiError && error.status === 400)
    return error.message || 'Invalid registration data. Please check your inputs.';
  return error.message || 'An unexpected error occurred. Please try again later.';
};

const LABEL_CLASS = 'text-xs font-medium text-auth-label';
const FIELD_ERROR_CLASS = 'text-xs text-auth-error';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending, error } = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      terms: false,
    },
  });

  const serverErrorMessage = getErrorMessage(error);

  return (
    <div className="w-full space-y-5">
      <div className="flex justify-center">
        <img
          src="/logo-full.png"
          alt="VIRaTeC Global Network"
          className="h-auto max-h-[90px] w-auto max-w-[260px] object-contain"
        />
      </div>

      <div className="space-y-2">
        <h2 className="font-auth text-[34px] lg:text-[44px] font-medium leading-[1.05] tracking-[-0.045em] text-auth-heading">
          Get started
        </h2>
        <p className="text-sm text-auth-muted">
          Create your profile to join the VIRaTeC research community.
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

      <form
        onSubmit={handleSubmit((values) => register(values))}
        className="space-y-3.5"
        noValidate
      >
        <div className="space-y-1.5">
          <label htmlFor="register-name" className={LABEL_CLASS}>
            Full name
          </label>
          <Input
            id="register-name"
            {...registerField('name')}
            autoComplete="name"
            placeholder="Enter your full name"
            error={!!errors.name}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            className="h-[54px] text-base"
          />
          {errors.name && (
            <p id="register-name-error" className={FIELD_ERROR_CLASS}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-email" className={LABEL_CLASS}>
            Email address
          </label>
          <Input
            id="register-email"
            {...registerField('email')}
            type="email"
            autoComplete="email"
            placeholder="name@knu.ua"
            error={!!errors.email}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            className="h-[54px] text-base"
          />
          {errors.email && (
            <p id="register-email-error" className={FIELD_ERROR_CLASS}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="register-password" className={LABEL_CLASS}>
            Password
          </label>
          <div className="relative">
            <Input
              id="register-password"
              {...registerField('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              error={!!errors.password}
              aria-describedby={errors.password ? 'register-password-error' : undefined}
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
            <p id="register-password-error" className={FIELD_ERROR_CLASS}>
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 py-2">
          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox
              {...registerField('terms')}
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? 'register-terms-error' : undefined}
              className="mt-px"
            />
            <span className="text-xs leading-5 text-auth-muted">
              I agree to the{' '}
              <Link to={ROUTES.TERMS} className="font-medium text-auth-navy underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to={ROUTES.PRIVACY} className="font-medium text-auth-navy underline">
                Privacy Policy
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
          className="h-[58px] justify-between rounded-[9px] bg-auth-navy px-5 hover:bg-auth-navy-hover"
        >
          Create new account
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-xs text-auth-muted">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-auth-navy hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
