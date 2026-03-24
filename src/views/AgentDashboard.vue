<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold dark:text-white">Mis Inmuebles</h1>
      <fwb-button @click="showCreateModal = true" gradient="blue">Registrar Nuevo</fwb-button>
    </div>

    <div v-if="loading" class="text-center py-10 dark:text-white">Cargando inventario...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <fwb-card v-for="p in myProperties" :key="p.id" class="overflow-hidden">
        <div class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
          <span v-if="!p.imageUrls || p.imageUrls.length === 0">Sin imágenes</span>
          <img v-else :src="p.imageUrls[0]" class="h-full w-full object-cover">
        </div>
        <div class="p-5">
          <h5 class="text-xl font-bold dark:text-white">{{ p.title }}</h5>
          <p class="text-blue-600 font-bold mb-2">${{ p.price.toLocaleString() }}</p>
          <span class="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">{{ p.status }}</span>
        </div>
      </fwb-card>
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
import { FwbCard, FwbButton, FwbModal } from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { useAuth } from '../composables/useAuth'
import type { Property } from '../types/property'
import PropertyForm from '../components/properties/PropertyForm.vue'

const { user } = useAuth()
// CORRECCIÓN: Tipo explícito Property[]
const myProperties = ref<Property[]>([])
const loading = ref(false)
const showCreateModal = ref(false)

const load = async () => {
  loading.value = true
  const agentId = user.value?.userId || user.value?.sub
  if (agentId) {
    myProperties.value = await propertyService.getPropertiesByAgent(agentId)
  }
  loading.value = false
}

const handleCreate = async (data: any) => {
  try {
    // Como el servicio de buckets no está listo, ignoramos los archivos por ahora
    const { files, ...payload } = data 
    
    // 1. Crear el inmueble
    await propertyService.createProperty(payload)
    
    // 2. Limpieza y recarga
    showCreateModal.value = false
    await load()
    alert('Inmueble registrado con éxito')
  } catch (e: any) {
    alert('Error al registrar: ' + (e.response?.data?.detail || 'Error de conexión'))
  }
}

onMounted(load)
</script>