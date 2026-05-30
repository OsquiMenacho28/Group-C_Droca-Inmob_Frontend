<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">
          {{ isAdmin ? 'Dashboard Gerencial' : t('dashboard.title') }}
        </h1>
        <p class="text-gray-500 text-sm dark:text-gray-400">
          {{
            isAdmin
              ? 'Resumen situacional de la inmobiliaria en tiempo real'
              : t('dashboard.welcome')
          }}
        </p>
      </div>

      <!-- Actions for Admin -->
      <div v-if="isAdmin" class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <span
          class="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          Última actualización: {{ lastUpdatedText }}
        </span>
        <button
          @click="fetchDashboardData"
          :disabled="loading"
          class="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <IconLucideRefreshCw :class="{ 'animate-spin': loading }" class="w-4 h-4" />
          <span>{{ loading ? 'Actualizando...' : 'Recargar' }}</span>
        </button>
      </div>
    </div>

    <!-- Admin View -->
    <div v-if="isAdmin" class="space-y-6">
      <!-- KPI Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Active Properties -->
        <div
          class="bg-white dark:bg-gray-800 p-6 rounded-2xl border-t-4 border-indigo-500 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300 ease-out flex items-center justify-between"
        >
          <div class="space-y-2">
            <h3
              class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Inmuebles Activos
            </h3>
            <p class="text-4xl font-extrabold text-gray-900 dark:text-white">
              {{ summary.activeProperties }}
            </p>
          </div>
          <div class="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
            <IconLucideBuilding2 class="w-8 h-8 text-indigo-500" />
          </div>
        </div>

        <!-- Weekly Visits -->
        <div
          class="bg-white dark:bg-gray-800 p-6 rounded-2xl border-t-4 border-emerald-500 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300 ease-out flex items-center justify-between"
        >
          <div class="space-y-2">
            <h3
              class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Visitas (Próximos 7 días)
            </h3>
            <p class="text-4xl font-extrabold text-gray-900 dark:text-white">
              {{ summary.weeklyVisits }}
            </p>
          </div>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
            <IconLucideCalendar class="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        <!-- Active Operations -->
        <div
          class="bg-white dark:bg-gray-800 p-6 rounded-2xl border-t-4 border-violet-500 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300 ease-out flex items-center justify-between"
        >
          <div class="space-y-2">
            <h3
              class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Operaciones en Curso
            </h3>
            <p class="text-4xl font-extrabold text-gray-900 dark:text-white">
              {{ summary.activeOperations }}
            </p>
          </div>
          <div class="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-xl">
            <IconLucideFileText class="w-8 h-8 text-violet-500" />
          </div>
        </div>
      </div>

      <!-- Chart Container -->
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Distribución de Inmuebles por Estado
        </h3>
        <div v-if="chartData && chartData.labels && chartData.labels.length > 0" class="h-[350px]">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
          <div class="animate-pulse flex space-x-4">
            <div class="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
          </div>
          <p class="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            Cargando distribución de estados...
          </p>
        </div>
      </div>
    </div>

    <!-- Non-Admin View (Legacy/Welcome View) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
      <div
        class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 class="font-semibold text-primary dark:text-white">
          {{ t('dashboard.systemStatus') }}
        </h3>
        <p class="text-sm text-green-500 font-medium mt-2 flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          {{ t('dashboard.allServicesOperational') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { apiClient as api } from '@/api';
  import type { ApiResponse } from '@/api/types';
  import { Bar } from 'vue-chartjs';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
  } from 'chart.js';
  import IconLucideBuilding2 from '~icons/lucide/building-2';
  import IconLucideCalendar from '~icons/lucide/calendar';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideRefreshCw from '~icons/lucide/refresh-cw';

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

  interface DashboardSummary {
    activeProperties: number;
    weeklyVisits: number;
    activeOperations: number;
  }

  type DistributionData = Record<string, number>;

  const { t } = useI18n();
  const authStore = useAuthStore();

  const user = computed(() => authStore.user as UserClaims | null);
  const isAdmin = computed(() => {
    const roles = (user.value?.roles || []) as string[];
    return roles.includes('ADMIN') || user.value?.userType === 'ADMIN';
  });

  // Admin Dashboard state
  const summary = ref<DashboardSummary>({
    activeProperties: 0,
    weeklyVisits: 0,
    activeOperations: 0,
  });
  const distribution = ref<DistributionData>({});
  const lastUpdated = ref<Date>(new Date());
  const loading = ref<boolean>(false);
  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  const lastUpdatedText = computed(() => {
    return lastUpdated.value.toLocaleTimeString('es-BO');
  });

  // Chart JS setup
  const chartData = computed(() => {
    if (!distribution.value || Object.keys(distribution.value).length === 0) {
      return null;
    }
    return {
      labels: Object.keys(distribution.value).map(formatLabel),
      datasets: [
        {
          label: 'Cantidad de Inmuebles',
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#a855f7'],
          borderRadius: 8,
          data: Object.values(distribution.value),
        },
      ],
    };
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 12,
        cornerRadius: 8,
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  function formatLabel(label: string): string {
    return label
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  const fetchDashboardData = async () => {
    if (!isAdmin.value) return;
    loading.value = true;
    try {
      const [resSummary, resDist] = await Promise.all([
        api.get<ApiResponse<DashboardSummary>>('/operations/dashboard/resumen'),
        api.get<ApiResponse<DistributionData>>('/operations/dashboard/distribucion-estados'),
      ]);

      if (resSummary.data && resSummary.data.success) {
        summary.value = resSummary.data.data;
      }
      if (resDist.data && resDist.data.success) {
        distribution.value = resDist.data.data;
      }

      lastUpdated.value = new Date();
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (isAdmin.value) {
      fetchDashboardData();
      // Auto-refresh every 5 minutes (300000 ms)
      refreshInterval = setInterval(fetchDashboardData, 300000);
    }
  });

  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
</script>
