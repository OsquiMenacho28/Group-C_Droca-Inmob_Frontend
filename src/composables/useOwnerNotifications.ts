import { ref, computed, watch, onMounted } from 'vue';
import { notificationService } from '@/services/notificationService';
import type { NotificationHistoryResponse } from '@/types/notification';

const STORAGE_KEY = 'owner_notifications_read';

export function useOwnerNotifications(ownerId: string) {
  const list = ref<NotificationHistoryResponse[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const page = ref(0);
  const pageSize = ref(10);
  const totalPages = ref(0);
  const readIds = ref<Set<string>>(new Set());

  // Cargar IDs leídos desde localStorage
  const loadReadIds = () => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${ownerId}`);
    if (stored) {
      readIds.value = new Set(JSON.parse(stored));
    }
  };

  const saveReadIds = () => {
    localStorage.setItem(`${STORAGE_KEY}_${ownerId}`, JSON.stringify([...readIds.value]));
  };

  const markAsRead = (id: string) => {
    if (!readIds.value.has(id)) {
      readIds.value.add(id);
      saveReadIds();
    }
  };

  const markAllAsRead = () => {
    list.value.forEach(n => readIds.value.add(n.id));
    saveReadIds();
  };

  const isRead = (id: string) => readIds.value.has(id);

  const unreadCount = computed(() => list.value.filter(n => !readIds.value.has(n.id)).length);

  const fetchNotifications = async () => {
    if (!ownerId) return;
    loading.value = true;
    try {
      const res = await notificationService.getNotifications(ownerId, page.value, pageSize.value);
      list.value = res.data;
      total.value = res.total;
      totalPages.value = Math.ceil(total.value / pageSize.value);
    } finally {
      loading.value = false;
    }
  };

  // Sincronizar el contador sin recargar toda la lista (para el badge)
  const syncUnreadCount = () => {
    loadReadIds();
    // El contador se recalculará automáticamente cuando cambie readIds
  };

  // Recargar cuando cambie ownerId o paginación
  watch([() => ownerId, page, pageSize], () => {
    if (ownerId) {
      loadReadIds();
      fetchNotifications();
    }
  }, { immediate: true });

  // También podemos exponer un método para recargar forzadamente
  const refresh = fetchNotifications;

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
    isRead,
    fetchNotifications: refresh,
    syncUnreadCount,   // ← exportar para usarlo en MainLayout
  };
}