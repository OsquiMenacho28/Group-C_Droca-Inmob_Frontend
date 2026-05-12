import { apiClient as api } from '@/api';

interface PersonProfile {
  id: string;
  [key: string]: unknown;
}

interface CreatePersonPayload {
  firstName: string;
  lastName: string;
  email: string;
  [key: string]: unknown;
}

interface ClientPayload {
  firstName: string;
  lastName: string;
  email: string;
  [key: string]: unknown;
}

export const personService = {
  async getPersonByAuthUserId(authUserId: string): Promise<PersonProfile> {
    try {
      const response = await api.get(`/persons/by-auth/${authUserId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching person by authUserId:', error);
      throw error;
    }
  },

  async createPerson(payload: CreatePersonPayload): Promise<PersonProfile> {
    try {
      console.log('Creating person with payload:', payload);
      const response = await api.post('/persons', payload);
      console.log('Person created successfully:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating person:', error);
      throw error;
    }
  },

  async updatePersonByAuthUserId(
    authUserId: string,
    payload: Record<string, unknown>
  ): Promise<PersonProfile> {
    try {
      const response = await api.put(`/persons/by-auth/${authUserId}`, payload);
      return response.data.data;
    } catch (error) {
      console.error('Error updating person by authUserId:', error);
      throw error;
    }
  },

  async deletePersonByAuthUserId(authUserId: string) {
    try {
      await api.delete(`/persons/by-auth/${authUserId}`);
    } catch (error) {
      console.error('Error deleting person by authUserId:', error);
      throw error;
    }
  },

  async getClientsForAgent() {
    const response = await api.get('/persons/agents/clients');
    return response.data.data;
  },

  async createClientForAgent(payload: ClientPayload) {
    const response = await api.post('/persons/agents/clients', payload);
    return response.data.data;
  },

  async updateClientForAgent(clientId: string, payload: ClientPayload) {
    const response = await api.put(`/persons/agents/clients/${clientId}`, payload);
    return response.data.data;
  },

  async getPreferences(id: string) {
    const response = await api.get(`/buscadores/${id}/preferencias`);
    return response.data.data;
  },

  async savePreferences(id: string, payload: any) {
    const response = await api.post(`/buscadores/${id}/preferencias`, payload);
    return response.data.data;
  },

  async updatePreferences(id: string, payload: any) {
    const response = await api.put(`/buscadores/${id}/preferencias`, payload);
    return response.data.data;
  },
};
