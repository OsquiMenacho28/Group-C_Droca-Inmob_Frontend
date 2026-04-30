<template>
  <div class="space-y-4">
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
    </div>

    <div v-else-if="list.length === 0" class="text-center py-12 text-gray-500">
      {{ t('ownerNotifications.empty') }}
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="notif in list"
        :key="notif.id"
        @click="markAsRead(notif.id)"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition hover:shadow-md"
        :class="{ 'opacity-60': isRead(notif.id) }"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <p class="text-xs text-gray-400">{{ formatDate(notif.createdAt) }}</p>
            <h4 class="font-semibold text-gray-900 dark:text-white mt-1">{{ notif.subject }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">{{ notif.content }}</p>
            <div class="mt-2">
              <span :class="statusBadgeClass(notif.status)" class="text-xs px-2 py-0.5 rounded-full">
                {{ statusLabel(notif.status) }}
              </span>
            </div>
          </div>
          <div v-if="!isRead(notif.id)" class="ml-3">
            <span class="w-2 h-2 bg-blue-500 rounded-full block"></span>
          </div>
        </div>
      </div>
    </div>

    <Pagination
      v-if="totalPages > 1"
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total-pages="totalPages"
      :total="total"
      @change="fetchNotifications"
    />
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import Pagination from '@/components/ui/Pagination.vue';
  import { getLocaleString } from '@/locales/i18n';

  const props = defineProps<{
    list: any[];
    total: number;
    loading: boolean;
    page: number;
    pageSize: number;
    totalPages: number;
    unreadCount: number;
  }>();

  const emit = defineEmits<{
    (e: 'update:page', value: number): void;
    (e: 'update:pageSize', value: number): void;
    (e: 'fetch'): void;
    (e: 'markRead', id: string): void;
  }>();

  const { t } = useI18n();

  const isRead = (id: string) => props.unreadCount === undefined || true; // Se debe pasar un set de leídos, simplificado aquí.

  const formatDate = (iso: string) => new Date(iso).toLocaleString(getLocaleString());

  const statusLabel = (status: string) => {
    if (status === 'SENT') return t('common.sent');
    if (status === 'FAILED') return t('common.failed');
    return t('common.pending');
  };

  const statusBadgeClass = (status: string) => {
    if (status === 'SENT') return 'bg-green-100 text-green-800';
    if (status === 'FAILED') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };
</script>