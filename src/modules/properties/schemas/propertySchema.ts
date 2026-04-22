import { z } from 'zod';
import i18n from '@/locales/i18n';

/**
 * Property form validation schema
 */
export const propertySchema = z.object({
  title: z
    .string()
    .min(1, i18n.global.t('validation.titleRequired'))
    .min(5, i18n.global.t('validation.titleMin5'))
    .max(100, i18n.global.t('validation.titleMax100')),
  address: z.string().min(1, i18n.global.t('validation.addressRequired')),
  zone: z.string().min(1, i18n.global.t('validation.zoneRequired')),
  price: z.number().min(0.01, i18n.global.t('validation.priceMin')),
  type: z.string().min(1, i18n.global.t('validation.propertyTypeRequired')),
  operationType: z.string().refine((val) => ['VENTA', 'ALQUILER', 'ANTICRETICO'].includes(val), {
    message: i18n.global.t('validation.operationTypeRequired'),
  }),
  m2: z.number().min(1, i18n.global.t('validation.min1m2')),
  rooms: z
    .number()
    .int(i18n.global.t('validation.roomsWhole'))
    .min(0, i18n.global.t('validation.roomsNegative')),
  ownerId: z.string().nullable().optional(),
  imageUrls: z.array(z.string()).optional(),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

/**
 * Property filters schema (for search/filter forms)
 */
export const propertyFiltersSchema = z.object({
  operationType: z.enum(['VENTA', 'ALQUILER', 'ANTICRETICO']).optional(),
  type: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minRooms: z.number().int().min(0).optional(),
  maxRooms: z.number().int().min(0).optional(),
  minM2: z.number().min(0).optional(),
  maxM2: z.number().min(0).optional(),
});

export type PropertyFiltersValues = z.infer<typeof propertyFiltersSchema>;
