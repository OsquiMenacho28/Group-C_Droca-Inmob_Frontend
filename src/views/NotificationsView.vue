<template>
  <div class="app-page py-8 px-4">
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-primary">Centro de Notificaciones</h1>
          <p class="text-sm text-secondary mt-1">Historial de notificaciones y alertas</p>
        </div>
        <button
          v-if="unreadCount > 0"
          @click="handleMarkAllRead"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition"
        >
          Marcar todas como leídas
        </button>
      </div>

      <!-- Filtros -->
      <div class="app-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-semibold text-secondary mb-1">Tipo</label>
          <select v-model="filters.type" class="app-input w-full">
            <option value="">Todos</option>
            <option value="AGENT_AGENT">Entre agentes</option>
            <option value="ADMIN_OP">Operaciones administrativas</option>
            <option value="INTERES">Cliente interesado</option>
            <option value="PROPIEDAD_MOD">Modificación de propiedad</option>
            <option value="VISITA">Visita</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-secondary mb-1">Estado</label>
          <select v-model="filters.readStatus" class="app-input w-full">
            <option :value="undefined">Todas</option>
            <option :value="false">No leídas</option>
            <option :value="true">Leídas</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-secondary mb-1">Desde</label>
          <input type="date" v-model="filters.fromDate" class="app-input w-full" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-secondary mb-1">Hasta</label>
          <input type="date" v-model="filters.toDate" class="app-input w-full" />
        </div>
      </div>

      <!-- Lista de notificaciones -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="app-card p-4 animate-pulse">
          <div class="flex gap-3">
            <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-4 text-red-700">
        {{ error }}
      </div>

      <div v-else-if="list.length === 0" class="app-card p-12 text-center">
        <IconLucideBellOff class="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p class="text-secondary">No hay notificaciones que coincidan con los filtros.</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="notif in list"
          :key="notif.id"
          class="app-card p-4 transition hover:shadow-md cursor-pointer"
          :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': !notif.readStatus }"
          @click="handleNotificationClick(notif)"
        >
          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <IconLucideBellRing class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div class="flex-1">
              <div class="flex flex-wrap justify-between items-start gap-2">
                <h3 class="text-md font-semibold text-primary">{{ notif.subject }}</h3>
                <span class="text-xs text-gray-400">{{ formatDate(notif.createdAt) }}</span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">
                {{ notif.content }}
              </p>
              <div class="flex justify-between items-center mt-3">
                <span class="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600">
                  {{ getInteractionTypeLabel(notif.interactionType) }}
                </span>
                <button
                  v-if="!notif.readStatus"
                  @click.stop="markAsRead(notif.id)"
                  class="text-xs text-blue-600 hover:underline"
                >
                  Marcar como leída
                </button>
                <span v-else class="text-xs text-green-600">✓ Leída</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <Pagination
        v-if="!loading && totalPages > 1"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total="total"
        @change="fetchNotifications"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, watch } from 'vue';
  import { useNotifications } from '@/composables/useNotifications';
  import Pagination from '@/components/ui/Pagination.vue';
  import IconLucideBellOff from '~icons/lucide/bell-off';
  import IconLucideBellRing from '~icons/lucide/bell-ring';
  import { formatDate } from '@/utils/dateTime';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const {
    list,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    filters,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationClick = async (notif: any) => {
    if (!notif.readStatus) {
      await markAsRead(notif.id);
    }
    // Redirigir según tipo si se desea
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    await fetchNotifications();
  };

  const getInteractionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      AGENT_AGENT: 'Entre agentes',
      ADMIN_OP: 'Administrativa',
      INTERES: 'Interés',
      PROPIEDAD_MOD: 'Propiedad modificada',
      VISITA: 'Visita',
    };
    return labels[type] || type;
  };

  // Escuchar cambios en filtros y paginación
  watch([page, pageSize, () => filters.readStatus, () => filters.type, () => filters.fromDate, () => filters.toDate], () => {
    fetchNotifications();
  }, { immediate: true });
</script>