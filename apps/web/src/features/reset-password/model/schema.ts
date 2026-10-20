import { z } from 'zod';

export const requestCodeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type RequestCodeValues = z.infer<typeof requestCodeSchema>;

export const verifyCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export type VerifyCodeValues = z.infer<typeof verifyCodeSchema>;

export const PASSWORD_RULES = [
  { label: '8+ characters', test: (value: string) => value.length >= 8 },
  { label: 'Uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'Number', test: (value: string) => /\d/.test(value) },
] as const;

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Add at least one uppercase letter')
      .regex(/\d/, 'Add at least one number'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
