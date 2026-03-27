// ============================================================
//  src/services/propertyService.ts
//  Llamadas a la API del property-service.
//  HU03: Propietario visualiza sus propiedades y visitas
// ============================================================

import { api } from './api'
import type { Property, PropertyFormPayload, PresignedUrlResponse, AssignAgentPayload } from '../types/property'

export const propertyService = {
  /**
   * Obtiene todas las propiedades (requiere rol ADMIN)
   */
  async getProperties() {
    const response = await api.get<Property[]>('/properties');
    return response.data;
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
   * Solo devuelve propiedades donde ownerId coincide con el usuario autenticado
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
   * Crea una nueva propiedad (requiere rol AGENT o ADMIN)
   */
  async createProperty(payload: PropertyFormPayload) {
    const response = await api.post<Property>('/properties', payload);
    return response.data;
  },

  /**
   * Genera URL prefirmada para subir imágenes
   */
  async getUploadUrl(propertyId: string): Promise<PresignedUrlResponse> {
    const response = await api.post<PresignedUrlResponse>(`/properties/${propertyId}/images/upload`);
    return response.data;
  },

  /**
   * Confirma la carga de imágenes para una propiedad
   */
  async confirmImages(propertyId: string, urls: string[]) {
    const response = await api.post<Property>(`/properties/${propertyId}/images/confirm`, urls);
    return response.data;
  },

  /**
   * Actualiza el precio de una propiedad (requiere rol ADMIN)
   */
  async updatePrice(propertyId: string, newPrice: number) {
    const response = await api.patch<Property>(`/properties/${propertyId}/price`, { newPrice });
    return response.data;
  },

  /**
   * Asigna un agente a una propiedad (requiere rol ADMIN)
   */
  async assignAgent(propertyId: string, payload: AssignAgentPayload) {
    const response = await api.patch<Property>(`/properties/${propertyId}/assign-agent`, payload);
    return response.data;
  },

  /**
   * Busca propiedades por término (título o dirección)
   */
  async searchProperties(term: string) {
    const response = await api.get<Property[]>(`/properties/search?term=${encodeURIComponent(term)}`);
    return response.data;
  },

  /**
   * Asigna un propietario a una propiedad (requiere rol ADMIN)
   */
  async assignOwner(propertyId: string, payload: { ownerId: string }) {
    const response = await api.patch<Property>(`/properties/${propertyId}/assign-owner`, payload);
    return response.data;
  }
}