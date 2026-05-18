import { ref, reactive, watch } from 'vue';
import { notificationService } from '@/services/notificationService';
import type { InAppNotification, InteractionType } from '@/types/notification';

export function useNotifications() {
  const list = ref<InAppNotification[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Paginación y filtros
  const page = ref(0);
  const pageSize = ref(10);
  const total = ref(0);
  const totalPages = ref(0);

  const filters = reactive({
    readStatus: undefined as boolean | undefined,
    type: undefined as InteractionType | undefined,
    fromDate: undefined as string | undefined,
    toDate: undefined as string | undefined,
  });

  // Contador de no leídas (se puede obtener por separado, pero también se puede calcular)
  const unreadCount = ref(0);

  const loadUnreadCount = async () => {
    try {
      unreadCount.value = await notificationService.getUnreadCount();
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    loading.value = true;
    error.value = null;
    try {
      const result = await notificationService.getInAppNotifications({
        readStatus: filters.readStatus,
        type: filters.type,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        page: page.value,
        pageSize: pageSize.value,
      });
      list.value = result.data;
      total.value = result.total;
      totalPages.value = result.totalPages;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      error.value = 'Error al cargar notificaciones';
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      const notif = list.value.find(n => n.id === id);
      if (notif && !notif.readStatus) {
        notif.readStatus = true;
        notif.readAt = new Date().toISOString();
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      list.value.forEach(n => {
        n.readStatus = true;
        n.readAt = new Date().toISOString();
      });
      unreadCount.value = 0;
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Actualizar cuando cambien paginación o filtros
  watch([page, pageSize, () => filters.readStatus, () => filters.type, () => filters.fromDate, () => filters.toDate], () => {
    fetchNotifications();
  }, { immediate: false });

  return {
    list,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    filters,
    unreadCount,
    loadUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}