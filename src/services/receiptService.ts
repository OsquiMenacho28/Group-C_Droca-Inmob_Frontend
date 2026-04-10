// src/services/receiptService.ts
// Consumes the receipt endpoints from the operation-service (port 8086).
// Uses the project's shared axios instance with the JWT auth interceptor.

import { api } from "./api"; // existing axios instance with baseURL + JWT interceptor
import type { Receipt, ReceiptUploadPayload } from "../types/receipt";

const BASE = "/api/operations";

const receiptService = {
  /**
   * POST /api/operations/{operationId}/receipts
   *
   * Sends the file and metadata as multipart/form-data.
   * Progress tracking is supported via the onUploadProgress callback.
   *
   * @param operationId   Target operation
   * @param file          The PDF / image file to upload
   * @param payload       amount, currency, paymentDate, concept
   * @param onProgress    Optional callback receiving upload percentage (0–100)
   */
  async attachReceipt(
    operationId: string,
    file: File,
    payload: ReceiptUploadPayload,
    onProgress?: (percent: number) => void,
  ): Promise<Receipt> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("amount", String(payload.amount));
    formData.append("currency", payload.currency);
    formData.append("paymentDate", payload.paymentDate);
    formData.append("concept", payload.concept);

    const { data } = await api.post<Receipt>(
      `${BASE}/${operationId}/receipts`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: onProgress
          ? (event) => {
              const percent = event.total
                ? Math.round((event.loaded * 100) / event.total)
                : 0;
              onProgress(percent);
            }
          : undefined,
      },
    );
    return data;
  },

  /**
   * GET /api/operations/{operationId}/receipts
   *
   * Returns all receipts for the given operation,
   * each containing a pre-signed MinIO download URL.
   */
  async listReceipts(operationId: string): Promise<Receipt[]> {
    const { data } = await api.get<Receipt[]>(
      `${BASE}/${operationId}/receipts`,
    );
    return data;
  },

  /**
   * DELETE /api/operations/{operationId}/receipts/{receiptId}
   *
   * Deletes the receipt document and removes the file from MinIO.
   */
  async deleteReceipt(operationId: string, receiptId: string): Promise<void> {
    await api.delete(`${BASE}/${operationId}/receipts/${receiptId}`);
  },
};

export default receiptService;
