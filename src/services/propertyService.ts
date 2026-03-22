import { api } from './api'
import type { Property, PropertyFormPayload, PresignedUrlResponse, AssignAgentPayload } from '../types/property'

export const propertyService = {
  async getProperties() {
    const response = await api.get<Property[]>('/properties');
    return response.data;
  },

  async getPropertiesByAgent(agentId: string) {
    const response = await api.get<Property[]>(`/properties/agent/${agentId}`);
    return response.data;
  },

  async createProperty(payload: PropertyFormPayload) {
    // El backend usa @RequestHeader("X-Auth-User-Id"), que ya manejas en el Gateway/Interceptor
    const response = await api.post<Property>('/properties', payload);
    return response.data;
  },

  async getUploadUrl(propertyId: string): Promise<PresignedUrlResponse> {
    const response = await api.post<PresignedUrlResponse>(`/properties/${propertyId}/images/upload`);
    return response.data;
  },

  async assignAgent(propertyId: string, payload: AssignAgentPayload) {
    const response = await api.patch<Property>(`/properties/${propertyId}/assign-agent`, payload);
    return response.data;
  }
}