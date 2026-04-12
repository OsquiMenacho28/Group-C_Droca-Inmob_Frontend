import { ref } from 'vue';
import receiptService from '@/services/receiptService';
import type { Receipt, ReceiptUploadPayload } from '@/types/receipt';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_TYPE_LABELS,
} from '@/types/receipt';

export function useReceipts(operationId: string) {
  const receipts = ref<Receipt[]>([]);
  const loading = ref(false);
  const uploading = ref(false);
  const uploadProgress = ref(0);
  const error = ref<string | null>(null);
  const uploadError = ref<string | null>(null);

  /** Fetches all receipts for the operation. */
  async function loadReceipts() {
    loading.value = true;
    error.value = null;
    try {
      receipts.value = await receiptService.listReceipts(operationId);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      error.value =
        errorObj?.response?.data?.error ?? 'Failed to load receipts.';
    } finally {
      loading.value = false;
    }
  }

  /**
   * Validates file on the client side first, then uploads.
   * Returns true on success, false on error.
   */
  async function attachReceipt(
    file: File,
    payload: ReceiptUploadPayload
  ): Promise<boolean> {
    uploadError.value = null;

    const validationError = validateFile(file);
    if (validationError) {
      uploadError.value = validationError;
      return false;
    }

    uploading.value = true;
    uploadProgress.value = 0;

    try {
      const newReceipt = await receiptService.attachReceipt(
        operationId,
        file,
        payload,
        (percent) => {
          uploadProgress.value = percent;
        }
      );
      receipts.value = [newReceipt, ...receipts.value];
      return true;
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      uploadError.value =
        errorObj?.response?.data?.error ??
        'Failed to upload the receipt. Please try again.';
      return false;
    } finally {
      uploading.value = false;
      uploadProgress.value = 0;
    }
  }

  /** Deletes a receipt from the list and from the server. */
  async function deleteReceipt(receiptId: string): Promise<boolean> {
    error.value = null;
    try {
      await receiptService.deleteReceipt(operationId, receiptId);
      receipts.value = receipts.value.filter((r) => r.id !== receiptId);
      return true;
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      error.value =
        errorObj?.response?.data?.error ?? 'Failed to delete the receipt.';
      return false;
    }
  }

  /**
   * Returns a user-friendly error message if the file is invalid, or null if valid.
   * Mirrors the backend validation in MinioStorageService.
   */
  function validateFile(file: File): string | null {
    if (
      !ALLOWED_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_MIME_TYPES)[number]
      )
    ) {
      return `Invalid file format. Only ${ALLOWED_TYPE_LABELS} files are accepted.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return `File is too large (${mb} MB). Maximum allowed size is 10 MB.`;
    }
    return null;
  }

  return {
    receipts,
    loading,
    uploading,
    uploadProgress,
    error,
    uploadError,
    loadReceipts,
    attachReceipt,
    deleteReceipt,
    validateFile,
  };
}
