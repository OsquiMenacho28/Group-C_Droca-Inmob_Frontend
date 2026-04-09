// ============================================================
//  src/services/propertyService.ts
//  Llamadas a la API del property-service.
//  Refactored: Gestión de imágenes por ID para evitar errores de Gateway (//)
// ============================================================

import { api } from './api'
import type { Property, PropertyFormPayload, AssignAgentPayload, OperationType } from '../types/property'

// --- Document Interfaces ---
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

// --- Image Interfaces ---
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

  // ============================================================
  // PROPERTY AGGREGATE ROOT (CRUD & Lifecycle)
  // ============================================================

  /**
   * Obtiene todas las propiedades (requiere rol ADMIN)
   */
  async getProperties(filters?: { title?: string; operationType?: string; status?: string; agentId?: string }) {
    try {
      const response = await api.get('/properties', { params: filters });
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        return response.data.content;
      } else {
        console.warn('Formato de respuesta no reconocido:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  /**
   * Obtiene las propiedades asignadas a un agente específico
   */
  async getPropertiesByAgent(agentId: string) {
    const response = await api.get<Property[]>(`/properties/agent/${agentId}`);
    return response.data;
  },

  /**
   * Obtiene las propiedades de un propietario (HU03)
   */
  async getPropertiesByOwner(ownerId: string) {
    const response = await api.get<Property[]>(`/properties/owner/${ownerId}`);
    return response.data;
  },

  /**
   * Obtiene una propiedad por su ID
   */
  async getPropertyById(id: string): Promise<Property> {
    const response = await api.get<Property>(`/properties/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva propiedad
   */
  async createProperty(payload: PropertyFormPayload) {
    const response = await api.post<Property>('/properties', payload);
    return response.data;
  },

  /**
   * Actualiza el precio de una propiedad (Admin)
   */
  async updatePrice(propertyId: string, newPrice: number) {
    const response = await api.patch<Property>(`/properties/${propertyId}/price`, { newPrice });
    return response.data;
  },

  /**
   * Asigna un agente a una propiedad (Admin)
   */
  async assignAgent(propertyId: string, payload: AssignAgentPayload) {
    const response = await api.patch<Property>(`/properties/${propertyId}/assign-agent`, payload);
    return response.data;
  },

  /**
   * Asigna un propietario a una propiedad (Admin)
   */
  async assignOwner(propertyId: string, payload: { ownerId: string }) {
    const response = await api.patch<Property>(`/properties/${propertyId}/assign-owner`, payload);
    return response.data;
  },
  
  /**
   * Actualiza el tipo de operación (Admin)
   */
  async updateOperationType(propertyId: string, operationType: OperationType) {
    const response = await api.patch<Property>(`/properties/${propertyId}/operation-type`, { operationType });
    return response.data;
  },

  /**
   * Elimina una propiedad y sus recursos asociados
   */
  async deleteProperty(propertyId: string): Promise<void> {
    await api.delete(`/properties/${propertyId}`);
  },

  // ============================================================
  // IMAGE SUB-RESOURCE
  // ============================================================

  /**
   * Genera URL prefirmada para subir una imagen.
   */
  async generateImageUploadUrl(propertyId: string, file: File): Promise<{ uploadUrl: string; publicUrl: string; objectKey: string }> {
    const response = await api.post(`/properties/${propertyId}/images/upload-url`, { 
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
    });
    return response.data;
  },

  /**
   * Confirma la subida de una imagen y adjunta metadatos.
   */
  async confirmImageUpload(propertyId: string, payload: ConfirmImageUploadRequest): Promise<Property> {
      const response = await api.post(`/properties/${propertyId}/images/confirm`, payload);
      return response.data;
  },

  /**
   * Obtiene todas las imágenes de una propiedad con URLs temporales.
   */
  async getPropertyImages(propertyId: string): Promise<ImageResponse[]> {
    const response = await api.get(`/properties/${propertyId}/images`);
    return response.data;
  },

  /**
   * ELIMINACIÓN SEGURA: Usa el ID de la imagen en lugar de la URL completa.
   * Esto evita el error de "//" en el API Gateway.
   */
  async deleteImage(propertyId: string, imageId: string): Promise<void> {
    await api.delete(`/properties/${propertyId}/images/${imageId}`);
  },

  /**
   * Reordena las imágenes de la propiedad.
   */
  async reorderImages(propertyId: string, orderedImageIds: string[]): Promise<ImageResponse[]> {
    const response = await api.post(`/properties/${propertyId}/images/reorder`, orderedImageIds);
    return response.data;
  },

  // ============================================================
  // DOCUMENT MANAGEMENT (US1 & US2)
  // ============================================================

  async generateDocumentUploadUrl(request: GenerateUploadUrlRequest): Promise<{ uploadUrl: string; objectKey: string; publicUrl: string; expiresInSeconds: string }> {
    const response = await api.post('/documents/upload-url', request);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Property> {
    const response = await api.patch<Property>(`/properties/${id}/status`, { status });
    return response.data;
  },

  async getStatusHistory(id: string): Promise<any[]> {
    const response = await api.get(`/properties/${id}/status-history`);
    return response.data;
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
      mimeType
    });
    return response.data;
  },

  async getPropertyDocuments(propertyId: string): Promise<DocumentResponse[]> {
    const response = await api.get(`/documents/property/${propertyId}`);
    return response.data;
  },

  async updateDocumentPermissions(documentId: string, accessPolicy: string[]): Promise<DocumentResponse> {
    const response = await api.patch(`/documents/${documentId}/permissions`, { documentId, accessPolicy });
    return response.data;
  },

  async refreshDownloadUrl(documentId: string): Promise<{ temporaryDownloadUrl: string; expiresInSeconds: string }> {
    const response = await api.post(`/documents/${documentId}/refresh-url`);
    return response.data;
  },

  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}`);
  },

  async updateProperty(propertyId: string, payload: any) {
    const response = await api.put(`/properties/${propertyId}`, payload);
    return response.data;
  },

  async uploadExclusivityContract(propertyId: string, file: File): Promise<DocumentResponse> {
    const { uploadUrl, objectKey } = await this.generateDocumentUploadUrl({
      propertyId,
      documentType: 'EXCLUSIVITY_CONTRACT',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    });
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
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
};