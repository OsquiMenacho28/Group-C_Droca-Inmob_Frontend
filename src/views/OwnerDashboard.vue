<template>
  <div class="p-6 space-y-6">
    <h1 class="text-3xl font-bold dark:text-white">Mis Propiedades</h1>
    <p class="text-gray-500">Visualiza tus propiedades y el número de visitas recibidas</p>

    <div v-if="loading" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-500">Cargando tus propiedades...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      {{ error }}
    </div>

    <div v-else-if="properties.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
      <p class="text-yellow-800">No tienes propiedades registradas en el sistema.</p>
      <p class="text-yellow-600 text-sm mt-2">Contacta con un agente para registrar tus propiedades.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card v-for="prop in properties" :key="prop.id" class="overflow-hidden hover:shadow-lg transition-shadow relative">
        <!-- Visit Count Badge -->
        <div class="absolute top-4 right-4 z-10">
          <div class="bg-blue-600 text-white rounded-full px-3 py-1 text-sm font-bold flex items-center gap-1 shadow-lg">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ prop.visitCount || 0 }} {{ prop.visitCount === 1 ? 'visita' : 'visitas' }}
          </div>
        </div>

        <!-- Property Image -->
        <div class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
          <img v-if="prop.imageUrls && prop.imageUrls.length > 0" 
               :src="prop.imageUrls[0]" 
               class="h-full w-full object-cover">
          <div v-else class="text-gray-400 flex flex-col items-center">
            <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-sm">Sin imagen</span>
          </div>
          <!-- Status Badge on Image -->
          <div class="absolute top-4 left-4">
            <span :class="[
              'px-2 py-1 rounded-full text-xs font-semibold shadow-md',
              prop.status === 'DISPONIBLE' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            ]">
              {{ prop.status === 'DISPONIBLE' ? 'Disponible' : 'Ocupado' }}
            </span>
          </div>
        </div>

        <div class="p-5">
          <h5 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{{ prop.title }}</h5>
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">{{ prop.address }}</p>
          
          <div class="flex justify-between items-center mb-4">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider">Precio</p>
              <p class="text-2xl font-bold text-blue-600">${{ prop.price.toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider">Tipo</p>
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ prop.type }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-3">
            <div class="flex items-center gap-1">
              <span>📐</span> {{ prop.m2 }} m²
            </div>
            <div class="flex items-center gap-1">
              <span>🛏️</span> {{ prop.rooms }} {{ prop.rooms === 1 ? 'habitación' : 'habitaciones' }}
            </div>
            <div class="flex items-center gap-1 col-span-2">
              <span>👤</span> Agente: {{ prop.assignedAgentName || prop.assignedAgentId || 'No asignado' }}
            </div>
          </div>
        </div>
      </fwb-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FwbCard } from 'flowbite-vue'
import { useAuth } from '../composables/useAuth'
import { propertyService } from '../services/propertyService'
import { getVisitCountForProperty } from '../services/visitRequestService'
import type { Property } from '../types/property'

const { user } = useAuth()
const properties = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const loadProperties = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Get user ID from JWT token
    const ownerId = user.value?.sub || user.value?.userId || user.value?.id
    
    if (!ownerId) {
      throw new Error('No se pudo identificar al propietario. Por favor, inicia sesión nuevamente.')
    }
    
    console.log('Loading properties for owner:', ownerId)
    
    // Get owner's properties from property service
    const props = await propertyService.getPropertiesByOwner(ownerId)
    
    console.log('Properties found:', props.length)
    
    // For each property, fetch visit count from calendar service
    const propsWithVisits = await Promise.all(
      props.map(async (prop: any) => {
        try {
          const visitCount = await getVisitCountForProperty(prop.id)
          console.log(`Property ${prop.id} (${prop.title}) has ${visitCount} visits`)
          return { ...prop, visitCount }
        } catch (err) {
          console.error(`Error fetching visits for property ${prop.id}:`, err)
          return { ...prop, visitCount: 0 }
        }
      })
    )
    
    properties.value = propsWithVisits
  } catch (err: any) {
    console.error('Error loading owner properties:', err)
    
    // Provide user-friendly error messages
    if (err.response?.status === 403) {
      error.value = 'No tienes permiso para ver estas propiedades. Solo los propietarios pueden acceder a este panel.'
    } else if (err.response?.status === 404) {
      error.value = 'No se encontraron propiedades registradas para tu cuenta.'
    } else if (err.message === 'Network Error') {
      error.value = 'Error de conexión. Verifica que los servicios del backend estén funcionando.'
    } else {
      error.value = err.message || 'Error al cargar tus propiedades. Intenta nuevamente.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadProperties)
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>