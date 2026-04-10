<!-- FILE: frontend/src/views/OperationsView.vue -->
<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Operaciones</h1>
          <p class="text-gray-500 text-sm mt-1">
            Gestión de operaciones inmobiliarias y comprobantes de pago
          </p>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p class="mt-2 text-gray-500">Cargando operaciones...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 text-sm">
        {{ error }}
        <button @click="loadOperations" class="ml-2 underline">Reintentar</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="operations.length === 0" class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-700 mb-1">No hay operaciones</h3>
        <p class="text-gray-500 text-sm">No se encontraron operaciones registradas.</p>
      </div>

      <!-- Operations grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <RouterLink
          v-for="op in operations"
          :key="op.id"
          :to="`/operations/${op.id}`"
          class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
        >
          <!-- Card header -->
          <div class="p-5 pb-3 border-b border-gray-50">
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ op.operationType || 'Standard' }}
              </span>
              <span class="text-xs text-gray-400">ID: {{ op.id.slice(0, 8) }}</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">
              {{ op.propertyName || 'Sin nombre' }}
            </h3>
            <p class="text-sm text-gray-500 mt-0.5">{{ op.clientName || 'Cliente no especificado' }}</p>
          </div>

          <!-- Card body -->
          <div class="p-5 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Agente:</span>
              <span class="font-medium text-gray-700">{{ op.agentName || '—' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Fecha:</span>
              <span class="font-medium text-gray-700">{{ formatDate(op.createdAt) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Estado:</span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="statusClass(op.status)"
              >
                {{ op.status || 'PENDING' }}
              </span>
            </div>
          </div>

          <!-- Card footer -->
          <div class="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <span class="text-xs text-blue-600 font-medium flex items-center gap-1">
              Ver detalles
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../services/api'

const operations = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const loadOperations = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/api/operations')
    operations.value = response.data || []
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Error al cargar las operaciones'
  } finally {
    loading.value = false
  }
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const statusClass = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
    PENDING: 'bg-yellow-100 text-yellow-800'
  }
  return map[status] || 'bg-gray-100 text-gray-700'
}

onMounted(loadOperations)
</script>