<!-- Reemplaza el contenido de PropertyAuditView.vue con este código completo -->
<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Auditoría de Inmuebles</h1>
        <p class="text-gray-500 text-sm mt-1">
          Historial de cambios de estado y modificaciones en propiedades
        </p>
      </div>
      <fwb-badge type="indigo">Admin Mode</fwb-badge>
    </div>

    <!-- Filtros -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
    >
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Filtro por Usuario -->
        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Agente / Usuario
          </label>
          <input
            v-model="filters.userId"
            type="text"
            placeholder="ID del usuario"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
          />
        </div>

        <!-- Filtro por Propiedad -->
        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Propiedad ID
          </label>
          <input
            v-model="filters.propertyId"
            type="text"
            placeholder="ID de la propiedad"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
          />
        </div>

        <!-- Filtro Fecha Desde -->
        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Desde
          </label>
          <input
            v-model="filters.from"
            type="date"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
          />
        </div>

        <!-- Filtro Fecha Hasta -->
        <div>
          <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Hasta
          </label>
          <input
            v-model="filters.to"
            type="date"
            class="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <fwb-button @click="fetchLogs" gradient="blue">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Filtrar
          </div>
        </fwb-button>
        <fwb-button @click="clearFilters" color="alternative">
          Limpiar filtros
        </fwb-button>
        <fwb-button @click="fetchLogs" color="alternative" size="sm">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </fwb-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-500">Cargando registros de auditoría...</p>
    </div>

    <!-- Tabla de Logs -->
    <div v-else-if="logs.length > 0" class="overflow-x-auto">
      <fwb-table hoverable>
        <fwb-table-head>
          <fwb-table-head-cell>Fecha y Hora</fwb-table-head-cell>
          <fwb-table-head-cell>Usuario (Agente)</fwb-table-head-cell>
          <fwb-table-head-cell>Acción</fwb-table-head-cell>
          <fwb-table-head-cell>Propiedad ID</fwb-table-head-cell>
          <fwb-table-head-cell>Cambio</fwb-table-head-cell>
          <fwb-table-head-cell>
            <span class="sr-only">Detalles</span>
          </fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="log in logs" :key="log.id">
            <fwb-table-cell class="whitespace-nowrap">
              {{ formatDateTime(log.timestamp) }}
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {{ log.userId }}
                </span>
              </div>
            </fwb-table-cell>
            <fwb-table-cell>
              <span
                :class="{
                  'px-2 py-1 rounded-full text-xs font-semibold': true,
                  'bg-yellow-100 text-yellow-800': log.action === 'STATUS_CHANGE',
                  'bg-blue-100 text-blue-800': log.action === 'PRICE_UPDATE',
                  'bg-purple-100 text-purple-800': log.action === 'AGENT_ASSIGN',
                  'bg-gray-100 text-gray-800': !['STATUS_CHANGE', 'PRICE_UPDATE', 'AGENT_ASSIGN'].includes(log.action)
                }"
              >
                {{ formatAction(log.action) }}
              </span>
            </fwb-table-cell>
            <fwb-table-cell>
              <span class="font-mono text-xs">{{ log.propertyId }}</span>
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex items-center gap-2 text-sm">
                <span class="text-red-500 line-through">{{ log.previousValue || '—' }}</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span class="text-green-600 font-semibold">{{ log.newValue || '—' }}</span>
              </div>
            </fwb-table-cell>
            <fwb-table-cell class="text-right">
              <button
                @click="openModal(log)"
                class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
              >
                Ver Detalles
              </button>
            </fwb-table-cell>
          </fwb-table-row>
        </fwb-table-body>
      </fwb-table>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!loading && logs.length === 0 && !hasSearched"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">No hay registros de auditoría</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm">Los cambios de estado en propiedades aparecerán aquí automáticamente</p>
    </div>

    <div
      v-else-if="!loading && logs.length === 0 && hasSearched"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">No se encontraron resultados</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm">Prueba con otros filtros o limpia la búsqueda</p>
    </div>

    <!-- Modal de Detalles -->
    <fwb-modal v-if="selectedLog" @close="selectedLog = null" size="lg">
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :class="{
              'bg-yellow-100': selectedLog.action === 'STATUS_CHANGE',
              'bg-blue-100': selectedLog.action === 'PRICE_UPDATE',
              'bg-purple-100': selectedLog.action === 'AGENT_ASSIGN'
            }"
          >
            <svg
              class="w-5 h-5"
              :class="{
                'text-yellow-600': selectedLog.action === 'STATUS_CHANGE',
                'text-blue-600': selectedLog.action === 'PRICE_UPDATE',
                'text-purple-600': selectedLog.action === 'AGENT_ASSIGN'
              }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path v-if="selectedLog.action === 'STATUS_CHANGE'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path v-else-if="selectedLog.action === 'PRICE_UPDATE'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold dark:text-white">Detalle del Cambio</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatAction(selectedLog.action) }} · {{ formatDateTime(selectedLog.timestamp) }}
            </p>
          </div>
        </div>
      </template>
      <template #body>
        <div class="space-y-6">
          <!-- Información del usuario -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Información del Agente</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">ID del Usuario:</span>
                <p class="font-mono text-sm font-semibold dark:text-white mt-1">{{ selectedLog.userId }}</p>
              </div>
              <div>
                <span class="text-gray-500">Propiedad:</span>
                <p class="font-mono text-sm font-semibold dark:text-white mt-1">{{ selectedLog.propertyId }}</p>
              </div>
            </div>
          </div>

          <!-- ============================================ -->
          <!-- AQUÍ VA EL CÓDIGO NUEVO: Campos Modificados -->
          <!-- ============================================ -->
          <div class="space-y-6">
            <div v-if="selectedLog.changes && selectedLog.changes.length > 0">
              <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Campos Modificados</h4>
              <div class="space-y-2">
                <div v-for="change in selectedLog.changes" :key="change.field" 
                     class="flex flex-col p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm">
                  <span class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">{{ change.field }}</span>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-sm text-red-500 line-through decoration-red-300">{{ change.oldValue || '(vacío)' }}</span>
                    <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span class="text-sm font-bold text-green-600 dark:text-green-400">{{ change.newValue }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="grid grid-cols-2 gap-6">
              <!-- Valor Anterior (fallback cuando no hay changes detallados) -->
              <div
                class="p-5 rounded-xl border-2 border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-center"
              >
                <p class="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3">
                  Valor Anterior
                </p>
                <p class="text-2xl font-black text-red-700 dark:text-red-300">
                  {{ selectedLog.previousValue || '—' }}
                </p>
                <p class="text-xs text-red-500 mt-2">Estado previo a la modificación</p>
              </div>

              <!-- Valor Nuevo (fallback cuando no hay changes detallados) -->
              <div
                class="p-5 rounded-xl border-2 border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 text-center"
              >
                <p class="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3">
                  Valor Nuevo
                </p>
                <p class="text-2xl font-black text-green-700 dark:text-green-300">
                  {{ selectedLog.newValue || '—' }}
                </p>
                <p class="text-xs text-green-500 mt-2">Valor actual después del cambio</p>
              </div>
            </div>
          </div>
          <!-- ============================================ -->
          <!-- FIN DEL CÓDIGO NUEVO                        -->
          <!-- ============================================ -->

          <!-- Flecha visual de transición -->
          <div class="flex justify-center">
            <div class="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
              <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Cambio realizado por el agente
              <span class="font-mono font-semibold text-gray-700 dark:text-gray-300">{{ selectedLog.userId }}</span>
            </p>
            <p class="text-xs mt-2">
              Fecha: {{ formatDateTime(selectedLog.timestamp) }}
            </p>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end">
          <fwb-button @click="selectedLog = null" color="alternative">Cerrar</fwb-button>
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import {
  FwbTable,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableBody,
  FwbTableRow,
  FwbTableCell,
  FwbModal,
  FwbButton,
  FwbBadge
} from 'flowbite-vue'

interface ChangeDetail {
  field: string
  oldValue: string | null
  newValue: string | null
}

interface AuditLog {
  id: string | number
  timestamp: string
  userId: string
  action: string
  propertyId: string
  previousValue: string | null
  newValue: string | null
  changes?: ChangeDetail[]
}

const logs = ref<AuditLog[]>([])
const loading = ref(false)
const selectedLog = ref<AuditLog | null>(null)
const hasSearched = ref(false)

const filters = ref({
  userId: '',
  propertyId: '',
  from: '',
  to: ''
})

const formatDateTime = (timestamp: string) => {
  if (!timestamp) return '—'
  return new Date(timestamp).toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatAction = (action: string) => {
  const actions: Record<string, string> = {
    'STATUS_CHANGE': 'Cambio de Estado',
    'PRICE_UPDATE': 'Actualización de Precio',
    'AGENT_ASSIGN': 'Reasignación de Agente',
    'OWNER_ASSIGN': 'Asignación de Propietario',
    'PROPERTY_CREATE': 'Registro de Propiedad',
    'PROPERTY_UPDATE': 'Edición de Datos',
    'PROPERTY_DELETE': 'Eliminación (Baja)'
  }
  return actions[action] || action;
}

const fetchLogs = async () => {
  loading.value = true
  hasSearched.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.userId) params.append('userId', filters.value.userId)
    if (filters.value.propertyId) params.append('propertyId', filters.value.propertyId)
    if (filters.value.from) params.append('from', new Date(filters.value.from).toISOString())
    if (filters.value.to) params.append('to', new Date(filters.value.to).toISOString())

    const queryString = params.toString()
    const url = queryString ? `/properties/audit?${queryString}` : '/properties/audit'
    const response = await api.get(url)
    logs.value = response.data || []
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    logs.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = {
    userId: '',
    propertyId: '',
    from: '',
    to: ''
  }
  fetchLogs()
}

const openModal = (log: AuditLog) => {
  selectedLog.value = log
}

onMounted(() => {
  fetchLogs()
})
</script>