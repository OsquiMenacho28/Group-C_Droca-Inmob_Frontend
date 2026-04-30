import { apiClient as api } from '@/api';
import type { NotificationHistoryResponse } from '@/types/notification';

export const notificationService = {
  async getNotifications(ownerId: string, page = 0, pageSize = 10): Promise<{ data: NotificationHistoryResponse[]; total: number }> {
    const response = await api.get(`/propietarios/${ownerId}/notificaciones`, { params: { page, pageSize } });
    return {
      data: response.data.data,
      total: response.data.meta?.total || 0,
    };
  },
};