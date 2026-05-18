<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5"
  >
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="flex items-center gap-2">
        <IconLucideClock class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <div>
          <h2 class="text-sm font-bold text-gray-700 dark:text-white uppercase tracking-wider">
            {{ t('agentDashboard.inventoryMetricsTitle') }}
          </h2>
          <p class="text-xs text-gray-400 dark:text-gray-500">
            {{ t('agentDashboard.inventoryMetricsSubtitle') }}
          </p>
        </div>
      </div>
      <!-- Operation type filter -->
      <select
        v-model="selectedOpType"
        @change="reload"
        class="text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">{{ t('agentDashboard.inventoryMetricsAll') }}</option>
        <option value="VENTA">{{ t('agentDashboard.sale') }}</option>
        <option value="ALQUILER">{{ t('agentDashboard.rent') }}</option>
        <option value="ANTICRETICO">{{ t('agentDashboard.anticretic') }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-6 gap-2 text-gray-400">
      <div
        class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"
      ></div>
      <span class="text-sm">{{ t('agentDashboard.inventoryMetricsLoading') }}</span>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="text-sm text-red-500 dark:text-red-400 py-3 text-center"
    >
      {{ t('agentDashboard.inventoryMetricsError') }}
    </div>

    <!-- Data -->
    <div v-else-if="metrics" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <!-- Average days (main KPI) -->
      <div
        class="col-span-2 sm:col-span-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 flex flex-col items-center justify-center text-center"
      >
        <span class="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
          {{ Math.round(metrics.averageDaysInInventory) }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {{ t('agentDashboard.inventoryMetricsDaysUnit') }}
        </span>
        <span class="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1">
          {{ t('agentDashboard.inventoryMetricsAvg') }}
        </span>
      </div>

      <!-- Sold -->
      <div
        class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex flex-col items-center justify-center text-center"
      >
        <IconLucideCheckCircle class="w-5 h-5 text-green-600 dark:text-green-400 mb-1" />
        <span class="text-xl font-bold text-green-600 dark:text-green-400">
          {{ metrics.totalSoldProperties }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {{ t('agentDashboard.inventoryMetricsSold') }}
        </span>
      </div>

      <!-- Retired -->
      <div
        class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 flex flex-col items-center justify-center text-center"
      >
        <IconLucideArchive class="w-5 h-5 text-orange-500 dark:text-orange-400 mb-1" />
        <span class="text-xl font-bold text-orange-500 dark:text-orange-400">
          {{ metrics.totalRetiredProperties }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {{ t('agentDashboard.inventoryMetricsRetired') }}
        </span>
      </div>

      <!-- Active -->
      <div
        class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex flex-col items-center justify-center text-center"
      >
        <IconLucideBuilding class="w-5 h-5 text-gray-500 dark:text-gray-400 mb-1" />
        <span class="text-xl font-bold text-gray-700 dark:text-gray-200">
          {{ metrics.totalActiveProperties }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {{ t('agentDashboard.inventoryMetricsActive') }}
        </span>
      </div>
    </div>

    <!-- Applied filter badge -->
    <div v-if="metrics && selectedOpType" class="mt-3 flex items-center gap-1">
      <span class="text-xs text-gray-400">{{ t('agentDashboard.inventoryMetricsFilteredBy') }}</span>
      <span
        class="text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
      >
        {{ opTypeLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import IconLucideClock from '~icons/lucide/clock';
  import IconLucideCheckCircle from '~icons/lucide/check-circle';
  import IconLucideArchive from '~icons/lucide/archive';
  import IconLucideBuilding from '~icons/lucide/building';
  import { useInventoryMetrics } from '@/composables/useInventoryMetrics';

  const { t } = useI18n();
  const { metrics, loading, error, fetchMetrics } = useInventoryMetrics();

  const selectedOpType = ref('');

  const opTypeLabel = computed(() => {
    const labels: Record<string, string> = {
      VENTA: t('agentDashboard.sale'),
      ALQUILER: t('agentDashboard.rent'),
      ANTICRETICO: t('agentDashboard.anticretic'),
    };
    return labels[selectedOpType.value] ?? selectedOpType.value;
  });

  async function reload() {
    await fetchMetrics(selectedOpType.value || undefined);
  }

  onMounted(reload);
</script>
