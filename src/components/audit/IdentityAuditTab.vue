<template>
  <div class="space-y-6">
    <div
      class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchableSelect
          v-model="filters.userId"
          :items="userOptions"
          :label="t('audit.filters.user')"
          :placeholder="t('audit.filters.searchUser')"
          :loading="loadingUsers"
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
            <option value="USER_LOGIN">LOGIN</option>
            <option value="USER_LOGOUT">LOGOUT</option>
            <option value="USER_CREATE">CREATE</option>
            <option value="USER_UPDATE">UPDATE</option>
            <option value="USER_DEACTIVATE">DEACTIVATE</option>
            <option value="USER_REACTIVATE">REACTIVATE</option>
            <option value="PASSWORD_CHANGE">PASSWORD CHANGE</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('audit.filters.from') }}
            </label>
            <input
              v-model="filters.from"
              type="date"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {{ t('audit.filters.to') }}
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
      <fwb-table hoverable class="min-w-full">
        <fwb-table-head>
          <fwb-table-head-cell class="w-40">{{ t('audit.table.dateTime') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('audit.table.user') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('audit.table.action') }}</fwb-table-head-cell>
          <fwb-table-head-cell>{{ t('audit.table.details') }}</fwb-table-head-cell>
          <fwb-table-head-cell>
            <span class="sr-only">{{ t('audit.table.details') }}</span>
          </fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="log in logs" :key="log.id" class="group">
            <fwb-table-cell class="whitespace-nowrap text-[11px] font-mono text-gray-500">
              {{ formatDateTime(log.timestamp) }}
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {{ getUserName(log.userId) }}
                </span>
                <span v-if="log.performedBy" class="text-[10px] text-gray-400">
                  {{ t('auditLogs.by') }} {{ getUserName(log.performedBy) }}
                </span>
              </div>
            </fwb-table-cell>
            <fwb-table-cell>
              <span
                :class="getActionBadgeClass(log.action)"
                class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm"
              >
                {{ getActionLabel(log.action) }}
              </span>
            </fwb-table-cell>
            <fwb-table-cell>
              <p class="text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">
                {{ log.details }}
              </p>
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
      <p class="text-gray-500 text-sm">{{ t('audit.noRecords') }}</p>
    </div>

    <!-- Details Modal -->
    <fwb-modal v-if="selectedLog" @close="selectedLog = null" size="xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div :class="getActionBadgeClass(selectedLog.action)" class="p-2 rounded-lg shadow-sm">
            <IconLucideShieldCheck class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold dark:text-white leading-tight">
              {{ getActionLabel(selectedLog.action) }}
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
                {{ t('audit.table.user') }}
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
              <p class="text-[10px] text-gray-500 ml-10">{{ selectedLog.userEmail || '--' }}</p>
            </div>
            <div class="space-y-1" v-if="selectedLog.performedBy">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {{ t('auditLogs.performedBy') }}
              </span>
              <div class="flex items-center gap-2 mt-1">
                <div
                  class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold uppercase"
                >
                  {{ getUserName(selectedLog.performedBy).charAt(0) }}
                </div>
                <p class="text-sm font-bold dark:text-white">
                  {{ getUserName(selectedLog.performedBy) }}
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
                    <p class="text-sm text-red-600 font-medium break-all">
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
                    <p class="text-sm text-green-700 font-bold break-all">{{ change.newValue }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedLog.details" class="space-y-2">
            <div class="flex items-center gap-2">
              <div class="h-px flex-1 bg-gray-100 dark:bg-gray-700"></div>
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {{ t('audit.table.details') }}
              </span>
              <div class="h-px flex-1 bg-gray-100 dark:bg-gray-700"></div>
            </div>
            <div
              class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
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
  import { auditService, type IdentityAuditLog } from '@/services/auditService';
  import { userService } from '@/services/userService';
  import type { User } from '@/types/user';
  import SearchableSelect, { type SelectItem } from '@/components/common/SearchableSelect.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import {
    FwbTable,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableBody,
    FwbTableRow,
    FwbTableCell,
    FwbButton,
    FwbModal,
  } from 'flowbite-vue';
  import IconLucideSearch from '~icons/lucide/search';
  import IconLucideEye from '~icons/lucide/eye';
  import IconLucideShieldCheck from '~icons/lucide/shield-check';
  import IconLucideArrowRight from '~icons/lucide/arrow-right';
  import { handleApiError } from '@/api/errorHandler';

  const { t } = useI18n();

  const logs = ref<IdentityAuditLog[]>([]);
  const loading = ref(false);
  const selectedLog = ref<IdentityAuditLog | null>(null);
  const currentPage = ref(0);
  const pageSize = ref(10);
  const totalPages = ref(0);
  const totalLogs = ref(0);

  const users = ref<User[]>([]);
  const loadingUsers = ref(false);

  const filters = ref({
    userId: '',
    action: '',
    from: '',
    to: '',
  });

  const userOptions = computed<SelectItem[]>(() =>
    users.value.map((u) => ({ value: u.id, label: u.fullName || u.email, subtitle: u.userType }))
  );

  const getUserName = (id?: string) => {
    if (!id) return t('auditLogs.unidentifiedUser');
    const u = users.value.find((u) => u.id === id);
    return u?.fullName || u?.email || id;
  };

  const formatDateTime = (ts: string) => new Date(ts).toLocaleString(getLocaleString());

  const getActionBadgeClass = (action: string) => {
    if (action.includes('CREATE'))
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (action.includes('UPDATE'))
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (action.includes('DELETE') || action.includes('DEACTIVATE'))
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (action.includes('LOGIN'))
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    if (action.includes('LOGOUT'))
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    if (action.includes('REACTIVATE'))
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getActionLabel = (action: string) => {
    const map: Record<string, string> = {
      USER_LOGIN: 'LOGIN',
      USER_LOGOUT: 'LOGOUT',
      USER_CREATE: t('auditLogs.actions.creation'),
      USER_UPDATE: t('auditLogs.actions.edit'),
      USER_DEACTIVATE: t('auditLogs.actions.deactivation'),
      USER_REACTIVATE: t('auditLogs.actions.reactivation'),
      PASSWORD_CHANGE: t('auditLogs.actions.passwordChange'),
    };
    return map[action] || action;
  };

  const fetchLogs = async () => {
    loading.value = true;
    try {
      const res = await auditService.getIdentityAudit({
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
    filters.value = { userId: '', action: '', from: '', to: '' };
    resetAndLoad();
  };

  const openModal = (log: IdentityAuditLog) => {
    selectedLog.value = log;
  };

  onMounted(async () => {
    loadingUsers.value = true;
    try {
      const uRes = await userService.getUsers(0, 1000);
      users.value = uRes.data || [];
    } catch (e) {
      console.error(handleApiError(e).message);
    } finally {
      loadingUsers.value = false;
    }
    fetchLogs();
  });
</script>
