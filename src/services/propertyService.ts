import { api } from './api'
import type { Property, AssignAgentPayload } from '../types/property'

export const propertyService = {
  async getProperties() {
    const response = await api.get<Property[]>('/properties');
    return response.data;
  },

  async getPropertiesByAgent(agentId: string) {
    const response = await api.get<Property[]>(`/properties/agent/${agentId}`);
    return response.data;
  },

  async assignAgent(propertyId: string, payload: AssignAgentPayload) {
    // Este endpoint coincide con el PATCH que creamos en el backend
    const response = await api.patch<Property>(`/properties/${propertyId}/assign-agent`, payload);
    return response.data;
  }
}