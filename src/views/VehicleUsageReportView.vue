<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-primary">
            {{ t('vehicleAdmin.usageReport') }}
          </h1>
          <p class="text-secondary text-sm mt-1">
            {{ t('vehicleAdmin.usageReportSubtitle') }}
          </p>
        </div>
        <fwb-button color="alternative" @click="router.back()">
          {{ t('common.back') }}
        </fwb-button>
      </div>

      <!-- Filters Card -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('reports.startDate') }}
              </label>
              <fwb-input
                v-model="filters.startDate"
                type="date"
                @change="fetchReport"
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
                @change="fetchReport"
                class="w-full"
              />
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('vehicleAdmin.columnVehicle') }}
              </label>
              <select
                v-model="filters.vehicleId"
                @change="fetchReport"
                class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{{ t('common.all') }}</option>
                <option v-for="v in allVehicles" :key="v.id" :value="v.id">
                  {{ v.licensePlate }} - {{ v.brand }} {{ v.model }}
                </option>
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
      <fwb-alert v-else-if="error" type="danger" closable @close="error = ''">
        {{ error }}
      </fwb-alert>

      <!-- Empty State -->
      <div
        v-else-if="!reportData?.vehicles?.length"
        class="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div
          class="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <span class="text-2xl">🚗</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {{ t('vehicleAdmin.noUsageDataTitle') }}
        </h3>
        <p class="text-secondary text-sm">
          {{ t('vehicleAdmin.noUsageDataText') }}
        </p>
      </div>

      <!-- Report Content -->
      <div v-else class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-secondary uppercase tracking-wider">
                  {{ t('vehicleAdmin.totalHours') }}
                </p>
                <p class="text-2xl font-bold text-primary mt-2">{{ totalHours.toFixed(1) }}h</p>
              </div>
              <div class="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 text-2xl">⏱️</div>
            </div>
          </div>

          <div
            class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-secondary uppercase tracking-wider">
                  {{ t('vehicleAdmin.visitCount') }}
                </p>
                <p class="text-2xl font-bold text-primary mt-2">
                  {{ totalVisits }}
                </p>
              </div>
              <div class="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 text-2xl">📅</div>
            </div>
          </div>

          <div
            class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-secondary uppercase tracking-wider">
                  {{ t('vehicleAdmin.totalMileage') }}
                </p>
                <p class="text-2xl font-bold text-primary mt-2">{{ totalMileage.toFixed(1) }} km</p>
              </div>
              <div class="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-2xl">🛣️</div>
            </div>
          </div>
        </div>

        <!-- Report Table -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead
                class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
              >
                <tr>
                  <th class="px-6 py-3">{{ t('vehicleAdmin.columnVehicle') }}</th>
                  <th class="px-6 py-3 text-center">{{ t('vehicleAdmin.columnTotalHours') }}</th>
                  <th class="px-6 py-3 text-center">{{ t('vehicleAdmin.columnVisits') }}</th>
                  <th class="px-6 py-3 text-center">{{ t('vehicleAdmin.columnMileage') }}</th>
                  <th class="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <template v-for="vehicle in reportData.vehicles" :key="vehicle.vehicleId">
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="font-medium text-primary">{{ vehicle.licensePlate }}</div>
                      <div class="text-xs text-secondary">
                        {{ vehicle.brand }} {{ vehicle.model }}
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {{ vehicle.totalHours.toFixed(1) }}h
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      {{ vehicle.visitCount }}
                    </td>
                    <td class="px-6 py-4 text-center">{{ vehicle.totalMileage.toFixed(1) }} km</td>
                    <td class="px-6 py-4 text-right">
                      <fwb-button
                        size="xs"
                        color="alternative"
                        @click="toggleDetails(vehicle.vehicleId)"
                      >
                        {{
                          expandedVehicle === vehicle.vehicleId
                            ? t('common.close')
                            : t('vehicleAdmin.viewDetails')
                        }}
                      </fwb-button>
                    </td>
                  </tr>
                  <!-- Details Row -->
                  <tr
                    v-if="expandedVehicle === vehicle.vehicleId"
                    class="bg-gray-50/50 dark:bg-gray-800/50"
                  >
                    <td colspan="5" class="px-6 py-4">
                      <div class="space-y-3">
                        <h4 class="text-xs font-semibold uppercase text-secondary tracking-wider">
                          {{ t('vehicleAdmin.usageDetails') }}
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div
                            v-for="detail in vehicle.details"
                            :key="detail.visitId"
                            class="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm"
                          >
                            <div class="flex justify-between items-start mb-2">
                              <span class="text-xs font-medium text-primary">
                                {{ formatDate(detail.date) }}
                              </span>
                              <span
                                class="text-[10px] bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded"
                              >
                                ID: {{ detail.visitId.slice(-6) }}
                              </span>
                            </div>
                            <div class="flex justify-between text-sm">
                              <span class="text-secondary">
                                ⏱️ {{ detail.durationHours.toFixed(1) }}h
                              </span>
                              <span class="text-secondary">
                                🛣️ {{ detail.mileage.toFixed(1) }}km
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { FwbInput, FwbSpinner, FwbAlert, FwbButton } from 'flowbite-vue';
  import vehicleService from '@/services/vehicleService';
  import type { Vehicle, VehicleUsageReportResponse } from '@/types/visitCalendar';

  const { t } = useI18n();
  const router = useRouter();

  const loading = ref(false);
  const error = ref('');
  const reportData = ref<VehicleUsageReportResponse | null>(null);
  const allVehicles = ref<Vehicle[]>([]);
  const expandedVehicle = ref<string | null>(null);

  // Default: current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const filters = reactive({
    startDate: firstDayOfMonth.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    vehicleId: '',
  });

  const fetchReport = async () => {
    loading.value = true;
    error.value = '';
    try {
      const from = new Date(filters.startDate).toISOString();
      const to = new Date(filters.endDate + 'T23:59:59').toISOString();
      reportData.value = await vehicleService.getVehicleUsageReport(from, to, filters.vehicleId);
    } catch (err) {
      error.value = t('vehicleAdmin.loadError');
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const loadVehicles = async () => {
    try {
      allVehicles.value = await vehicleService.getVehicles();
    } catch (err) {
      console.error('Error loading vehicles', err);
    }
  };

  const totalHours = computed(() => {
    if (!reportData.value) return 0;
    return reportData.value.vehicles.reduce((sum, v) => sum + v.totalHours, 0);
  });

  const totalVisits = computed(() => {
    if (!reportData.value) return 0;
    return reportData.value.vehicles.reduce((sum, v) => sum + v.visitCount, 0);
  });

  const totalMileage = computed(() => {
    if (!reportData.value) return 0;
    return reportData.value.vehicles.reduce((sum, v) => sum + v.totalMileage, 0);
  });

  const toggleDetails = (id: string) => {
    expandedVehicle.value = expandedVehicle.value === id ? null : id;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  onMounted(() => {
    loadVehicles();
    fetchReport();
  });
</script>
