import { z } from 'zod';
import { SELF_ASSIGNABLE_ROLES } from '@viratec/contracts';

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
    role: z.enum(SELF_ASSIGNABLE_ROLES),
    password: z.string().min(8, messages.passwordMin),
    terms: z.boolean().refine((val) => val === true, {
      message: messages.termsRequired,
    }),
  });

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterFormSchema>>;
