// src/services/rescheduleService.ts
// Consumes the reschedule endpoints from visit-calendar-service.
// Uses the project's shared axios instance with the JWT auth interceptor.

import { apiClient as api } from '@/api';
import type { RescheduleRequest, RescheduleResponse, Visit } from '@/types/reschedule';

const rescheduleService = {
  /**
   * POST /visits/{visitId}/reschedule
   * Creates a new SCHEDULED visit rescheduled from a CANCELLED one.
   * Returns 409 if the visit is not cancelled (PA3).
   * Returns 422 if the agent or property is unavailable at the new time.
   */
  async reschedule(visitId: string, payload: RescheduleRequest): Promise<RescheduleResponse> {
    const { data } = await api.post<RescheduleResponse>(`/visits/${visitId}/reschedule`, payload);
    return data;
  },

  /**
   * GET /visits/{visitId}/rescheduled
   * Returns all visits created by rescheduling the given original visit.
   * Used to render the "Ver nueva visita" link on the cancelled visit detail.
   */
  async getRescheduledVisits(visitId: string): Promise<Visit[]> {
    const { data } = await api.get<Visit[]>(`/visits/${visitId}/rescheduled`);
    return data;
  },

  /**
   * GET /visits/{visitId}
   * Fetches a single visit by ID.
   * Used to navigate to the newly created rescheduled visit.
   */
  async getVisitById(visitId: string): Promise<Visit> {
    const { data } = await api.get<Visit>(`/visits/${visitId}`);
    return data;
  },
};

export default rescheduleService;
