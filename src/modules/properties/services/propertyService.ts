import { apiClient as api } from '@/api';
import type {
  Property,
  PropertyFormPayload,
  AssignAgentPayload,
  OperationType,
} from '@/types/property';

export interface DocumentResponse {
  id: string;
  documentType: string;
  originalFileName: string;
  objectKey: string;
  publicUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REJECTED';
  accessPolicy: string[];
  validUntil?: string;
  temporaryDownloadUrl?: string;
  expiresInSeconds: number;
}

export interface GenerateUploadUrlRequest {
  propertyId: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
}

export interface ImageResponse {
  id: string;
  originalFileName: string;
  objectKey: string;
  publicUrl: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  isPrimary: boolean;
  displayOrder: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  status: string;
  accessPolicy: string[];
  temporaryDownloadUrl?: string;
  expiresInSeconds: number;
}

export interface GenerateImageUploadUrlRequest {
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}

export interface ConfirmImageUploadRequest {
  objectKey: string;
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;
  isPrimary?: boolean;
}

export const propertyService = {
  async getProperties(filters?: {
    title?: string;
    type?: string;
    zone?: string;
    operationType?: string;
    status?: string;
    agentId?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    try {
      const response = await api.get('/properties', { params: filters });
      return response.data; // Return the whole ApiResponse object
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  async getPropertiesByAgent(agentId: string) {
    const response = await api.get(`/properties/agent/${agentId}`);
    return response.data.data;
  },

  async getPropertiesByOwner(ownerId: string) {
    const response = await api.get(`/properties/owner/${ownerId}`);
    return response.data.data;
  },

  async getPropertyById(id: string): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response.data.data;
  },

  async createProperty(payload: PropertyFormPayload) {
    const response = await api.post('/properties', payload);
    return response.data.data;
  },

  async updatePrice(propertyId: string, newPrice: number) {
    const response = await api.patch(`/properties/${propertyId}/price`, { newPrice });
    return response.data.data;
  },

  async assignAgent(propertyId: string, payload: AssignAgentPayload) {
    const response = await api.patch(`/properties/${propertyId}/assign-agent`, payload);
    return response.data.data;
  },

  async assignOwner(propertyId: string, payload: { ownerId: string }) {
    const response = await api.patch(`/properties/${propertyId}/assign-owner`, payload);
    return response.data.data;
  },

  async updateOperationType(propertyId: string, operationType: OperationType) {
    const response = await api.patch(`/properties/${propertyId}/operation-type`, {
      operationType,
    });
    return response.data.data;
  },

  async deleteProperty(propertyId: string): Promise<void> {
    await api.delete(`/properties/${propertyId}`);
  },

  async generateImageUploadUrl(
    propertyId: string,
    file: File
  ): Promise<{ uploadUrl: string; publicUrl: string; objectKey: string }> {
    const response = await api.post(`/properties/${propertyId}/images/upload-url`, {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
    return response.data.data;
  },

  async confirmImageUpload(
    propertyId: string,
    payload: ConfirmImageUploadRequest
  ): Promise<Property> {
    const response = await api.post(`/properties/${propertyId}/images/confirm`, payload);
    return response.data.data;
  },

  async getPropertyImages(propertyId: string): Promise<ImageResponse[]> {
    const response = await api.get(`/properties/${propertyId}/images`);
    return response.data.data;
  },

  async deleteImage(propertyId: string, imageId: string): Promise<void> {
    await api.delete(`/properties/${propertyId}/images/${imageId}`);
  },

  async reorderImages(propertyId: string, orderedImageIds: string[]): Promise<ImageResponse[]> {
    const response = await api.post(`/properties/${propertyId}/images/reorder`, orderedImageIds);
    return response.data.data;
  },

  async generateDocumentUploadUrl(request: GenerateUploadUrlRequest): Promise<{
    uploadUrl: string;
    objectKey: string;
    publicUrl: string;
    expiresInSeconds: string;
  }> {
    const response = await api.post('/documents/upload-url', request);
    return response.data.data;
  },

  async updateStatus(id: string, status: string): Promise<Property> {
    const response = await api.patch(`/properties/${id}/status`, {
      status,
    });
    return response.data.data;
  },

  async getStatusHistory(id: string): Promise<Record<string, unknown>[]> {
    const response = await api.get(`/properties/${id}/status-history`);
    return response.data.data;
  },

  async confirmDocumentUpload(
    propertyId: string,
    documentType: string,
    objectKey: string,
    originalFileName: string,
    fileSize?: number,
    mimeType?: string
  ): Promise<DocumentResponse> {
    const response = await api.post('/documents/confirm', {
      propertyId,
      documentType,
      objectKey,
      originalFileName,
      fileSize,
      mimeType,
    });
    return response.data.data;
  },

  async getPropertyDocuments(propertyId: string): Promise<DocumentResponse[]> {
    const response = await api.get(`/documents/property/${propertyId}`);
    return response.data.data;
  },

  async updateDocumentPermissions(
    documentId: string,
    accessPolicy: string[]
  ): Promise<DocumentResponse> {
    const response = await api.patch(`/documents/${documentId}/permissions`, {
      documentId,
      accessPolicy,
    });
    return response.data.data;
  },

  async refreshDownloadUrl(
    documentId: string
  ): Promise<{ temporaryDownloadUrl: string; expiresInSeconds: string }> {
    const response = await api.post(`/documents/${documentId}/refresh-url`);
    return response.data.data;
  },

  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}`);
  },

  async updateProperty(propertyId: string, payload: Partial<PropertyFormPayload>) {
    const response = await api.put(`/properties/${propertyId}`, payload);
    return response.data.data;
  },

  async updatePropertyAsAgent(propertyId: string, payload: Partial<PropertyFormPayload>) {
    const response = await api.patch(`/properties/${propertyId}/agent-update`, payload);
    return response.data.data;
  },

  async uploadExclusivityContract(propertyId: string, file: File): Promise<DocumentResponse> {
    const { uploadUrl, objectKey } = await this.generateDocumentUploadUrl({
      propertyId,
      documentType: 'EXCLUSIVITY_CONTRACT',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Error al subir el archivo: ${uploadResponse.statusText}`);
    }

    return await this.confirmDocumentUpload(
      propertyId,
      'EXCLUSIVITY_CONTRACT',
      objectKey,
      file.name,
      file.size,
      file.type
    );
  },

  async updateLocation(propertyId: string, latitude: number, longitude: number) {
    const response = await api.patch(`/properties/${propertyId}/location`, {
      latitude,
      longitude,
    });
    return response.data.data;
  },
};

export { propertyService as default };
