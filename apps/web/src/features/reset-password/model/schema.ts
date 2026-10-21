import { z } from 'zod';

export interface ResetPasswordSchemaMessages {
  invalidEmail: string;
  invalidCode: string;
  passwordMin: string;
  passwordUppercase: string;
  passwordNumber: string;
  passwordsMismatch: string;
}

export const createRequestCodeSchema = (messages: ResetPasswordSchemaMessages) =>
  z.object({
    email: z.string().email(messages.invalidEmail),
  });

export type RequestCodeValues = z.infer<ReturnType<typeof createRequestCodeSchema>>;

export const createVerifyCodeSchema = (messages: ResetPasswordSchemaMessages) =>
  z.object({
    code: z.string().regex(/^\d{6}$/, messages.invalidCode),
  });

export type VerifyCodeValues = z.infer<ReturnType<typeof createVerifyCodeSchema>>;

export type PasswordRuleId = 'length' | 'uppercase' | 'number';

export const PASSWORD_RULES: { id: PasswordRuleId; test: (value: string) => boolean }[] = [
  { id: 'length', test: (value) => value.length >= 8 },
  { id: 'uppercase', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', test: (value) => /\d/.test(value) },
];

export const createNewPasswordSchema = (messages: ResetPasswordSchemaMessages) =>
  z
    .object({
      password: z
        .string()
        .min(8, messages.passwordMin)
        .regex(/[A-Z]/, messages.passwordUppercase)
        .regex(/\d/, messages.passwordNumber),
      confirmPassword: z.string(),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: messages.passwordsMismatch,
      path: ['confirmPassword'],
    });

export type NewPasswordValues = z.infer<ReturnType<typeof createNewPasswordSchema>>;
