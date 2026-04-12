import { api } from './api';

import type {
  CalendarResponse,
  CalendarEventResponse,
  ConflictResponse,
  CreateVisitRequest,
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

  const response = await api.get(`/api/calendar?${params}`, {
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
  const response = await api.get(`/api/visits/conflict-check?${params}`);
  return response.data.data;
}

export async function createVisit(
  data: CreateVisitRequest,
  agentId: string
): Promise<CalendarEventResponse> {
  const response = await api.post('/api/visits', data, {
    headers: { 'X-Agent-Id': agentId },
  });
  return response.data.data;
}

export async function getDayAgenda(
  agentId: string,
  day: string
): Promise<CalendarEventResponse[]> {
  const params = new URLSearchParams({ agentId, day });
  const response = await api.get(`/api/visits/agenda?${params}`, {
    headers: { 'X-Agent-Id': agentId },
  });
  return response.data.data;
}

export async function cancelVisit(
  visitId: string,
  agentId: string
): Promise<CalendarEventResponse> {
  const response = await api.patch(
    `/api/visits/${visitId}/cancel`,
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
  return new Date(iso).toLocaleString('es-BO', {
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
