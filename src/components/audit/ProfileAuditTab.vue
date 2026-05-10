<template>
  <div class="space-y-6">
    <div class="app-card p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchableSelect
          v-model="filters.personId"
          :items="profileOptions"
          :label="t('audit.filters.profile')"
          :placeholder="t('audit.filters.searchProfile')"
          :loading="loadingProfiles"
          show-clear-button
        />

        <div class="flex flex-col">
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {{ t('audit.filters.action') }}
          </label>
          <select
            v-model="filters.action"
            class="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-primary text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          >
            <option value="">{{ t('audit.actions.all') }}</option>
            <option value="CREATED">{{ t('auditLogs.actions.creations') }}</option>
            <option value="UPDATED">{{ t('auditLogs.actions.edits') }}</option>
            <option value="BAJA">{{ t('auditLogs.actions.removals') }}</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('audit.filters.from') }}
            </label>
            <input v-model="filters.from" type="date" class="app-input" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('audit.filters.to') }}
            </label>
            <input v-model="filters.to" type="date" class="app-input" />
          </div>
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <fwb-button @click="resetAndLoad" gradient="blue" size="sm">
          <div class="flex items-center gap-2">
            <IconLucideSearch class="w-4 h-4" />
            {{ t('common.filter') }}
          </div>
        </fwb-button>
        <fwb-button @click="clearFilters" color="alternative" size="sm">
          {{ t('common.clearFilters') }}
        </fwb-button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500 text-sm">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="logs.length > 0" class="overflow-x-auto">
      <fwb-table hoverable>
        <fwb-table-head>
          <fwb-table-head-cell>{{ t('audit.table.dateTime') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('audit.table.profile') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('audit.table.action') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('audit.table.changedBy') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('audit.table.changes') }}</fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="log in logs" :key="log.id">
            <fwb-table-cell class="whitespace-nowrap text-xs font-mono">
              {{ formatDateTime(log.timestamp) }}
            </fwb-table-cell>
            <fwb-table-cell>
              <span class="text-xs font-medium">{{ getProfileName(log.personId) }}</span>
            </fwb-table-cell>
            <fwb-table-cell>
              <span
                :class="getActionBadgeClass(log.action)"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
              >
                {{ getActionLabel(log.action) }}
              </span>
            </fwb-table-cell>
            <fwb-table-cell>
              <span class="text-xs">{{ getChangedByLabel(log.changedBy) }}</span>
            </fwb-table-cell>
            <fwb-table-cell>
              <div v-if="log.changes && log.changes.length > 0" class="flex flex-wrap gap-1">
                <fwb-badge v-for="c in log.changes" :key="c.field" type="dark" size="sm">
                  {{ c.field }}
                </fwb-badge>
              </div>
              <span v-else class="text-xs text-gray-400">--</span>
            </fwb-table-cell>
          </fwb-table-row>
        </fwb-table-body>
      </fwb-table>

      <Pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total="totalLogs"
        @change="fetchLogs"
      />
    </div>

    <div v-else class="text-center py-12 app-card border-2 border-dashed">
      <p class="text-gray-500 text-sm">{{ t('audit.noRecords') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { auditService, type ProfileAuditLog } from '@/services/auditService';
  import { apiClient as api } from '@/api';
  import SearchableSelect, { type SelectItem } from '@/components/common/SearchableSelect.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import { formatDateTime } from '@/utils/dateTime';
  import type { User } from '@/types/user';
  import {
    FwbTable,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableBody,
    FwbTableRow,
    FwbTableCell,
    FwbButton,
    FwbBadge,
  } from 'flowbite-vue';
  import IconLucideSearch from '~icons/lucide/search';
  import { handleApiError } from '@/api/errorHandler';

  const { t } = useI18n();

  const logs = ref<ProfileAuditLog[]>([]);
  const loading = ref(false);
  const currentPage = ref(0);
  const pageSize = ref(10);
  const totalPages = ref(0);
  const totalLogs = ref(0);

  const profiles = ref<User[]>([]);
  const loadingProfiles = ref(false);

  const filters = ref({
    personId: '',
    changedBy: '',
    action: '',
    from: '',
    to: '',
  });

  const profileOptions = computed<SelectItem[]>(() =>
    profiles.value.map((p) => ({
      value: p.id,
      label: `${p.firstName} ${p.lastName}`,
      subtitle: p.email,
    }))
  );

  const getProfileName = (id: string) => {
    const p = profiles.value.find((p) => p.id === id);
    return p?.firstName ? `${p.firstName} ${p.lastName}` : id;
  };

  const getActionBadgeClass = (action: string) => {
    if (action === 'CREATED') return 'bg-green-100 text-green-800';
    if (action === 'UPDATED') return 'bg-blue-100 text-blue-800';
    if (action === 'BAJA') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActionLabel = (action: string) => {
    const map: Record<string, string> = {
      CREATED: t('auditLogs.actions.creation'),
      UPDATED: t('auditLogs.actions.edit'),
      BAJA: t('auditLogs.actions.removal'),
    };
    return map[action] || action;
  };

  const getChangedByLabel = (val?: string) => {
    return val || t('auditLogs.unidentifiedUser');
  };

  const fetchLogs = async () => {
    loading.value = true;
    try {
      const res = await auditService.getProfileAudit({
        ...filters.value,
        page: currentPage.value,
        pageSize: pageSize.value,
      });
      logs.value = res.data || [];
      totalLogs.value = res.meta?.total || 0;
      totalPages.value = Math.ceil(totalLogs.value / pageSize.value);
    } catch (error) {
      console.error(handleApiError(error).message);
    } finally {
      loading.value = false;
    }
  };

  const resetAndLoad = () => {
    currentPage.value = 0;
    fetchLogs();
  };

  const clearFilters = () => {
    filters.value = { personId: '', changedBy: '', action: '', from: '', to: '' };
    resetAndLoad();
  };

  onMounted(async () => {
    loadingProfiles.value = true;
    try {
      const res = await api.get('/persons', { params: { page: 0, pageSize: 1000 } });
      profiles.value = res.data.data || [];
    } catch (e) {
      console.error(handleApiError(e).message);
    } finally {
      loadingProfiles.value = false;
    }
    fetchLogs();
  });
</script>
