import { api } from './api';
import type { Receipt, ReceiptUploadPayload } from '@/types/receipt';

const BASE = '/api/operations';

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

    const { data } = await api.post<Receipt>(
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
    return data;
  },

  async listReceipts(operationId: string): Promise<Receipt[]> {
    const { data } = await api.get<Receipt[]>(
      `${BASE}/${operationId}/receipts`
    );
    return data;
  },

  async deleteReceipt(operationId: string, receiptId: string): Promise<void> {
    await api.delete(`${BASE}/${operationId}/receipts/${receiptId}`);
  },
};

export default receiptService;
