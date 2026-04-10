// FILE: Frontend/Frontend/src/services/userService.ts

import { api } from './api'
import type { UserFormPayload, UserType } from '../types/user'

const getRoleIdByUserType = (userType: UserType): string => {
  const roles: Record<UserType, string> = {
    'ADMIN': 'rol_admin',
    'EMPLOYEE': 'rol_agent',
    'OWNER': 'rol_owner',
    'INTERESTED_CLIENT': 'rol_interested_client'
  }
  return roles[userType] || 'rol_interested_client'
}

export const userService = {
  async createUser(payload: any) {
    // El payload ya viene con firstName y lastName desde UserForm
    const apiPayload: any = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      userType: payload.userType,
      roleIds: payload.roleIds || [getRoleIdByUserType(payload.userType)],
      birthDate: payload.birthDate,
      phone: payload.phone,
      sendTemporaryCredentials: payload.sendTemporaryCredentials !== undefined ? payload.sendTemporaryCredentials : true,
      // Campos específicos
      department: payload.department,
      position: payload.position,
      hireDate: payload.hireDate,
      taxId: payload.taxId,
      preferredContactMethod: payload.preferredContactMethod,
      budget: payload.budget,
      preferredZone: payload.preferredZone,
      preferredPropertyType: payload.preferredPropertyType,
      preferredRooms: payload.preferredRooms,
      assignedAgentId: payload.assignedAgentId
    }
    
    // Solo agregar assignedAgentId si se proporcionó
    if (payload.assignedAgentId) {
      apiPayload.assignedAgentId = payload.assignedAgentId;
    }

    const response = await api.post('/users', apiPayload)
    return response.data
  },

  async updateUser(userId: string, payload: any) {
    // En edición, el payload ya viene con los campos a actualizar
    const response = await api.put(`/users/${userId}`, payload)
    return response.data
  },

  async getUsers() {
    const res = await api.get('/users')
    return res.data
  },

  async deactivateUser(id: string) {
    const res = await api.put(`/users/${id}/deactivate`)
    return res.data
  },

  async reactivateUser(id: string) {
    const res = await api.put(`/users/${id}/reactivate`)
    return res.data
  },

  async deleteUser(id: string) {
    await api.delete(`/users/${id}`)
  },
  async darDeBaja(id: string, motivo: string) {
    const res = await api.put(`/persons/${id}/deactivate?motivo=${encodeURIComponent(motivo)}`);
    return res.data;
  },
  async getRoles() {
    const res = await api.get('/roles')
    return res.data
  },

  async resendTemporaryPassword(email: string) {
    const res = await api.post('/auth/resend-temp-password', { email })
    return res.data
  }
}