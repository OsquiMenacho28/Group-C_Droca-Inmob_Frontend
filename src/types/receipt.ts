export interface Receipt {
  id: string;
  operationId: string;
  amount: number;
  currency: string;
  paymentDate: string;
  concept: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedByAgentId: string;
  uploadedAt: string;
  downloadUrl: string;
}

export interface ReceiptUploadPayload {
  amount: number;
  currency: string;
  paymentDate: string;
  concept: string;
}

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const ALLOWED_TYPE_LABELS = 'PDF, JPEG, PNG, or WebP';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const CURRENCY_OPTIONS = [
  { code: 'BOB', label: 'BOB — Boliviano' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
];
