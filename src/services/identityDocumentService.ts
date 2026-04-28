import { apiClient as api } from '@/api';
import type { ApiResponse } from '@/api/types';

export type IdentityDocumentType = 'ID_CARD' | 'PASSPORT' | 'OTHER';

export interface IdentityDocument {
  id: string;
  personId: string;
  documentType: IdentityDocumentType;
  fileUrl: string;
  originalFileName?: string;
  uploadDate: string;
  uploadedById: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export const identityDocumentService = {
  async getDocuments(personId: string): Promise<IdentityDocument[]> {
    const response = await api.get<ApiResponse<IdentityDocument[]>>(
      `/persons/${personId}/documents`
    );
    return response.data.data || [];
  },

  async uploadDocument(
    personId: string,
    documentType: IdentityDocumentType,
    file: File
  ): Promise<IdentityDocument> {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    const response = await api.post<ApiResponse<IdentityDocument>>(
      `/persons/${personId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  },

  async deleteDocument(personId: string, documentId: string): Promise<void> {
    await api.delete(`/persons/${personId}/documents/${documentId}`);
  },
};
