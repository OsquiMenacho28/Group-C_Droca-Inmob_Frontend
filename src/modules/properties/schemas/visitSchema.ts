import { z } from 'zod';
import i18n from '@/locales/i18n';

const { t } = i18n.global;

/**
 * Visit creation form validation schema
 */
export const visitSchema = z.object({
  propertyId: z.string().min(1, { message: t('scheduleVisit.propertyRequired') }),
  startTime: z.string().min(1, { message: t('scheduleVisit.startTimeRequired') }),
  endTime: z.string().min(1, { message: t('scheduleVisit.endTimeRequired') }),
  notes: z.string().optional(),
});

export type VisitFormValues = z.infer<typeof visitSchema>;

/**
 * Client visit request form validation schema
 */
export const visitRequestSchema = z.object({
  propertyId: z.string().min(1, { message: t('scheduleVisit.propertyRequired') }),
  preferredDateTime: z.string().min(1, { message: t('scheduleVisit.preferredDateTimeRequired') }),
  alternativeDateTime: z.string().optional(),
  message: z
    .string()
    .max(500, { message: t('scheduleVisit.messageMax500') })
    .optional(),
  clientName: z.string().min(1, { message: t('validation.firstNameRequired') }),
  clientEmail: z
    .string()
    .min(1, { message: t('validation.emailRequired') })
    .email({ message: t('validation.emailInvalid') }),
  clientPhone: z.string().optional(),
});

export type VisitRequestFormValues = z.infer<typeof visitRequestSchema>;
