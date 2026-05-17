import { apiClient as api } from '@/api';
import type {
  ContractVersionResponse,
  CreateContractVersionRequest,
} from '@/types/contractVersion';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export const contractVersionService = {
  // Obtener todas las versiones de un contrato por operationId
  async getContractVersions(operationId: string): Promise<ContractVersionResponse[]> {
    const res = await api.get(`/contracts/${operationId}/versions`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Obtener el detalle completo de una versión específica
  async getContractVersionById(versionId: string): Promise<ContractVersionResponse> {
    const res = await api.get(`/contracts/versions/${versionId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Crear nueva versión de contrato (solo ADMINISTRADOR)
  async createContractVersion(
    operationId: string,
    data: CreateContractVersionRequest
  ): Promise<ContractVersionResponse> {
    const res = await api.post(`/contracts/${operationId}/versions`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
};
