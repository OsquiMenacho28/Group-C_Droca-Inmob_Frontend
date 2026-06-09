/**
 * Properties Module
 *
 * Property management functionality
 */

export { propertyService } from './services/propertyService';
export type {
  DocumentResponse,
  GenerateUploadUrlRequest,
  ImageResponse,
  GenerateImageUploadUrlRequest,
  ConfirmImageUploadRequest,
  SendPropertyPdfEmailPayload,
} from './services/propertyService';

export {
  propertySchema,
  propertyFiltersSchema,
  visitSchema,
  visitRequestSchema,
} from './schemas';
export type {
  PropertyFormValues,
  PropertyFiltersValues,
  VisitFormValues,
  VisitRequestFormValues,
} from './schemas';
