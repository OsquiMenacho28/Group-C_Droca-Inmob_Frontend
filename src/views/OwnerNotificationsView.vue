<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t('ownerNotifications.title') }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400">{{ t('ownerNotifications.subtitle') }}</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div class="flex justify-between items-center mb-6">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('ownerNotifications.totalUnread', { count: unreadCount }) }}
        </div>
        <button
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {{ t('ownerNotifications.markAllRead') }}
        </button>
      </div>

      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
        </div>
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
              <div class="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span>{{ formatDate(notif.createdAt) }}</span>
                <span v-if="notif.sentAt" class="text-green-500">✓ {{ t('common.sent') }}</span>
                <span v-else-if="notif.status === 'FAILED'" class="text-red-500">✗ {{ t('common.failed') }}</span>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white">{{ notif.subject }}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">{{ notif.content }}</p>
              <div v-if="notif.errorMessage" class="mt-2 text-xs text-red-500">
                {{ notif.errorMessage }}
              </div>
            </div>
            <div v-if="!isRead(notif.id)" class="ml-3">
              <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
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
        class="mt-6"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { useAuthStore } from '@/modules/auth';
  import { useOwnerNotifications } from '@/composables/useOwnerNotifications';
  import Pagination from '@/components/ui/Pagination.vue';
  import { getLocaleString } from '@/locales/i18n';
  import { computed } from 'vue';

  const { t } = useI18n();
  const authStore = useAuthStore();
  const ownerId = computed(() => (authStore.user?.userId || authStore.user?.sub || '') as string);

  const {
    list,
    total,
    loading,
    page,
    pageSize,
    totalPages,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    isRead,
  } = useOwnerNotifications(ownerId.value);

  const formatDate = (iso: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString(getLocaleString(), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
</script>