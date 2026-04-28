<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-300">
    <div class="max-w-6xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('operations.title') }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {{ t('operations.subtitle') }}
          </p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20">
        <FwbSpinner size="6" />
        <p class="mt-2 text-gray-500 dark:text-gray-400">{{ t('operations.loading') }}</p>
      </div>

      <FwbAlert v-else-if="error" type="danger">
        {{ error }}
        <FwbButton @click="loadOperations" :link="true" class="ml-2">
          {{ t('common.retry') }}
        </FwbButton>
      </FwbAlert>

      <FwbCard
        v-else-if="operations.length === 0"
        class="!max-w-none p-12 text-center border-gray-100 dark:border-gray-700 shadow-sm dark:bg-gray-800"
      >
        <IconLucideClipboardList class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
          {{ t('operations.emptyTitle') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">{{ t('operations.emptyText') }}</p>
      </FwbCard>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <FwbCard
          v-for="op in operations"
          :key="op.id"
          class="overflow-hidden hover:shadow-lg transition-all group cursor-pointer border-gray-200 dark:border-gray-700 dark:bg-gray-800"
          @click="$router.push(`/dashboard/operations/${op.id}`)"
        >
          <div class="p-5 pb-3 border-b border-gray-50 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <FwbBadge type="default" size="sm">
                {{ op.operationType || t('operations.standardBadge') }}
              </FwbBadge>
              <span class="text-xs text-gray-400 dark:text-gray-500">
                ID: {{ op.id.slice(0, 8) }}
              </span>
            </div>
            <h3
              class="text-lg font-bold text-gray-900 dark:text-white mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              {{ op.propertyName || t('operations.noName') }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ op.clientName || t('operations.noClient') }}
            </p>
          </div>

          <div class="p-5 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">{{ t('operations.agent') }}</span>
              <span class="font-medium text-gray-700 dark:text-gray-300">
                {{ op.agentName || t('common.notSpecified') }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">{{ t('operations.date') }}</span>
              <span class="font-medium text-gray-700 dark:text-gray-300">
                {{ formatDate(op.createdAt) }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">{{ t('common.status') }}</span>
              <FwbBadge :type="badgeType(op.status)" size="sm">
                {{ op.status || t('status.pending') }}
              </FwbBadge>
            </div>
          </div>

          <div
            class="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700"
          >
            <span
              class="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"
            >
              {{ t('common.viewDetails') }}
              <IconLucideChevronRight class="w-3 h-3" />
            </span>
          </div>
        </FwbCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { FwbSpinner, FwbAlert, FwbCard, FwbButton, FwbBadge } from 'flowbite-vue';
  import IconLucideClipboardList from '~icons/lucide/clipboard-list';
  import IconLucideChevronRight from '~icons/lucide/chevron-right';
  import { ref, onMounted } from 'vue';
  import { apiClient as api } from '@/api';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';

  const { t } = useI18n();

  interface Operation {
    id: string;
    operationType?: string;
    propertyName?: string;
    clientName?: string;
    agentName?: string;
    createdAt?: string;
    status?: string;
  }

  const operations = ref<Operation[]>([]);
  const loading = ref(false);
  const error = ref('');

  const loadOperations = async () => {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.get('/operations');
      operations.value = response.data.data || [];
    } catch {
      error.value = t('operations.loadError');
    } finally {
      loading.value = false;
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return t('common.notSpecified');
    return new Date(iso).toLocaleDateString(getLocaleString(), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const badgeType = (status?: string) => {
    const map: Record<string, 'green' | 'dark' | 'red' | 'yellow'> = {
      ACTIVE: 'green',
      CLOSED: 'dark',
      CANCELLED: 'red',
      PENDING: 'yellow',
    };
    return map[status || ''] || 'dark';
  };

  onMounted(loadOperations);
</script>
