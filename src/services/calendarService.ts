import { apiClient as api } from '@/api';

import { getLocaleString } from '@/locales/i18n';
import {
  getWeekRangeUtc,
  formatDisplayDateTime,
  utcIsoToLocalInput,
  localInputToUtcIso,
} from '@/utils/dateTime';
import type { Visit } from '@/types/reschedule';

import type {
  CalendarResponse,
  CalendarEventResponse,
  ConflictResponse,
  CreateVisitRequest,
  Vehicle,
  VehicleAssignmentRequest,
} from '@/types/visitCalendar';

export async function getCalendar(
  from: string,
  to: string,
  myAgentId?: string,
  agentId?: string,
  propertyId?: string
): Promise<CalendarResponse> {
  const params = new URLSearchParams({ from, to });
  if (agentId) params.append('agentId', agentId);
  if (propertyId) params.append('propertyId', propertyId);

  const response = await api.get(`/calendar?${params}`, {
    headers: myAgentId ? { 'X-Agent-Id': myAgentId } : {},
  });
  return response.data.data;
}

export async function checkConflict(
  propertyId: string,
  startTime: string,
  endTime: string
): Promise<ConflictResponse> {
  const params = new URLSearchParams({ propertyId, startTime, endTime });
  const response = await api.get(`/visits/conflict-check?${params}`);
  return response.data.data;
}

export async function createVisit(
  data: CreateVisitRequest,
  agentId: string
): Promise<CalendarEventResponse> {
  const response = await api.post('/visits', data, {
    headers: { 'X-Agent-Id': agentId },
  });
  return response.data.data;
}

export async function getAvailableVehicles(dateTimeIso: string): Promise<Vehicle[]> {
  const params = new URLSearchParams({
    available: 'true',
    dateTime: dateTimeIso,
  });
  const response = await api.get(`/vehicles?${params}`);
  return response.data.data;
}

export async function assignVehicleToVisit(
  visitId: string,
  payload: VehicleAssignmentRequest
): Promise<CalendarEventResponse> {
  const response = await api.post(`/visits/${visitId}/vehicle`, payload);
  return response.data.data;
}

export async function getDayAgenda(agentId: string, day: string): Promise<CalendarEventResponse[]> {
  const params = new URLSearchParams({ agentId, day });
  const response = await api.get(`/visits/agenda?${params}`, {
    headers: { 'X-Agent-Id': agentId },
  });
  return response.data.data;
}

export async function cancelVisit(visitId: string, agentId: string): Promise<Visit> {
  const response = await api.patch(
    `/visits/${visitId}/cancel`,
    {},
    {
      headers: { 'X-Agent-Id': agentId },
    }
  );
  return response.data.data;
}

export { getWeekRangeUtc as getWeekRange };

export function formatEventTime(iso: string): string {
  return formatDisplayDateTime(iso, getLocaleString());
}

export { utcIsoToLocalInput as isoToDatetimeLocal };

export { localInputToUtcIso as datetimeLocalToIso };
