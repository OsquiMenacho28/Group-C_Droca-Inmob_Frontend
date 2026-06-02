import { apiClient as api } from '@/api';
import { getLocaleString } from '@/locales/i18n';
import i18n from '@/locales/i18n';

const { t } = i18n.global;

import type {
  ClientVisitRequestDTO,
  VisitRequestResponse,
  Property,
} from '@/types/visitCalendar';

export async function getAvailableProperties(filters?: {
  title?: string;
  type?: string;
  operationType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  data: Property[];
  totalElements: number;
  totalPages: number;
  page: number;
}> {
  const params = new URLSearchParams({ status: 'DISPONIBLE' });
  if (filters?.title) params.append('title', filters.title);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.operationType)
    params.append('operationType', filters.operationType);
  if (filters?.minPrice !== undefined)
    params.append('minPrice', String(filters.minPrice));
  if (filters?.maxPrice !== undefined)
    params.append('maxPrice', String(filters.maxPrice));
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters?.page !== undefined) params.append('page', String(filters.page));
  if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

  const response = await api.get(`/properties?${params}`);
  const apiRes = response.data;

  const meta = apiRes.meta;
  const total = meta?.total || 0;
  const limit = meta?.limit || filters?.pageSize || 1;

  return {
    data: apiRes.data || [],
    totalElements: total,
    totalPages: Math.ceil(total / limit),
    page: meta?.page || 0,
  };
}

export async function getVisitCountForProperty(
  propertyId: string
): Promise<number> {
  const response = await api.get(
    `/visit-requests/count/property/${propertyId}`
  );
  return response.data.data;
}

export async function getVisitsForProperty(propertyId: string) {
  const response = await api.get(`/visits/property/${propertyId}`);
  return response.data.data;
}

export async function createVisitRequest(
  dto: ClientVisitRequestDTO
): Promise<VisitRequestResponse> {
  const response = await api.post('/visit-requests', dto);
  return response.data.data;
}

export async function getMyVisitRequests(
  clientId: string
): Promise<VisitRequestResponse[]> {
  const response = await api.get(`/visit-requests/client/${clientId}`);
  return response.data.data;
}

export async function getPendingRequestsForAgent(
  agentId: string
): Promise<VisitRequestResponse[]> {
  const response = await api.get(`/visit-requests/agent/${agentId}`);
  return response.data.data;
}

export async function acceptVisitRequest(
  requestId: string,
  agentId: string
): Promise<VisitRequestResponse> {
  const response = await api.patch(
    `/visit-requests/${requestId}/accept`,
    {},
    { headers: { 'X-Agent-Id': agentId } }
  );
  return response.data.data;
}

export async function rejectVisitRequest(
  requestId: string,
  agentId: string
): Promise<VisitRequestResponse> {
  const response = await api.patch(
    `/visit-requests/${requestId}/reject`,
    {},
    { headers: { 'X-Agent-Id': agentId } }
  );
  return response.data.data;
}

export function formatRequestStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: t('status.pending'),
    ACCEPTED: t('status.accepted'),
    REJECTED: t('status.rejected'),
  };
  return map[status] ?? status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'yellow',
    ACCEPTED: 'green',
    REJECTED: 'red',
  };
  return map[status] ?? 'gray';
}

export function formatVisitDateTime(iso: string): string {
  return new Date(iso).toLocaleString(getLocaleString(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}
