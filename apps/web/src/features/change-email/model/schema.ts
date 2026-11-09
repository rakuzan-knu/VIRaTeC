import { z } from 'zod';

const CODE_MIN_LENGTH = 6;

export interface ChangeEmailSchemaMessages {
  invalidEmail: string;
  passwordRequired: string;
  codeRequired: string;
}

interface ChangeEmailRequirements {
  hasPassword: boolean;
  twoFactorEnabled: boolean;
}

export const createChangeEmailSchema = (
  messages: ChangeEmailSchemaMessages,
  { hasPassword, twoFactorEnabled }: ChangeEmailRequirements,
) =>
  z.object({
    newEmail: z.string().trim().email(messages.invalidEmail),
    password: hasPassword ? z.string().min(1, messages.passwordRequired) : z.string(),
    code: twoFactorEnabled
      ? z.string().trim().min(CODE_MIN_LENGTH, messages.codeRequired)
      : z.string(),
  });

export type ChangeEmailFormValues = z.infer<ReturnType<typeof createChangeEmailSchema>>;
