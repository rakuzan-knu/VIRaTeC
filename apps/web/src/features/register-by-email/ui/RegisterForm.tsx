import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { GoogleIcon } from '@/shared/ui/google-icon';
import { registerFormSchema, type RegisterFormValues } from '../model/schema';
import { useRegister } from '../model/useRegister';

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

  const onSubmit = (data: RegisterFormValues) => {
    register(data);
  };

  // Вилучення повідомлень про помилки сервера (400, 409 або мережа)
  const serverErrorMessage = (() => {
    if (!error) return null;
    const status = (error as any)?.status || (error as any)?.response?.status;
    if (status === 409) return 'An account with this email address already exists.';
    if (status === 400)
      return (error as any)?.message || 'Invalid registration data. Please check your inputs.';
    return (error as any)?.message || 'An unexpected error occurred. Please try again later.';
  })();

  return (
    <div className="w-full space-y-6">
      {/* Header Logo & Titles */}
      <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            V
          </div>
          <span className="font-semibold text-slate-800 tracking-wide text-lg">VIRaTeC</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Get started</h2>
        <p className="mt-2 text-sm text-slate-500">
          Create your profile to join the VIRaTeC research community.
        </p>
      </div>

      {/* Google OAuth Button */}
      <Button variant="outline" type="button" className="font-normal text-slate-700 h-11">
        <GoogleIcon className="mr-2" />
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
          OR
        </span>
      </div>

      {/* Global Server Error Alert */}
      {serverErrorMessage && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {serverErrorMessage}
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Full name</label>
          <Input
            {...registerField('name')}
            placeholder="Enter your full name"
            error={!!errors.name}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Email address</label>
          <Input
            {...registerField('email')}
            type="email"
            placeholder="name@knu.ua"
            error={!!errors.email}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Password</label>
          <div className="relative">
            <Input
              {...registerField('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              error={!!errors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {/* Terms Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox {...registerField('terms')} className="mt-0.5" />
            <span className="text-xs text-slate-500 leading-tight">
              I agree to the{' '}
              <Link to={ROUTES.TERMS} className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to={ROUTES.PRIVACY} className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms.message}</p>}
        </div>

        {/* Submit Button */}
        <Button type="submit" isLoading={isPending} disabled={isPending} className="mt-2">
          Create new account
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {/* Redirect to Login */}
      <p className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-semibold text-slate-900 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
