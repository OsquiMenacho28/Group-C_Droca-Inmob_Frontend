import { z } from 'zod';
import i18n from '@/locales/i18n';

const { t } = i18n.global;

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, t('validation.emailRequired'))
    .email(t('validation.emailInvalid')),
  password: z.string().min(1, t('validation.passwordRequired')),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Change password validation schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, t('validation.currentPasswordRequired')),
    newPassword: z
      .string()
      .min(8, t('validation.passwordMin8'))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        t('validation.passwordComplexity')
      ),
    confirmPassword: z.string().min(1, t('validation.confirmPasswordRequired')),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t('validation.passwordsDontMatch'),
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
