import { api } from "./api";

import type {
  ClientVisitRequestDTO,
  VisitRequestResponse,
  Property,
} from "../types/visitCalendar";

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
  const params = new URLSearchParams({ status: "DISPONIBLE" });
  if (filters?.title) params.append("title", filters.title);
  if (filters?.type) params.append("type", filters.type);
  if (filters?.operationType)
    params.append("operationType", filters.operationType);
  if (filters?.minPrice !== undefined)
    params.append("minPrice", String(filters.minPrice));
  if (filters?.maxPrice !== undefined)
    params.append("maxPrice", String(filters.maxPrice));
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
  if (filters?.page !== undefined) params.append("page", String(filters.page));
  if (filters?.pageSize) params.append("pageSize", String(filters.pageSize));

  const response = await api.get(`/properties?${params}`);
  console.log("Respuesta del backend (getAvailableProperties):", response.data);
  return response.data; // { data, page, pageSize, totalElements, totalPages }
}

// ---------------------------------------------------------------
//  HU03: Contar visitas a una propiedad (para propietarios)
// ---------------------------------------------------------------

/**
 * Obtiene el número de visitas programadas para una propiedad.
 * El backend valida que el propietario autenticado sea dueño de la propiedad.
 *
 * @param propertyId - ID de la propiedad
 * @returns Número de visitas programadas (no canceladas)
 */
export async function getVisitCountForProperty(
  propertyId: string,
): Promise<number> {
  const response = await api.get(
    `/api/visit-requests/count/property/${propertyId}`,
  );
  // El backend retorna { data: number }
  return response.data.data;
}

/**
 * Obtiene el detalle de todas las visitas programadas para una propiedad.
 * Útil para mostrar fechas y horarios específicos.
 *
 * @param propertyId - ID de la propiedad
 * @returns Lista de eventos de visita
 */
export async function getVisitsForProperty(propertyId: string) {
  const response = await api.get(`/api/visits/property/${propertyId}`);
  return response.data.data;
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
  // console.log('DTO enviado al backend:', JSON.stringify(dto, null, 2))
  const response = await api.post("/api/visit-requests", dto);
  // console.log('Respuesta del backend:', response.data)
  return response.data.data;
}

/**
 * El cliente consulta el estado de sus solicitudes enviadas.
 */
export async function getMyVisitRequests(
  clientId: string,
): Promise<VisitRequestResponse[]> {
  const response = await api.get(`/api/visit-requests/client/${clientId}`);
  return response.data.data;
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
  const response = await api.get(`/api/visit-requests/agent/${agentId}`);
  return response.data.data;
}

/**
 * El agente acepta una solicitud → se crea el evento en el calendario.
 */
export async function acceptVisitRequest(
  requestId: string,
  agentId: string,
): Promise<VisitRequestResponse> {
  const response = await api.patch(
    `/api/visit-requests/${requestId}/accept`,
    {},
    { headers: { "X-Agent-Id": agentId } },
  );
  return response.data.data;
}

/**
 * El agente rechaza una solicitud.
 */
export async function rejectVisitRequest(
  requestId: string,
  agentId: string,
): Promise<VisitRequestResponse> {
  const response = await api.patch(
    `/api/visit-requests/${requestId}/reject`,
    {},
    { headers: { "X-Agent-Id": agentId } },
  );
  return response.data.data;
}

// ---------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------

export function formatRequestStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Pendiente",
    ACCEPTED: "Aceptada",
    REJECTED: "Rechazada",
  };
  return map[status] ?? status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: "yellow",
    ACCEPTED: "green",
    REJECTED: "red",
  };
  return map[status] ?? "gray";
}

/**
 * Formatea la fecha de una visita para mostrar en el dashboard del propietario
 */
export function formatVisitDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
