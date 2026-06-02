<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold dark:text-white">
          Reporte Gerencial de Inventario
        </h1>
        <p class="text-gray-500 text-sm dark:text-gray-400">
          Estado situacional actual de los inmuebles
        </p>
      </div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <span
          class="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          Última actualización: {{ lastUpdatedText }}
        </span>
        <button
          @click="loadReportAndDashboard"
          :disabled="loading"
          class="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <IconLucideRefreshCw
            :class="{ 'animate-spin': loading }"
            class="w-4 h-4"
          />
          <span>{{ loading ? 'Actualizando...' : 'Recargar' }}</span>
        </button>
        <fwb-badge type="indigo">Modo Administrador</fwb-badge>
      </div>
    </div>

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
            {{ summary.totalInmueblesActivos }}
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
            {{ summary.visitasProgramadasSemana }}
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
            {{ summary.operacionesEnCurso }}
          </p>
        </div>
        <div class="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-xl">
          <IconLucideFileText class="w-8 h-8 text-violet-500" />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
    >
      <div>
        <label class="block mb-2 text-xs font-black text-gray-400 uppercase">
          Tipo de Operación
        </label>
        <select
          v-model="filterOpType"
          @change="loadReportAndDashboard"
          class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
        >
          <option value="">Todas</option>
          <option value="VENTA">Venta</option>
          <option value="ALQUILER">Alquiler</option>
          <option value="ANTICRETICO">Anticrético</option>
        </select>
      </div>
      <div>
        <label class="block mb-2 text-xs font-black text-gray-400 uppercase"
          >Estado</label
        >
        <select
          v-model="filterStatus"
          @change="loadReportAndDashboard"
          class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="DISPONIBLE">Disponible</option>
          <option value="RESERVADO">Reservado</option>
          <option value="VENDIDO">Vendido</option>
          <option value="EN_NEGOCIACION">En Negociación</option>
        </select>
      </div>
      <div>
        <fwb-button
          color="alternative"
          size="sm"
          @click="clearFilters"
          class="w-full h-[42px]"
        >
          Limpiar Filtros
        </fwb-button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20 dark:text-white">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500">Cargando reporte...</p>
    </div>

    <div v-else-if="reportData" class="space-y-6">
      <!-- Dashboard / Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <h2 class="text-xl font-bold mb-4 dark:text-white">
            Totales por Estado
          </h2>
          <div style="height: 300px">
            <Bar
              v-if="chartDataStatus"
              :data="chartDataStatus"
              :options="chartOptions"
            />
          </div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <h2 class="text-xl font-bold mb-4 dark:text-white">
            Totales por Operación
          </h2>
          <div style="height: 300px">
            <Bar
              v-if="chartDataOpType"
              :data="chartDataOpType"
              :options="chartOptions"
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table
            class="w-full text-sm text-left text-gray-500 dark:text-gray-400"
          >
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th scope="col" class="px-6 py-3">Inmueble</th>
                <th scope="col" class="px-6 py-3">Estado</th>
                <th scope="col" class="px-6 py-3">Operación</th>
                <th scope="col" class="px-6 py-3 text-right">Precio</th>
                <th scope="col" class="px-6 py-3">Zona</th>
                <th scope="col" class="px-6 py-3 text-center">F. Registro</th>
                <th scope="col" class="px-6 py-3 text-center">F. Salida</th>
                <th scope="col" class="px-6 py-3 text-center">
                  Días en Inventario
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportData.properties.length === 0">
                <td colspan="8" class="px-6 py-8 text-center">
                  No hay datos para mostrar con los filtros seleccionados
                </td>
              </tr>
              <tr
                v-for="prop in reportData.properties"
                :key="prop.id"
                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td
                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {{ prop.title }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                  >
                    {{ prop.status }}
                  </span>
                </td>
                <td class="px-6 py-4">{{ prop.operationType }}</td>
                <td class="px-6 py-4 text-right">
                  ${{ prop.price.toLocaleString() }}
                </td>
                <td class="px-6 py-4">{{ prop.zone }}</td>
                <td
                  class="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  {{ prop.registrationDate || '--' }}
                </td>
                <td
                  class="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  {{ prop.exitDate || '--' }}
                </td>
                <td
                  class="px-6 py-4 text-center font-bold"
                  :class="{
                    'text-red-500': prop.daysInInventory > 90,
                    'text-green-500': prop.daysInInventory <= 30,
                  }"
                >
                  {{ prop.daysInInventory }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { FwbButton, FwbBadge } from 'flowbite-vue';
import { propertyService } from '@/modules/properties/services/propertyService';
import type { InventoryReportResponse } from '@/types/property';
import { Bar } from 'vue-chartjs';
import { apiClient as api } from '@/api';
import type { ApiResponse } from '@/api/types';
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

interface DashboardSummary {
  totalInmueblesActivos: number;
  visitasProgramadasSemana: number;
  operacionesEnCurso: number;
}

const loading = ref(false);
const filterOpType = ref('');
const filterStatus = ref('');
const reportData = ref<InventoryReportResponse | null>(null);

const summary = ref<DashboardSummary>({
  totalInmueblesActivos: 0,
  visitasProgramadasSemana: 0,
  operacionesEnCurso: 0,
});
const lastUpdated = ref<Date>(new Date());
let refreshInterval: ReturnType<typeof setInterval> | null = null;

const lastUpdatedText = computed(() => {
  return lastUpdated.value.toLocaleTimeString('es-BO');
});

const loadReport = async () => {
  try {
    reportData.value = await propertyService.getInventoryReport(
      filterStatus.value || undefined,
      filterOpType.value || undefined
    );
  } catch (error) {
    console.error('Error cargando el reporte', error);
  }
};

const fetchDashboardData = async () => {
  try {
    const resSummary =
      await api.get<ApiResponse<DashboardSummary>>('/dashboard/resumen');
    if (resSummary.data && resSummary.data.success) {
      summary.value = resSummary.data.data;
    }
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
  }
};

const loadReportAndDashboard = async () => {
  loading.value = true;
  try {
    await Promise.all([loadReport(), fetchDashboardData()]);
    lastUpdated.value = new Date();
  } catch (error) {
    console.error('Error loading report and dashboard', error);
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filterOpType.value = '';
  filterStatus.value = '';
  loadReportAndDashboard();
};

onMounted(() => {
  loadReportAndDashboard();
  // Auto-refresh every 5 minutes (300000 ms)
  refreshInterval = setInterval(loadReportAndDashboard, 300000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

const chartDataStatus = computed(() => {
  if (!reportData.value || !reportData.value.totalsByStatus) return null;
  const labels = Object.keys(reportData.value.totalsByStatus);
  const data = Object.values(reportData.value.totalsByStatus);

  return {
    labels,
    datasets: [
      {
        label: 'Cantidad por Estado',
        backgroundColor: '#3b82f6', // blue-500
        data,
      },
    ],
  };
});

const chartDataOpType = computed(() => {
  if (!reportData.value || !reportData.value.totalsByOperationType) return null;
  const labels = Object.keys(reportData.value.totalsByOperationType);
  const data = Object.values(reportData.value.totalsByOperationType);

  return {
    labels,
    datasets: [
      {
        label: 'Cantidad por Operación',
        backgroundColor: '#10b981', // emerald-500
        data,
      },
    ],
  };
});
</script>
