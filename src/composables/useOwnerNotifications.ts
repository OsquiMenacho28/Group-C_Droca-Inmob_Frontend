import { ref, computed, watch, onMounted } from 'vue';
import { notificationService } from '@/services/notificationService';
import type { NotificationHistoryResponse } from '@/types/notification';

export function useOwnerNotifications(ownerId: string) {
  const list = ref<NotificationHistoryResponse[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const page = ref(0);
  const pageSize = ref(10);
  const totalPages = ref(0);

  // El contador de no leídas se calcula directamente desde los datos
  const unreadCount = computed(() => list.value.filter(n => !n.leida).length);

  const fetchNotifications = async () => {
    if (!ownerId) return;
    loading.value = true;
    try {
      const res = await notificationService.getNotifications(ownerId, page.value, pageSize.value);
      list.value = res.data;
      total.value = res.total;
      totalPages.value = Math.ceil(total.value / pageSize.value);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (id: string) => {
    const notif = list.value.find(n => n.id === id);
    if (!notif || notif.leida) return;

    try {
      await notificationService.markAsRead(id);
      // Actualizar estado local
      notif.leida = true;
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unread = list.value.filter(n => !n.leida);
    for (const n of unread) {
      await markAsRead(n.id);
    }
  };

  const refresh = fetchNotifications;

  // Cargar cuando cambia ownerId o paginación
  watch([() => ownerId, page, pageSize], () => {
    if (ownerId) fetchNotifications();
  }, { immediate: true });

  return {
    list,
    total,
    loading,
    page,
    pageSize,
    totalPages,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications: refresh,
  };
}