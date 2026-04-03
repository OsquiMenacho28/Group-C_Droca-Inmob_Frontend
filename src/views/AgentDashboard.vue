<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Mis Inmuebles</h1>
        <p class="text-gray-500 text-sm">Gestiona y filtra tus propiedades asignadas</p>
      </div>
      <fwb-button @click="showCreateModal = true" gradient="blue">
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Registrar Nuevo
        </div>
      </fwb-button>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-wider">Buscar por título</label>
          <fwb-input v-model="filterTitle" placeholder="Ej: Departamento..." @input="handleFilterDebounce" />
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-wider">Tipo de Operación</label>
          <select v-model="filterOpType" @change="load" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-blue-500">
            <option value="">Todos los tipos</option>
            <option value="VENTA">Venta</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="ANTICRETICO">Anticrético</option>
          </select>
        </div>
        <div class="flex justify-end">
          <fwb-button color="alternative" size="sm" @click="clearAllFilters">Limpiar Filtros</fwb-button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10 dark:text-white">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-500">Cargando tus propiedades...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card v-for="p in myProperties" :key="p.id" class="flex flex-col h-full overflow-hidden border-gray-200 dark:border-gray-700 relative">
        <div class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
          <img v-if="p.imageUrls?.length" :src="p.imageUrls[0]" class="h-full w-full object-cover">
          <span v-else>Sin imágenes</span>
          <div class="absolute bottom-2 right-2">
            <fwb-badge :type="p.status === 'DISPONIBLE' ? 'green' : 'red'">{{ p.status }}</fwb-badge>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <div class="flex gap-2 mb-3">
            <fwb-badge :type="getOpTypeBadge(p.operationType)">{{ p.operationType }}</fwb-badge>
            <fwb-badge type="dark">{{ p.type }}</fwb-badge>
          </div>
          
          <h5 class="text-xl font-bold dark:text-white mb-1">{{ p.title }}</h5>
          <p class="text-sm text-gray-500 mb-4">{{ p.address }}</p>
          
          <div class="mt-auto">
            <p class="text-2xl font-black text-blue-600">${{ p.price.toLocaleString() }}</p>
          </div>
        </div>
      </fwb-card>
    </div>

    <div v-if="!loading && myProperties.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
       <p class="text-gray-500">No tienes inmuebles que coincidan con la búsqueda.</p>
    </div>

    <fwb-modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #header><div class="text-lg font-bold">Nuevo Inmueble</div></template>
      <template #body>
        <property-form @submit="handleCreate" @cancel="showCreateModal = false" />
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FwbCard, FwbButton, FwbModal, FwbInput, FwbBadge } from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { useAuth } from '../composables/useAuth'
import { api } from '../services/api'
import type { Property } from '../types/property'
import PropertyForm from '../components/properties/PropertyForm.vue'

const { user } = useAuth()
const myProperties = ref<Property[]>([])
const loading = ref(false)
const showCreateModal = ref(false)

// Filtros
const filterTitle = ref('')
const filterOpType = ref('')
let debounceTimer: any = null

const load = async () => {
  loading.value = true
  try {
    const agentId = user.value?.userId || user.value?.sub
    // Llamamos al endpoint general. El backend ya se encarga de filtrar por el ID del agente
    // si el rol no es ADMIN, gracias a tu SecurityContextFilter.
    const response = await api.get('/properties', {
      params: {
        title: filterTitle.value || undefined,
        status: filterOpType.value || undefined,
        agentId: agentId // Reforzamos el filtro por el agente actual
      }
    })
    myProperties.value = response.data
  } catch (e) {
    console.error("Error cargando inventario:", e)
  } finally {
    loading.value = false
  }
}

const handleFilterDebounce = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 500)
}

const clearAllFilters = () => {
  filterTitle.value = ''
  filterOpType.value = ''
  load()
}

const getOpTypeBadge = (type: string) => {
  switch (type) {
    case 'VENTA': return 'indigo'
    case 'ALQUILER': return 'green'
    case 'ANTICRETICO': return 'yellow'
    default: return 'dark'
  }
}

const handleCreate = async (data: any) => {
  try {
    await propertyService.createProperty(data)
    showCreateModal.value = false
    await load()
    alert('Inmueble registrado con éxito')
  } catch (e: any) {
    alert('Error: ' + (e.response?.data?.detail || 'Error de conexión'))
  }
}

onMounted(load)
</script>