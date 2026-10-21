import { z } from 'zod';

export interface LoginSchemaMessages {
  invalidEmail: string;
  passwordMin: string;
}

export const createLoginFormSchema = (messages: LoginSchemaMessages) =>
  z.object({
    email: z.string().email(messages.invalidEmail),
    password: z.string().min(6, messages.passwordMin),
  });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>;
