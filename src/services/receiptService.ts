import { apiClient as api } from '@/api';
import type { Receipt, ReceiptUploadPayload } from '@/types/receipt';

const BASE = '/operations';

const receiptService = {
  async attachReceipt(
    operationId: string,
    file: File,
    payload: ReceiptUploadPayload,
    onProgress?: (percent: number) => void
  ): Promise<Receipt> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('amount', String(payload.amount));
    formData.append('currency', payload.currency);
    formData.append('paymentDate', payload.paymentDate);
    formData.append('concept', payload.concept);

    const response = await api.post(
      `${BASE}/${operationId}/receipts`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
          ? (event) => {
              const percent = event.total
                ? Math.round((event.loaded * 100) / event.total)
                : 0;
              onProgress(percent);
            }
          : undefined,
      }
    );
    return response.data.data;
  },

  async listReceipts(operationId: string): Promise<Receipt[]> {
    const response = await api.get(`${BASE}/${operationId}/receipts`);
    return response.data.data;
  },

  async deleteReceipt(operationId: string, receiptId: string): Promise<void> {
    await api.delete(`${BASE}/${operationId}/receipts/${receiptId}`);
  },
};

export default receiptService;
