import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
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
      <div className="flex flex-col items-start text-left">
        {/* Логотип по центру над формою */}
        <div className="mb-6 flex justify-center w-full">
          <img
            src="/logo-full.png"
            alt="VIRaTeC Global Network"
            className="w-auto h-auto max-w-[260px] max-h-[90px] object-contain"
          />
        </div>

        {/* Заголовок з потрібним шрифтом, жирністю 500 та вирівнюванням по лівому краю */}
        <h2
          className="text-[36px] font-medium text-slate-900 tracking-[-0.03em] leading-tight"
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          Get started
        </h2>

        <p className="mt-1.5 text-sm text-slate-500 font-normal">
          Create your profile to join the VIRaTeC research community.
        </p>
      </div>

      {/* Google OAuth Button */}
      <Button
        variant="outline"
        type="button"
        className="w-full justify-center font-normal text-slate-700 h-11 border-slate-200 hover:bg-slate-50"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
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
        <div className="space-y-1 mb-4">
          <label className="text-xs font-semibold text-slate-700 block mb-6">Full name</label>
          <Input
            {...registerField('name')}
            placeholder="Enter your full name"
            error={!!errors.name}
            className="h-8 text-sm"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email Address */}
        <div className="space-y-1 mb-4">
          <label className="text-xs font-semibold text-slate-700 block mb-6">Email address</label>
          <Input
            {...registerField('email')}
            type="email"
            placeholder="name@knu.ua"
            error={!!errors.email}
            className="h-8 text-sm"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1 mb-4">
          <label className="text-xs font-semibold text-slate-700 block mb-6">Password</label>
          <div className="relative">
            <Input
              {...registerField('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              error={!!errors.password}
              className="pr-10 h-8 text-sm"
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
        <div className="py-6">
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
        <Button
          type="submit"
          isLoading={isPending}
          disabled={isPending}
          className="w-full h-[66px] bg-[#082455] hover:bg-[#061c44] text-white font-medium rounded-[9px] px-[20px] flex items-center justify-between transition-colors mt-2"
        >
          <span className="text-base" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
            Create new account
          </span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </form>

      {/* Redirect to Login */}
      <p className=" text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-semibold text-slate-900 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
