import { apiClient as api } from '@/api';

import { getLocaleString } from '@/locales/i18n';
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
  const date = new Date(dateTimeIso);
  const dateParam = date.toISOString().slice(0, 10);
  const timeParam = date.toISOString().slice(11, 16);
  const params = new URLSearchParams({
    available: 'true',
    date: dateParam,
    time: timeParam,
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

export function getWeekRange(date: Date): { from: string; to: string } {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    from: monday.toISOString(),
    to: sunday.toISOString(),
  };
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleString(getLocaleString(), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isoToDatetimeLocal(iso: string): string {
  return iso.slice(0, 16);
}

export function datetimeLocalToIso(val: string): string {
  return new Date(val).toISOString();
}
