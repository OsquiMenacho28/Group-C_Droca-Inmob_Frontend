<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Reporte Gerencial de Inventario</h1>
        <p class="text-gray-500 text-sm dark:text-gray-400">Estado situacional actual de los inmuebles</p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">Modo Administrador</fwb-badge>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      <div>
        <label class="block mb-2 text-xs font-black text-gray-400 uppercase">Tipo de Operación</label>
        <select v-model="filterOpType" @change="loadReport" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-blue-500">
          <option value="">Todas</option>
          <option value="VENTA">Venta</option>
          <option value="ALQUILER">Alquiler</option>
          <option value="ANTICRETICO">Anticrético</option>
        </select>
      </div>
      <div>
        <label class="block mb-2 text-xs font-black text-gray-400 uppercase">Estado</label>
        <select v-model="filterStatus" @change="loadReport" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-blue-500">
          <option value="">Todos</option>
          <option value="DISPONIBLE">Disponible</option>
          <option value="RESERVADO">Reservado</option>
          <option value="VENDIDO">Vendido</option>
          <option value="EN_NEGOCIACION">En Negociación</option>
        </select>
      </div>
      <div>
        <fwb-button color="alternative" size="sm" @click="clearFilters" class="w-full h-[42px]">
          Limpiar Filtros
        </fwb-button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20 dark:text-white">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-500">Cargando reporte...</p>
    </div>

    <div v-else-if="reportData" class="space-y-6">
      <!-- Dashboard / Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 class="text-xl font-bold mb-4 dark:text-white">Totales por Estado</h2>
          <div style="height: 300px;">
            <Bar v-if="chartDataStatus" :data="chartDataStatus" :options="chartOptions" />
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 class="text-xl font-bold mb-4 dark:text-white">Totales por Operación</h2>
          <div style="height: 300px;">
            <Bar v-if="chartDataOpType" :data="chartDataOpType" :options="chartOptions" />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" class="px-6 py-3">Inmueble</th>
                <th scope="col" class="px-6 py-3">Estado</th>
                <th scope="col" class="px-6 py-3">Operación</th>
                <th scope="col" class="px-6 py-3 text-right">Precio</th>
                <th scope="col" class="px-6 py-3">Zona</th>
                <th scope="col" class="px-6 py-3 text-center">Días en Inventario</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportData.properties.length === 0">
                <td colspan="6" class="px-6 py-8 text-center">No hay datos para mostrar con los filtros seleccionados</td>
              </tr>
              <tr v-for="prop in reportData.properties" :key="prop.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{{ prop.title }}</td>
                <td class="px-6 py-4">
                  <span class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                    {{ prop.status }}
                  </span>
                </td>
                <td class="px-6 py-4">{{ prop.operationType }}</td>
                <td class="px-6 py-4 text-right">${{ prop.price.toLocaleString() }}</td>
                <td class="px-6 py-4">{{ prop.zone }}</td>
                <td class="px-6 py-4 text-center font-bold" :class="{'text-red-500': prop.daysInInventory > 90, 'text-green-500': prop.daysInInventory <= 30}">
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
import { ref, onMounted, computed } from 'vue';
import { FwbButton, FwbBadge } from 'flowbite-vue';
import { propertyService } from '@/modules/properties/services/propertyService';
import type { InventoryReportResponse } from '@/types/property';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const loading = ref(false);
const filterOpType = ref('');
const filterStatus = ref('');
const reportData = ref<InventoryReportResponse | null>(null);

const loadReport = async () => {
  loading.value = true;
  try {
    reportData.value = await propertyService.getInventoryReport(
      filterStatus.value || undefined, 
      filterOpType.value || undefined
    );
  } catch (error) {
    console.error('Error cargando el reporte', error);
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filterOpType.value = '';
  filterStatus.value = '';
  loadReport();
};

onMounted(() => {
  loadReport();
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
        data
      }
    ]
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
        data
      }
    ]
  };
});
</script>
