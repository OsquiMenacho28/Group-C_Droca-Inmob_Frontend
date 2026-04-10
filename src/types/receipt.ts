// src/types/receipt.ts
// TypeScript types for the Payment Receipt User Story

export interface Receipt {
  id: string
  operationId: string
  amount: number
  currency: string
  paymentDate: string        // ISO-8601 datetime string
  concept: string
  originalFileName: string
  contentType: string
  fileSizeBytes: number
  uploadedByAgentId: string
  uploadedAt: string         // ISO-8601 datetime string
  downloadUrl: string        // Pre-signed MinIO URL (valid 1 hour)
}

export interface ReceiptUploadPayload {
  amount: number
  currency: string
  paymentDate: string        // ISO-8601 datetime string
  concept: string
}

/** Allowed MIME types — enforced on both frontend and backend */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]

/** Human-readable labels for allowed types (used in error messages) */
export const ALLOWED_TYPE_LABELS = 'PDF, JPEG, PNG, or WebP'

/** Maximum file size: 10 MB */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

/** ISO 4217 currency options available in the form */
export const CURRENCY_OPTIONS = [
  { code: 'BOB', label: 'BOB — Boliviano' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
]
