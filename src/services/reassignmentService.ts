import { apiClient as api } from '@/api';
import type {
  ReassignmentSolicitation,
  ReassignmentRequest,
  ReassignmentResponseRequest,
  AvailableAgent,
} from '@/types/reassignment';

const reassignmentService = {
  async requestReassignment(
    visitId: string,
    payload: ReassignmentRequest
  ): Promise<ReassignmentSolicitation> {
    const response = await api.post(
      `/reassignments/visits/${visitId}/reassignment`,
      payload
    );
    return response.data.data;
  },

  async respondToRequest(
    requestId: string,
    payload: ReassignmentResponseRequest
  ): Promise<ReassignmentSolicitation> {
    const response = await api.put(
      `/reassignments/${requestId}/reply`,
      payload
    );
    return response.data.data;
  },

  async getReceivedRequests(): Promise<ReassignmentSolicitation[]> {
    const response = await api.get(`/reassignments/received`);
    return response.data.data;
  },

  async getPendingCount(): Promise<number> {
    const response = await api.get(`/reassignments/pending/count`);
    return response.data.data.pending;
  },

  async getAvailableAgents(): Promise<AvailableAgent[]> {
    const response = await api.get('/persons', {
      params: { type: 'EMPLOYEE', page: 0, pageSize: 100 },
    });
    // Mapping from Person profile to AvailableAgent
    interface RawPerson {
      authUserId?: string;
      id?: string;
      firstName?: string;
      lastName?: string;
      fullName?: string;
      email?: string;
    }
    const persons = (response.data.data as RawPerson[]) || [];
    return persons.map((p: RawPerson) => ({
      id: p.authUserId || p.id || '',
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      fullName: p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
      email: p.email || '',
    }));
  },

  async getSentRequests(): Promise<ReassignmentSolicitation[]> {
    const response = await api.get(`/reassignments/sent`);
    return response.data.data;
  },
};

export default reassignmentService;
