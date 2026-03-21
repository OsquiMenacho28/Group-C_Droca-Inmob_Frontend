<template>
  <div class="space-y-6 p-4 md:p-8">
    <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Mis Inmuebles</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Gestiona tus captaciones y asignaciones activas.</p>
      </div>
      
      <div class="flex items-center space-x-2">
        <fwb-badge type="default" class="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <div class="flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 9.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-7.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            {{ myProperties.length }} Propiedades Asignadas
          </div>
        </fwb-badge>
      </div>
    </header>

    <hr class="border-gray-200 dark:border-gray-700">

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-gray-500 animate-pulse">Consultando tus propiedades en el sistema...</p>
    </div>

    <div v-else>
      <div v-if="myProperties.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <fwb-card v-for="property in myProperties" :key="property.id" class="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-gray-100 dark:border-gray-700">
          <div class="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>

          <div class="p-5">
            <div class="flex justify-between items-start mb-2">
              <h5 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-1">
                {{ property.title }}
              </h5>
              <span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                Activa
              </span>
            </div>
            
            <p class="font-normal text-gray-600 dark:text-gray-400 text-sm mb-4 flex items-center">
              <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ property.address }}
            </p>

            <div class="flex items-center justify-between mt-6">
              <div class="flex flex-col">
                <span class="text-xs text-gray-500 uppercase font-bold tracking-wider">Precio</span>
                <span class="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  ${{ property.price.toLocaleString('es-BO') }}
                </span>
              </div>
              <fwb-button gradient="blue" class="font-medium rounded-lg text-sm px-5 py-2.5">
                Gestionar
              </fwb-button>
            </div>
          </div>
        </fwb-card>
      </div>

      <div v-else class="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
        <div class="mx-auto w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Sin captaciones activas</h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">
          Actualmente no tienes inmuebles asignados. Contacta con el administrador para recibir nuevas propiedades.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FwbCard, FwbButton, FwbBadge } from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()
const myProperties = ref<any[]>([])
const loading = ref(true)

const loadData = async () => {
  loading.value = true
  try {
    // El 'user.value.userId' viene del JWT parseado en useAuth.ts
    // Si tu JWT usa 'sub' para el ID, cambia userId por sub
    const agentId = user.value?.userId || user.value?.sub
    
    if (agentId) {
      myProperties.value = await propertyService.getPropertiesByAgent(agentId)
    }
  } catch (error) {
    console.error('Error al cargar propiedades del agente:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>