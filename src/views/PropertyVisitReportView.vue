<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-primary">
          {{ t('reports.propertyVisitReportTitle') }}
        </h1>
        <p class="text-secondary text-sm mt-1">
          {{ t('reports.propertyVisitReportSubtitle') }}
        </p>
      </div>

      <!-- Period Selector -->
      <div class="app-card rounded-xl overflow-hidden transition-colors">
        <div class="p-6">
          <div class="flex flex-col sm:flex-row gap-4 items-end">
            <!-- Month -->
            <div class="flex-1">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('reports.month') }}
              </label>
              <select
                v-model="selectedMonth"
                @change="loadReport"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option v-for="opt in monthOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <!-- Year -->
            <div class="flex-1">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('reports.year') }}
              </label>
              <select
                v-model="selectedYear"
                @change="loadReport"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <fwb-spinner size="12" />
        <p class="mt-4 text-secondary">{{ t('common.loading') }}</p>
      </div>

      <!-- Error State -->
      <fwb-alert v-else-if="error" type="danger" closable @close="error = null">
        {{ error }}
      </fwb-alert>

      <!-- Empty State -->
      <div
        v-else-if="reportData !== null && reportData.rankings.length === 0"
        class="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <IconLucideBarChart2 class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {{ t('reports.noVisitDataTitle') }}
        </h3>
        <p class="text-secondary text-sm">
          {{ t('reports.noVisitDataText') }}
        </p>
      </div>

      <!-- Report Content -->
      <div v-else-if="reportData && reportData.rankings.length > 0" class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Total Properties -->
          <div class="app-card rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div class="p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-medium text-secondary uppercase tracking-wider">
                    {{ t('reports.totalPropertiesWithVisits') }}
                  </p>
                  <p class="text-2xl font-bold text-primary mt-2">
                    {{ reportData.totalProperties }}
                  </p>
                </div>
                <div class="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                  <IconLucideBuilding2 class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          <!-- Top Property -->
          <div class="app-card rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div class="p-5">
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-secondary uppercase tracking-wider">
                    {{ t('reports.topProperty') }}
                  </p>
                  <p class="text-base font-bold text-primary mt-2 truncate">
                    {{ reportData.rankings[0]?.propertyName || '-' }}
                  </p>
                  <p class="text-xs text-secondary truncate">
                    {{ reportData.rankings[0]?.propertyAddress }}
                  </p>
                </div>
                <div class="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3 ml-3 flex-shrink-0">
                  <span class="text-2xl">🏆</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ranking Table -->
        <div class="app-card rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-secondary">
              <thead
                class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600"
              >
                <tr>
                  <th scope="col" class="px-6 py-3 text-center w-20">
                    {{ t('reports.columnPosition') }}
                  </th>
                  <th scope="col" class="px-6 py-3">
                    {{ t('reports.columnPropertyName') }}
                  </th>
                  <th scope="col" class="px-6 py-3">
                    {{ t('reports.columnPropertyAddress') }}
                  </th>
                  <th scope="col" class="px-6 py-3 text-center w-28">
                    {{ t('reports.columnVisits') }}
                  </th>
                  <th scope="col" class="px-6 py-3">
                    {{ t('reports.columnResponsibleAgent') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in reportData.rankings"
                  :key="item.propertyId"
                  :class="getRowClass(item.rank)"
                  class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <!-- Rank -->
                  <td class="px-6 py-4 text-center font-medium">
                    <div class="flex items-center justify-center gap-1">
                      <span v-if="item.rank <= 3" :class="getMedalClass(item.rank)" class="text-lg">
                        {{ item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉' }}
                      </span>
                      <span v-else class="font-bold text-secondary">{{ item.rank }}</span>
                    </div>
                  </td>

                  <!-- Property Name -->
                  <td class="px-6 py-4 font-medium text-primary">
                    {{ item.propertyName || '-' }}
                  </td>

                  <!-- Address -->
                  <td class="px-6 py-4 text-secondary">
                    {{ item.propertyAddress || '-' }}
                  </td>

                  <!-- Visit Count -->
                  <td class="px-6 py-4 text-center">
                    <span
                      class="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 min-w-10"
                    >
                      {{ item.visitCount }}
                    </span>
                  </td>

                  <!-- Agent -->
                  <td class="px-6 py-4 text-secondary">
                    {{ item.agentName || '-' }}
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
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbSpinner, FwbAlert } from 'flowbite-vue';
  import IconLucideBarChart2 from '~icons/lucide/bar-chart-2';
  import IconLucideBuilding2 from '~icons/lucide/building-2';
  import { useVisitReport } from '@/composables/useVisitReport';

  const { t, locale } = useI18n();
  const { reportData, loading, error, fetchReport } = useVisitReport();

  const now = new Date();
  const selectedMonth = ref<number>(now.getMonth() + 1);
  const selectedYear = ref<number>(now.getFullYear());

  const monthOptions = computed(() =>
    Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Intl.DateTimeFormat(locale.value, { month: 'long' }).format(new Date(2000, i, 1)),
    }))
  );

  const yearOptions = computed(() => {
    const current = now.getFullYear();
    return Array.from({ length: 4 }, (_, i) => current - 2 + i);
  });

  function loadReport() {
    fetchReport(selectedMonth.value, selectedYear.value);
  }

  onMounted(() => {
    loadReport();
  });

  const getRowClass = (rank: number): string => {
    if (rank === 1)
      return 'bg-gradient-to-r from-yellow-50/30 to-transparent dark:from-yellow-900/5';
    if (rank === 2)
      return 'bg-gradient-to-r from-slate-50/30 to-transparent dark:from-slate-700/5';
    if (rank === 3)
      return 'bg-gradient-to-r from-orange-50/30 to-transparent dark:from-orange-900/5';
    return '';
  };

  const getMedalClass = (rank: number): string => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-slate-400';
    return 'text-orange-500';
  };
</script>
