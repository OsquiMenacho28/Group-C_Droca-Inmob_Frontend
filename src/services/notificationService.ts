import { apiClient as api } from '@/api';
import type { InAppNotification, InteractionType } from '@/types/notification';

export interface GetNotificationsParams {
  readStatus?: boolean;
  type?: InteractionType;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface NotificationsPaginatedResponse {
  data: InAppNotification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const notificationService = {
  /**
   * Obtiene las notificaciones in-app del usuario autenticado.
   */
  async getInAppNotifications(params: GetNotificationsParams = {}): Promise<NotificationsPaginatedResponse> {
    const query: Record<string, string | number | boolean | undefined> = {
      readStatus: params.readStatus,
      page: params.page ?? 0,
      pageSize: params.pageSize ?? 10,
    };
    if (params.type) query.type = params.type;
    if (params.fromDate) query.fromDate = params.fromDate;
    if (params.toDate) query.toDate = params.toDate;

    const response = await api.get('/notifications/in-app', { params: query });
    const meta = response.data.meta;
    return {
      data: response.data.data || [],
      total: meta?.total ?? 0,
      page: meta?.page ?? 0,
      pageSize: meta?.limit ?? 10,
      totalPages: Math.ceil((meta?.total ?? 0) / (meta?.limit ?? 10)),
    };
  },

  /**
   * Marca una notificación como leída.
   */
  async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/in-app/${notificationId}/read`);
  },

  /**
   * Marca todas las notificaciones como leídas.
   */
  async markAllAsRead(): Promise<void> {
    const response = await api.get('/notifications/in-app', { params: { readStatus: false, page: 0, pageSize: 1000 } });
    const notifications = response.data.data || [];
    for (const n of notifications) {
      await this.markAsRead(n.id);
    }
  },

  /**
   * Obtiene el conteo de notificaciones no leídas.
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/in-app', { params: { readStatus: false, page: 0, pageSize: 1 } });
    return response.data.meta?.total ?? 0;
  },
};