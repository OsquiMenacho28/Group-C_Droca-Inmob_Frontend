<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('reports.agentRankingTitle') }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {{ t('reports.agentRankingSubtitle') }}
          </p>
        </div>
      </div>

      <!-- Filters Card -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors"
      >
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('reports.startDate') }}
              </label>
              <fwb-input
                v-model="filters.startDate"
                type="date"
                @change="debouncedFetch"
                class="w-full"
              />
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('reports.endDate') }}
              </label>
              <fwb-input
                v-model="filters.endDate"
                type="date"
                @change="debouncedFetch"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <fwb-spinner size="12" />
        <p class="mt-4 text-gray-500 dark:text-gray-400">{{ t('common.loading') }}</p>
      </div>

      <!-- Error State -->
      <fwb-alert v-else-if="error" type="danger" closable @close="error = ''">
        {{ error }}
      </fwb-alert>

      <!-- Empty State -->
      <div
        v-else-if="!rankingData?.ranking?.length"
        class="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <IconLucideTrophy class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {{ t('reports.noRankingDataTitle') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          {{ t('reports.noRankingDataText') }}
        </p>
      </div>

      <!-- Ranking Content -->
      <div v-else class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Closed Sales -->
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div class="p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {{ t('reports.totalClosedSales') }}
                  </p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {{ rankingData?.totalClosedSales || 0 }}
                  </p>
                </div>
                <div class="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                  <IconLucideTrophy class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          <!-- Total Agents -->
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div class="p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {{ t('reports.totalAgents') }}
                  </p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {{ rankingData?.ranking?.length || 0 }}
                  </p>
                </div>
                <div class="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
                  <IconLucideMedal class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          <!-- Top Agent -->
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div class="p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {{ t('reports.topAgent') }}
                  </p>
                  <p class="text-base font-bold text-gray-900 dark:text-white mt-2 truncate">
                    {{ rankingData?.ranking[0]?.agentName || '-' }}
                  </p>
                </div>
                <div class="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3">
                  <span class="text-2xl">🥇</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Average Sales -->
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div class="p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {{ t('reports.averageSales') }}
                  </p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {{ averageSales }}
                  </p>
                </div>
                <div class="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                  <span class="text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ranking Table -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead
                class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600"
              >
                <tr>
                  <th scope="col" class="px-6 py-3 text-center w-24">
                    {{ t('reports.columnPosition') }}
                  </th>
                  <th scope="col" class="px-6 py-3">
                    {{ t('reports.columnAgent') }}
                  </th>
                  <th scope="col" class="px-6 py-3 text-center w-32">
                    {{ t('reports.columnSales') }}
                  </th>
                  <th scope="col" class="px-6 py-3 text-right w-32">
                    {{ t('reports.columnPercentage') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in rankingData?.ranking"
                  :key="item.agentId"
                  :class="getRowClass(item.position)"
                  class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <!-- Position -->
                  <td class="px-6 py-4 text-center font-medium">
                    <div class="flex items-center justify-center gap-2">
                      <IconLucideMedal
                        v-if="item.position <= 3"
                        :class="getMedalClass(item.position)"
                        class="w-5 h-5"
                      />
                      <span :class="{ 'font-bold': item.position <= 3 }">
                        {{ item.position }}
                      </span>
                    </div>
                  </td>

                  <!-- Agent Name -->
                  <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div class="flex items-center gap-3">
                      <div :class="getAvatarClass(item.position)">
                        {{ getInitials(item.agentName) }}
                      </div>
                      <span>{{ item.agentName }}</span>
                    </div>
                  </td>

                  <!-- Sales Count -->
                  <td class="px-6 py-4 text-center">
                    <span
                      class="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 min-w-[40px]"
                    >
                      {{ item.closedSales }}
                    </span>
                  </td>

                  <!-- Percentage -->
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <div
                        class="flex-1 max-w-[60px] bg-gray-200 dark:bg-gray-700 rounded-full h-1.5"
                      >
                        <div
                          class="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                          :style="{ width: `${item.percentageOfTotal}%` }"
                        ></div>
                      </div>
                      <span
                        class="font-mono font-bold text-blue-600 dark:text-blue-400 min-w-[45px]"
                      >
                        {{ item.percentageOfTotal }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, onMounted, computed, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbInput, FwbSpinner, FwbAlert } from 'flowbite-vue';
  import IconLucideTrophy from '~icons/lucide/trophy';
  import IconLucideMedal from '~icons/lucide/medal';
  import { useAgentRanking } from '@/composables/useAgentRanking';
  import type { AgentRankingFilters } from '@/types/ranking';

  const { t } = useI18n();
  const { rankingData, loading, error, fetchRanking } = useAgentRanking();

  // Default: last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const filters = reactive<AgentRankingFilters>({
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  });

  const averageSales = computed(() => {
    if (!rankingData.value?.ranking?.length) return '0';
    const total = rankingData.value.ranking.reduce((sum, item) => sum + item.closedSales, 0);
    const avg = total / rankingData.value.ranking.length;
    return avg.toFixed(1);
  });

  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debouncedFetch = () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      const f: AgentRankingFilters = {
        startDate: filters.startDate
          ? new Date(filters.startDate).toISOString()
          : thirtyDaysAgo.toISOString(),
        endDate: filters.endDate
          ? new Date(filters.endDate + 'T23:59:59').toISOString()
          : today.toISOString(),
      };
      fetchRanking(f);
    }, 500);
  };

  onMounted(() => {
    debouncedFetch();
  });

  onUnmounted(() => {
    if (timeout) clearTimeout(timeout);
  });

  const getRowClass = (position: number): string => {
    if (position === 1)
      return 'bg-gradient-to-r from-yellow-50/30 to-transparent dark:from-yellow-900/5';
    if (position === 2)
      return 'bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-700/5';
    if (position === 3)
      return 'bg-gradient-to-r from-orange-50/30 to-transparent dark:from-orange-900/5';
    return '';
  };

  const getMedalClass = (position: number): string => {
    if (position === 1) return 'text-yellow-500 dark:text-yellow-400';
    if (position === 2) return 'text-slate-400 dark:text-slate-500';
    if (position === 3) return 'text-orange-500 dark:text-orange-400';
    return '';
  };

  const getAvatarClass = (position: number): string => {
    const baseClass = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold';
    if (position === 1)
      return `${baseClass} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300`;
    if (position === 2)
      return `${baseClass} bg-slate-100 dark:bg-slate-700/30 text-slate-700 dark:text-slate-300`;
    if (position === 3)
      return `${baseClass} bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300`;
    return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400`;
  };

  const getInitials = (name: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
</script>
