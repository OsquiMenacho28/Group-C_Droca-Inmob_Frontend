import { apiClient as api } from '@/api';
import type {
  ContractVersionResponse,
  CreateContractVersionRequest,
} from '@/types/contractVersion';

export const contractVersionService = {
  // Crear nueva versión de contrato (solo ADMINISTRADOR)
  async createContractVersion(
    operationId: string,
    data: CreateContractVersionRequest,
    userId: string,
    userRole: string,
    userName: string
  ): Promise<ContractVersionResponse> {
    const res = await api.post(`/contracts/${operationId}/versions`, data, {
      headers: { 'X-User-Id': userId, 'X-User-Role': userRole, 'X-User-Name': userName },
    });
    return res.data;
  },

  // Obtener todas las versiones de un contrato por operationId
  async getContractVersions(operationId: string): Promise<ContractVersionResponse[]> {
    const res = await api.get(`/contracts/${operationId}/versions`);
    console.log(res.data);
    return res.data;
  },

  // Obtener el detalle completo de una versión específica
  async getContractVersionById(versionId: string): Promise<ContractVersionResponse> {
    const res = await api.get(`/contracts/versions/${versionId}`);
    return res.data;
  },
};
