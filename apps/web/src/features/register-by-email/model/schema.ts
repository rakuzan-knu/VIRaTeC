import { z } from 'zod';

export interface RegisterSchemaMessages {
  nameMin: string;
  invalidEmail: string;
  passwordMin: string;
  termsRequired: string;
}

export const createRegisterFormSchema = (messages: RegisterSchemaMessages) =>
  z.object({
    name: z.string().min(2, messages.nameMin),
    email: z.string().email(messages.invalidEmail),
    password: z.string().min(8, messages.passwordMin),
    terms: z.boolean().refine((val) => val === true, {
      message: messages.termsRequired,
    }),
  });

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterFormSchema>>;
