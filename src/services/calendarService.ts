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
  AgentAvailability,
  AvailabilityTemplate,
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
  endTime: string,
  agentId?: string
): Promise<ConflictResponse> {
  const params = new URLSearchParams({ propertyId, startTime, endTime });
  if (agentId) params.append('agentId', agentId);
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

export async function getAvailableVehicles(
  dateTimeIso: string
): Promise<Vehicle[]> {
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

export async function getDayAgenda(
  agentId: string,
  day: string
): Promise<CalendarEventResponse[]> {
  const params = new URLSearchParams({ agentId, day });
  const response = await api.get(`/visits/agenda?${params}`, {
    headers: { 'X-Agent-Id': agentId },
  });
  return response.data.data;
}

export async function cancelVisit(
  visitId: string,
  agentId: string
): Promise<Visit> {
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

export async function getAgentAvailability(agentId: string): Promise<AgentAvailability[]> {
  const response = await api.get(`/agents/${agentId}/availability`);
  return response.data.data;
}

export async function saveAgentAvailability(agentId: string, availability: Partial<AgentAvailability>): Promise<AgentAvailability> {
  const response = await api.post(`/agents/${agentId}/availability`, availability);
  return response.data.data;
}

export async function updateAgentAvailability(agentId: string, slotId: string, availability: Partial<AgentAvailability>): Promise<AgentAvailability> {
  const response = await api.put(`/agents/${agentId}/availability/${slotId}`, availability);
  return response.data.data;
}

export async function deleteAgentAvailability(agentId: string, slotId: string): Promise<void> {
  await api.delete(`/agents/${agentId}/availability/${slotId}`);
}

export async function getAvailabilityTemplates(): Promise<AvailabilityTemplate[]> {
  const response = await api.get('/availability-templates');
  return response.data.data;
}

export async function createAvailabilityTemplate(template: Partial<AvailabilityTemplate>): Promise<AvailabilityTemplate> {
  const response = await api.post('/availability-templates', template);
  return response.data.data;
}

export async function updateAvailabilityTemplate(templateId: string, template: Partial<AvailabilityTemplate>): Promise<AvailabilityTemplate> {
  const response = await api.put(`/availability-templates/${templateId}`, template);
  return response.data.data;
}

export async function deleteAvailabilityTemplate(templateId: string): Promise<void> {
  await api.delete(`/availability-templates/${templateId}`);
}

export async function applyAvailabilityTemplate(templateId: string, agentIds: string[], overwrite: boolean): Promise<void> {
  await api.post(`/availability-templates/${templateId}/apply`, { agentIds, overwrite });
}

