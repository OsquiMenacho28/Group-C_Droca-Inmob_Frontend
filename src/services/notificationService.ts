import { apiClient as api } from '@/api';
import type { NotificationHistoryResponse } from '@/types/notification';

export const notificationService = {
  /**
   * Obtiene las notificaciones de un propietario (paginado)
   */
  async getNotifications(ownerId: string, page = 0, pageSize = 10): Promise<{ data: NotificationHistoryResponse[]; total: number }> {
    const response = await api.get(`/notifications/propietarios/${ownerId}/notificaciones`, {
      params: { page, pageSize },
    });
    return {
      data: response.data.data,
      total: response.data.meta?.total || 0,
    };
  },

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/notifications/${notificationId}/leida`);
  },

  /**
   * Obtiene el número de notificaciones no leídas del usuario autenticado
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get(`/notifications/me/unread/count`);
    return response.data.data;
  },
};