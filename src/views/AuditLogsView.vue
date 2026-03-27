<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Tablero de Auditoría</h1>
        <p class="text-gray-500 text-sm">Historial de creaciones y ediciones de perfiles</p>
      </div>
      <fwb-badge type="indigo">Admin Mode</fwb-badge>
    </div>

    <!-- Filtros -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input v-model="search" type="text"
            class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50
                   dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Buscar por nombre o usuario..."/>
        </div>
        <select v-model="filterAction"
          class="text-sm border border-gray-300 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600">
          <option value="">Todas las acciones</option>
          <option value="CREATED">Creaciones</option>
          <option value="UPDATED">Ediciones</option>
        </select>
      </div>
    </div>

    <!-- Lista de logs -->
    <div v-if="loading" class="text-center py-20 dark:text-white">Cargando registros...</div>

    <div v-else class="space-y-3">
      <div v-for="log in filteredLogs" :key="log.id"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <!-- Badge acción -->
            <span :class="[
              'px-2 py-1 text-xs font-semibold rounded-full',
              log.action === 'CREATED'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            ]">
              {{ log.action === 'CREATED' ? 'Creación' : 'Edición' }}
            </span>
            <!-- Tipo de persona -->
            <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {{ personTypeLabel(log.personType) }}
            </span>
          </div>
          <!-- Fecha -->
          <span class="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {{ formatDate(log.timestamp) }}
          </span>
        </div>

        <div class="mt-2">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ log.personName }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Por: <span class="font-mono text-gray-700 dark:text-gray-300">{{ log.changedBy }}</span>
          </p>
        </div>

        <!-- Campos modificados (solo UPDATED) -->
        <div v-if="log.action === 'UPDATED' && log.changes?.length" class="mt-3 space-y-1">
          <div v-for="change in log.changes" :key="change.field"
            class="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-900/50 rounded p-2">
            <span class="font-medium text-gray-600 dark:text-gray-400 w-32 shrink-0">{{ change.field }}</span>
            <span class="text-red-500 line-through">{{ change.oldValue || '—' }}</span>
            <span class="text-gray-400">→</span>
            <span class="text-green-600 dark:text-green-400">{{ change.newValue || '—' }}</span>
          </div>
        </div>
      </div>

      <div v-if="filteredLogs.length === 0"
        class="text-center py-12 text-gray-500 dark:text-gray-400">
        No se encontraron registros.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FwbBadge } from 'flowbite-vue'
import { auditService } from '../services/auditService'

const logs = ref<any[]>([])
const loading = ref(false)
const search = ref('')
const filterAction = ref('')

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchesSearch = !search.value.trim() ||
      log.personName?.toLowerCase().includes(search.value.toLowerCase()) ||
      log.changedBy?.toLowerCase().includes(search.value.toLowerCase())
    const matchesAction = !filterAction.value || log.action === filterAction.value
    return matchesSearch && matchesAction
  })
})

const formatDate = (ts: string) => {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('es-BO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

const personTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    ADMIN: 'Admin',
    EMPLOYEE: 'Agente',
    OWNER: 'Propietario',
    INTERESTED_CLIENT: 'Cliente'
  }
  return map[type] || type
}

onMounted(async () => {
  loading.value = true
  try {
    logs.value = await auditService.getLogs()
  } catch (e) {
    console.error('Error loading audit logs:', e)
  } finally {
    loading.value = false
  }
})
</script>