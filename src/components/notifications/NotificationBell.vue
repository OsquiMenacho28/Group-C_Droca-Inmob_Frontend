<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Notificaciones"
    >
      <IconLucideBell class="w-5 h-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 class="font-semibold text-primary">Notificaciones</h3>
          <button
            v-if="unreadCount > 0"
            @click="handleMarkAllRead"
            class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Marcar todas como leídas
          </button>
        </div>

        <div class="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
          <div
            v-for="notif in recentNotifications"
            :key="notif.id"
            @click="handleNotificationClick(notif)"
            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': !notif.readStatus }"
          >
            <div class="flex gap-3">
              <div class="flex-shrink-0 mt-0.5">
                <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <IconLucideBellRing class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ notif.subject }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {{ notif.content }}
                </p>
                <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  {{ formatRelativeTime(notif.createdAt) }}
                </p>
              </div>
              <div v-if="!notif.readStatus" class="flex-shrink-0">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-center">
          <router-link
            to="/dashboard/notifications"
            class="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            @click="isOpen = false"
          >
            Mostrar todas las notificaciones
          </router-link>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useNotifications } from '@/composables/useNotifications';
  import { useRouter } from 'vue-router';
  import IconLucideBell from '~icons/lucide/bell';
  import IconLucideBellRing from '~icons/lucide/bell-ring';

  const router = useRouter();
  const isOpen = ref(false);
  const { unreadCount, loadUnreadCount, fetchNotifications, list, markAsRead, markAllAsRead } = useNotifications();

  const recentNotifications = computed(() => list.value.slice(0, 5));

  const toggleDropdown = async () => {
    if (!isOpen.value) {
      await fetchNotifications(); // carga las 10 primeras
    }
    isOpen.value = !isOpen.value;
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.readStatus) {
      await markAsRead(notif.id);
      await loadUnreadCount();
    }
    // Opcional: redirigir según el tipo de notificación
    // Ejemplo: if (notif.interactionType === 'VISITA') router.push(`/visits/${notif.details?.visitId}`)
    isOpen.value = false;
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    await loadUnreadCount();
  };

  const formatRelativeTime = (iso: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString();
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.relative')) {
      isOpen.value = false;
    }
  };

  onMounted(() => {
    loadUnreadCount();
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>