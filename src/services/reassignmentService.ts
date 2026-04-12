import { api } from './api';
import type {
  ReassignmentSolicitation,
  ReassignmentRequest,
  ReassignmentResponseRequest,
  PendingCount,
  AvailableAgent,
} from '@/types/reassignment';

const BASE = '/api';

const reassignmentService = {
  async requestReassignment(
    visitId: string,
    payload: ReassignmentRequest
  ): Promise<ReassignmentSolicitation> {
    const { data } = await api.post<ReassignmentSolicitation>(
      `${BASE}/visits/${visitId}/reassignment`,
      payload
    );
    return data;
  },

  async respondToRequest(
    requestId: string,
    payload: ReassignmentResponseRequest
  ): Promise<ReassignmentSolicitation> {
    const { data } = await api.put<ReassignmentSolicitation>(
      `${BASE}/reassignments/${requestId}/reply`,
      payload
    );
    return data;
  },

  async getReceivedRequests(): Promise<ReassignmentSolicitation[]> {
    const { data } = await api.get<ReassignmentSolicitation[]>(
      `${BASE}/reassignments/received`
    );
    return data;
  },

  async getPendingCount(): Promise<number> {
    const { data } = await api.get<PendingCount>(
      `${BASE}/reassignments/pending/count`
    );
    return data.pending;
  },

  async getAvailableAgents(): Promise<AvailableAgent[]> {
    const { data } = await api.get<AvailableAgent[]>('/users', {
      params: { userType: 'EMPLOYEE' },
    });
    return data;
  },

  async getSentRequests(): Promise<ReassignmentSolicitation[]> {
    const { data } = await api.get<ReassignmentSolicitation[]>(
      `${BASE}/reassignments/sent`
    );
    return data;
  },
};

export default reassignmentService;
