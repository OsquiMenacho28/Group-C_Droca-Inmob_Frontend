// ============================================================
//  src/services/visitRequestService.ts
//  Llamadas a la API para solicitudes de visita de clientes.
//  HU3: cliente buscador solicita agendar una cita.
// ============================================================

import type {
  ApiResponse,
  ClientVisitRequestDTO,
  VisitRequestResponse,
  Property,
} from '../types/visitCalendar'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function getHeaders(token?: string): HeadersInit {
  const stored = token || localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(stored ? { Authorization: `Bearer ${stored}` } : {}),
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const body: ApiResponse<T> = await res.json()
  if (!res.ok || !body.success) {
    throw new Error(body.message || `Error HTTP ${res.status}`)
  }
  return body.data
}

// ---------------------------------------------------------------
//  HU3 PA1: Obtener propiedades disponibles para el cliente
// ---------------------------------------------------------------

/**
 * Obtiene las propiedades con status "Disponible".
 * El cliente solo debe ver propiedades disponibles (HU3 PA1).
 * Soporta filtros por zona, precio y tipo (HU3 PA3).
 *
 * Llama al property-service existente en el backend.
 */
export async function getAvailableProperties(filters?: {
  zone?: string
  minPrice?: number
  maxPrice?: number
  type?: string
}): Promise<Property[]> {
  const params = new URLSearchParams({ status: 'Disponible' })
  if (filters?.zone) params.append('zone', filters.zone)
  if (filters?.minPrice !== undefined) params.append('minPrice', String(filters.minPrice))
  if (filters?.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice))
  if (filters?.type) params.append('type', filters.type)

  const res = await fetch(`${BASE_URL}/properties?${params}`, {
    headers: getHeaders(),
  })
  return handleResponse<Property[]>(res)
}

// ---------------------------------------------------------------
//  HU3 PA2: Solicitar cita → notifica al agente
// ---------------------------------------------------------------

/**
 * El cliente envía una solicitud de visita.
 * El backend notifica automáticamente al agente responsable (HU3 PA2).
 */
export async function createVisitRequest(
  dto: ClientVisitRequestDTO,
): Promise<VisitRequestResponse> {
  const res = await fetch(`${BASE_URL}/api/visit-requests`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dto),
  })
  return handleResponse<VisitRequestResponse>(res)
}

/**
 * El cliente consulta el estado de sus solicitudes enviadas.
 */
export async function getMyVisitRequests(
  clientId: string,
): Promise<VisitRequestResponse[]> {
  const res = await fetch(`${BASE_URL}/api/visit-requests/client/${clientId}`, {
    headers: getHeaders(),
  })
  return handleResponse<VisitRequestResponse[]>(res)
}

// ---------------------------------------------------------------
//  Panel del agente: gestionar solicitudes entrantes
// ---------------------------------------------------------------

/**
 * El agente ve sus solicitudes pendientes de clientes.
 */
export async function getPendingRequestsForAgent(
  agentId: string,
): Promise<VisitRequestResponse[]> {
  const res = await fetch(`${BASE_URL}/api/visit-requests/agent/${agentId}`, {
    headers: getHeaders(),
  })
  return handleResponse<VisitRequestResponse[]>(res)
}

/**
 * El agente acepta una solicitud → se crea el evento en el calendario.
 */
export async function acceptVisitRequest(
  requestId: string,
  agentId: string,
): Promise<VisitRequestResponse> {
  const res = await fetch(`${BASE_URL}/api/visit-requests/${requestId}/accept`, {
    method: 'PATCH',
    headers: { ...getHeaders(), 'X-Agent-Id': agentId },
  })
  return handleResponse<VisitRequestResponse>(res)
}

/**
 * El agente rechaza una solicitud.
 */
export async function rejectVisitRequest(
  requestId: string,
  agentId: string,
): Promise<VisitRequestResponse> {
  const res = await fetch(`${BASE_URL}/api/visit-requests/${requestId}/reject`, {
    method: 'PATCH',
    headers: { ...getHeaders(), 'X-Agent-Id': agentId },
  })
  return handleResponse<VisitRequestResponse>(res)
}

// ---------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------

export function formatRequestStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pendiente',
    ACCEPTED: 'Aceptada',
    REJECTED: 'Rechazada',
  }
  return map[status] ?? status
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'yellow',
    ACCEPTED: 'green',
    REJECTED: 'red',
  }
  return map[status] ?? 'gray'
}
