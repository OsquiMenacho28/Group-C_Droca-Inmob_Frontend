import { z } from 'zod';
import i18n from '@/locales/i18n';

/**
 * Base user form validation schema (core fields always required)
 */
export const baseUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, i18n.global.t('validation.firstNameRequired'))
    .min(2, i18n.global.t('validation.min2Chars')),
  lastName: z
    .string()
    .trim()
    .min(1, i18n.global.t('validation.lastNameRequired'))
    .min(2, i18n.global.t('validation.min2Chars')),
  email: z
    .string()
    .min(1, i18n.global.t('validation.emailRequired'))
    .email(i18n.global.t('validation.emailInvalid')),
  phone: z.string().min(1, i18n.global.t('validation.phoneRequired')),
  birthDate: z.string().min(1, i18n.global.t('validation.birthDateRequired')),
  userType: z.enum(['ADMIN', 'EMPLOYEE', 'OWNER', 'INTERESTED_CLIENT']),
});

/**
 * Employee-specific fields (required when userType is EMPLOYEE)
 */
export const employeeFields = z.object({
  department: z
    .string()
    .trim()
    .min(1, i18n.global.t('validation.departmentRequired'))
    .min(2, i18n.global.t('validation.min2Chars')),
  position: z
    .string()
    .trim()
    .min(1, i18n.global.t('validation.positionRequired'))
    .min(2, i18n.global.t('validation.min2Chars')),
  hireDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const hireDate = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return hireDate <= today;
      },
      { message: i18n.global.t('validation.hireDateFuture') }
    ),
});

/**
 * Owner-specific fields (required when userType is OWNER)
 */
export const ownerFields = z.object({
  taxId: z
    .string()
    .trim()
    .min(1, i18n.global.t('validation.taxIdRequired'))
    .min(7, i18n.global.t('validation.taxIdMin'))
    .max(10, i18n.global.t('validation.taxIdMax'))
    .regex(/^\d{7,10}$/, i18n.global.t('validation.taxIdDigits')),
});

/**
 * Client preferences (all optional)
 */
export const clientPreferencesSchema = z.object({
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).optional(),
  budget: z.string().optional(),
  preferredZone: z.string().optional(),
  preferredPropertyType: z.string().optional(),
  preferredRooms: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .refine(
      (val) => {
        if (val === null || val === undefined || val === '') return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      { message: i18n.global.t('validation.invalidRooms') }
    ),
});

/**
 * Complete user schema with conditional validation using superRefine
 */
export const userSchema = baseUserSchema
  .extend({
    department: z.string().optional(),
    position: z.string().optional(),
    hireDate: z.string().optional(),
    taxId: z.string().optional(),
    preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).optional(),
    budget: z.string().optional(),
    preferredZone: z.string().optional(),
    preferredPropertyType: z.string().optional(),
    preferredRooms: z.union([z.number(), z.string(), z.null()]).optional(),
    assignedAgentId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.userType === 'EMPLOYEE') {
      const employeeResult = employeeFields.safeParse({
        department: data.department,
        position: data.position,
        hireDate: data.hireDate,
      });

      if (!employeeResult.success) {
        for (const error of employeeResult.error.issues) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: error.message,
            path: error.path,
          });
        }
      }
    }

    if (data.userType === 'OWNER') {
      const ownerResult = ownerFields.safeParse({
        taxId: data.taxId,
      });

      if (!ownerResult.success) {
        for (const error of ownerResult.error.issues) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: error.message,
            path: error.path,
          });
        }
      }
    }

    if (
      data.preferredRooms !== null &&
      data.preferredRooms !== undefined &&
      data.preferredRooms !== ''
    ) {
      const rooms = Number(data.preferredRooms);
      if (isNaN(rooms) || rooms < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: i18n.global.t('validation.invalidRooms'),
          path: ['preferredRooms'],
        });
      }
    }
  });

export type UserFormValues = z.infer<typeof userSchema>;
export type EmployeeFormValues = z.infer<typeof employeeFields>;
export type OwnerFormValues = z.infer<typeof ownerFields>;
export type ClientPreferencesValues = z.infer<typeof clientPreferencesSchema>;
