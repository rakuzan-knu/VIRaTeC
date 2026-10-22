import { z } from 'zod';
import { PROFILE_LIMITS } from '@viratec/contracts';

export interface ChangePasswordSchemaMessages {
  currentRequired: string;
  passwordMin: string;
  passwordsMismatch: string;
  sameAsCurrent: string;
}

export const createChangePasswordSchema = (
  messages: ChangePasswordSchemaMessages,
  requiresCurrent: boolean,
) =>
  z
    .object({
      currentPassword: z.string(),
      newPassword: z.string().min(PROFILE_LIMITS.passwordMin, messages.passwordMin),
      confirmPassword: z.string(),
    })
    .superRefine((values, ctx) => {
      if (requiresCurrent && values.currentPassword === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['currentPassword'],
          message: messages.currentRequired,
        });
      }
      if (requiresCurrent && values.currentPassword === values.newPassword) {
        ctx.addIssue({ code: 'custom', path: ['newPassword'], message: messages.sameAsCurrent });
      }
      if (values.newPassword !== values.confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: messages.passwordsMismatch,
        });
      }
    });

export type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>;
