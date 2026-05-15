import { apiClient as api, apiClientV2 } from '@/api';
import type { UserType, User } from '@/types/user';
import type { ApiResponse } from '@/api/types';

const getRoleIdByUserType = (userType: UserType): string => {
  const roles: Record<UserType, string> = {
    ADMIN: 'rol_admin',
    EMPLOYEE: 'rol_agent',
    OWNER: 'rol_owner',
    INTERESTED_CLIENT: 'rol_interested_client',
  };
  return roles[userType] || 'rol_interested_client';
};

export interface Role {
  id: string;
  name: string;
  [key: string]: unknown;
}

export const userService = {
  async createUser(payload: Record<string, unknown>): Promise<User> {
    const apiPayload: Record<string, unknown> = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      userType: payload.userType,
      roleIds: payload.roleIds || [
        getRoleIdByUserType(payload.userType as import('@/types/user').UserType),
      ],
      birthDate: payload.birthDate,
      phone: payload.phone,
      sendTemporaryCredentials:
        payload.sendTemporaryCredentials !== undefined ? payload.sendTemporaryCredentials : true,
      department: payload.department,
      position: payload.position,
      hireDate: payload.hireDate,
      taxId: payload.taxId,
      preferredContactMethod: payload.preferredContactMethod,
      budget: payload.budget,
      preferredZone: payload.preferredZone,
      preferredPropertyType: payload.preferredPropertyType,
      preferredRooms: payload.preferredRooms,
      assignedAgentId: payload.assignedAgentId,
    };

    if (payload.assignedAgentId) {
      apiPayload.assignedAgentId = payload.assignedAgentId;
    }

    const response = await api.post<ApiResponse<User>>('/users', apiPayload);
    return response.data.data;
  },

  async updateUser(userId: string, payload: Record<string, unknown>): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${userId}`, payload);
    return response.data.data;
  },
  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },
  async getUsers(
    page: number,
    pageSize: number,
    status?: string,
    query?: string
  ): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>('/users', {
      params: { page, pageSize, status, query },
    });
    return response.data;
  },
  async deactivateUser(id: string): Promise<User> {
    const res = await api.put<ApiResponse<User>>(`/users/${id}/deactivate`);
    return res.data.data;
  },

  async reactivateUser(id: string): Promise<User> {
    const res = await api.put<ApiResponse<User>>(`/users/${id}/reactivate`);
    return res.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async darDeBaja(id: string, motivo: string): Promise<unknown> {
    const res = await api.put<ApiResponse<unknown>>(
      `/persons/${id}/deactivate?motivo=${encodeURIComponent(motivo)}`
    );
    return res.data.data;
  },

  async getRoles(page = 0, pageSize = 50): Promise<ApiResponse<Role[]>> {
    const response = await api.get<ApiResponse<Role[]>>('/roles', { params: { page, pageSize } });
    return response.data;
  },

  async resendTemporaryPassword(email: string): Promise<unknown> {
    const res = await api.post<ApiResponse<unknown>>('/auth/resend-temp-password', { email });
    return res.data.data;
  },

  /**
   * Example method using API v2
   */
  async getV2Data(): Promise<unknown> {
    const response = await apiClientV2.get<ApiResponse<unknown>>('/example-resource');
    return response.data.data;
  },

  async savePreferences(
    userId: string,
    payload: Record<string, unknown>
  ): Promise<ApiResponse<User>> {
    return (await api.put(`/persons/${userId}/preferencias`, payload)).data;
  },
};
