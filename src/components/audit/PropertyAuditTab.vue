<template>
  <div class="space-y-6">
    <div
      class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchableSelect
          v-model="filters.userId"
          :items="userOptions"
          :label="t('propertyAudit.agentUserLabel')"
          :placeholder="t('propertyAudit.searchAgent')"
          :loading="loadingUsers"
          show-clear-button
        />

        <SearchableSelect
          v-model="filters.propertyId"
          :items="propertyOptions"
          :label="t('propertyAudit.propertyLabel')"
          :placeholder="t('propertyAudit.searchProperty')"
          :loading="loadingProperties"
          show-clear-button
        />

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('propertyAudit.from') }}
            </label>
            <input
              v-model="filters.from"
              type="date"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('propertyAudit.to') }}
            </label>
            <input
              v-model="filters.to"
              type="date"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <fwb-button @click="resetAndLoad" gradient="blue" size="sm">
          <div class="flex items-center gap-2">
            <IconLucideSearch class="w-4 h-4" />
            {{ t('propertyAudit.filter') }}
          </div>
        </fwb-button>
        <fwb-button @click="clearFilters" color="alternative" size="sm">
          {{ t('propertyAudit.clearFilters') }}
        </fwb-button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500 text-sm">{{ t('propertyAudit.loading') }}</p>
    </div>

    <div v-else-if="logs.length > 0" class="overflow-x-auto">
      <fwb-table hoverable class="min-w-full">
        <fwb-table-head>
          <fwb-table-head-cell class="w-40">
            {{ t('propertyAudit.table.dateTime') }}
          </fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('propertyAudit.table.agent') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('propertyAudit.table.action') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('propertyAudit.table.property') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('propertyAudit.table.change') }}</fwb-table-head-cell>
          <fwb-table-head-cell>
            <span class="sr-only">{{ t('propertyAudit.table.details') }}</span>
          </fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="log in logs" :key="log.id" class="group">
            <fwb-table-cell class="whitespace-nowrap text-[11px] font-mono text-gray-500">
              {{ formatDateTime(log.timestamp) }}
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex items-center gap-2">
                <div
                  class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 uppercase"
                >
                  {{ getUserName(log.userId).substring(0, 2) }}
                </div>
                <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {{ getUserName(log.userId) }}
                </span>
              </div>
            </fwb-table-cell>
            <fwb-table-cell>
              <span
                :class="getActionBadgeClass(log.action)"
                class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm"
              >
                {{ formatAction(log.action) }}
              </span>
            </fwb-table-cell>
            <fwb-table-cell>
              <span
                class="text-xs font-medium text-gray-600 dark:text-gray-400 truncate max-w-[150px] block"
                :title="getPropertyName(log.propertyId)"
              >
                {{ getPropertyName(log.propertyId) }}
              </span>
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex items-center gap-2 text-[10px]">
                <span
                  v-if="log.previousValue"
                  class="text-red-400 line-through opacity-70 truncate max-w-[100px]"
                >
                  {{ log.previousValue }}
                </span>
                <IconLucideArrowRight v-if="log.previousValue" class="w-3 h-3 text-gray-300" />
                <span class="text-green-600 font-black truncate max-w-[120px]">
                  {{ log.newValue || t('common.noValue') }}
                </span>
              </div>
            </fwb-table-cell>
            <fwb-table-cell class="text-right">
              <button
                @click="openModal(log)"
                class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              >
                <IconLucideEye class="w-4 h-4" />
              </button>
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

    <div
      v-else
      class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <p class="text-gray-500 text-sm">{{ t('propertyAudit.noResultsTitle') }}</p>
    </div>

    <!-- Details Modal -->
    <fwb-modal v-if="selectedLog" @close="selectedLog = null" size="xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div :class="getActionBadgeClass(selectedLog.action)" class="p-2 rounded-lg shadow-sm">
            <IconLucideHistory class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold dark:text-white leading-tight">
              {{ formatAction(selectedLog.action) }}
            </h3>
            <p class="text-xs text-gray-500 font-mono">
              {{ formatDateTime(selectedLog.timestamp) }}
            </p>
          </div>
        </div>
      </template>
      <template #body>
        <div class="space-y-6">
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            <div class="space-y-1">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {{ t('propertyAudit.agente') }}
              </span>
              <div class="flex items-center gap-2 mt-1">
                <div
                  class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold"
                >
                  {{ getUserName(selectedLog.userId).charAt(0) }}
                </div>
                <p class="text-sm font-bold dark:text-white">
                  {{ getUserName(selectedLog.userId) }}
                </p>
              </div>
            </div>
            <div class="space-y-1">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {{ t('propertyAudit.propiedad') }}
              </span>
              <div class="flex items-center gap-2 mt-1">
                <IconLucideHome class="w-5 h-5 text-gray-400" />
                <p class="text-sm font-bold dark:text-white">
                  {{ getPropertyName(selectedLog.propertyId) }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="selectedLog.changes && selectedLog.changes.length > 0" class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="h-px flex-1 bg-gray-100 dark:bg-gray-700"></div>
              <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {{ t('propertyAudit.modifiedFields') }}
              </h4>
              <div class="h-px flex-1 bg-gray-100 dark:bg-gray-700"></div>
            </div>

            <div class="grid grid-cols-1 gap-3">
              <div
                v-for="change in selectedLog.changes"
                :key="change.field"
                class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div class="flex items-center justify-between mb-3">
                  <span
                    class="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase"
                  >
                    {{ change.field }}
                  </span>
                </div>
                <div class="flex flex-col md:flex-row md:items-center gap-4">
                  <div
                    class="flex-1 bg-red-50/50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30"
                  >
                    <span class="block text-[9px] font-bold text-red-400 uppercase mb-1">
                      {{ t('auditLogs.oldValue') }}
                    </span>
                    <p
                      class="text-sm text-red-600 font-medium truncate"
                      :title="String(change.oldValue)"
                    >
                      {{ change.oldValue || '--' }}
                    </p>
                  </div>

                  <div class="hidden md:flex items-center justify-center">
                    <IconLucideArrowRight class="w-5 h-5 text-gray-300" />
                  </div>

                  <div
                    class="flex-1 bg-green-50/50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30"
                  >
                    <span class="block text-[9px] font-bold text-green-400 uppercase mb-1">
                      {{ t('auditLogs.newValue') }}
                    </span>
                    <p
                      class="text-sm text-green-700 font-bold truncate"
                      :title="String(change.newValue)"
                    >
                      {{ change.newValue }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="selectedLog.details" class="space-y-2">
            <div class="flex items-center gap-2">
              <div class="h-px flex-1 bg-gray-100 dark:bg-gray-700"></div>
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {{ t('audit.table.details') }}
              </span>
              <div class="h-px flex-1 bg-gray-100 dark:bg-gray-700"></div>
            </div>
            <div
              class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 italic text-sm text-gray-600 dark:text-gray-400"
            >
              {{ selectedLog.details }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end">
          <fwb-button @click="selectedLog = null" color="alternative" size="sm">
            {{ t('common.close') }}
          </fwb-button>
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';
  import { auditService, type PropertyAuditLog } from '@/services/auditService';
  import { userService } from '@/services/userService';
  import { propertyService } from '@/modules/properties';
  import SearchableSelect, { type SelectItem } from '@/components/common/SearchableSelect.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import type { User } from '@/types/user';
  import type { Property } from '@/types/property';
  import {
    FwbTable,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableBody,
    FwbTableRow,
    FwbTableCell,
    FwbModal,
    FwbButton,
  } from 'flowbite-vue';
  import IconLucideSearch from '~icons/lucide/search';
  import IconLucideArrowRight from '~icons/lucide/arrow-right';
  import IconLucideEye from '~icons/lucide/eye';
  import IconLucideHistory from '~icons/lucide/history';
  import IconLucideHome from '~icons/lucide/home';
  import { handleApiError } from '@/api/errorHandler';

  const { t } = useI18n();

  const logs = ref<PropertyAuditLog[]>([]);
  const loading = ref(false);
  const selectedLog = ref<PropertyAuditLog | null>(null);

  const currentPage = ref(0);
  const pageSize = ref(10);
  const totalPages = ref(0);
  const totalLogs = ref(0);

  const users = ref<User[]>([]);
  const properties = ref<Property[]>([]);
  const loadingUsers = ref(false);
  const loadingProperties = ref(false);

  const filters = ref({
    userId: '',
    propertyId: '',
    from: '',
    to: '',
  });

  const userOptions = computed<SelectItem[]>(() =>
    users.value.map((u) => ({
      value: u.id,
      label: u.fullName || `${u.firstName} ${u.lastName}`,
      subtitle: u.email,
    }))
  );

  const propertyOptions = computed<SelectItem[]>(() =>
    properties.value.map((p) => ({ value: p.id, label: p.title, subtitle: p.address }))
  );

  const getUserName = (id?: string) =>
    users.value.find((u) => u.id === id)?.fullName || id || t('auditLogs.unidentifiedUser');

  const getPropertyName = (id?: string) =>
    properties.value.find((p) => p.id === id)?.title || id || '--';

  const formatDateTime = (ts: string) => new Date(ts).toLocaleString(getLocaleString());

  const formatAction = (action: string) => {
    const map: Record<string, string> = {
      STATUS_CHANGE: t('propertyAudit.actions.statusChange'),
      PRICE_UPDATE: t('propertyAudit.actions.priceUpdate'),
      AGENT_ASSIGN: t('propertyAudit.actions.agentAssign'),
      PROPERTY_CREATE: t('propertyAudit.actions.propertyCreate'),
      PROPERTY_UPDATE: t('propertyAudit.actions.propertyUpdate'),
      LOCATION_UPDATE: t('propertyAudit.actions.locationUpdate'),
      OWNER_ASSIGN: t('propertyAudit.actions.ownerAssign'),
      PROPERTY_DELETE: t('propertyAudit.actions.propertyDelete'),
      PROPERTY_REINCORPORATE: t('propertyAudit.actions.reincorporate'),
    };
    return map[action] || action;
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'STATUS_CHANGE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'PRICE_UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PROPERTY_CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PROPERTY_DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'PROPERTY_REINCORPORATE':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'AGENT_ASSIGN':
      case 'OWNER_ASSIGN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const fetchLogs = async () => {
    loading.value = true;
    try {
      const res = await auditService.getPropertyAudit({
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
    filters.value = { userId: '', propertyId: '', from: '', to: '' };
    resetAndLoad();
  };

  const openModal = (log: PropertyAuditLog) => {
    selectedLog.value = log;
  };

  onMounted(async () => {
    loadingUsers.value = true;
    loadingProperties.value = true;
    try {
      const [uRes, pList] = await Promise.all([
        userService.getUsers(0, 1000),
        propertyService.getProperties({ pageSize: 1000 }),
      ]);
      users.value = uRes.data || [];
      properties.value = pList.data || [];
    } catch (e) {
      console.error(handleApiError(e).message);
    } finally {
      loadingUsers.value = false;
      loadingProperties.value = false;
    }
    fetchLogs();
  });
</script>
