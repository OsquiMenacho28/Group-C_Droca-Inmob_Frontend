import { apiClient as api } from '@/api';

export interface RegisterResultadoPayload {
  resultado: 'INTERESADO' | 'NO_INTERESADO' | 'PENDIENTE';
  observaciones?: string;
}

export async function registerVisitResult(
  visitId: string,
  payload: RegisterResultadoPayload,
  agentId: string
) {
  const response = await api.patch(`/visits/${visitId}/resultado`, payload, {
    headers: { 'X-Agent-Id': agentId }
  });
  return response.data.data; // Devuelve la visita actualizada
}