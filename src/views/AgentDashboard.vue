<template>
  <div class="space-y-6 p-4 md:p-8">
    <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Mis Inmuebles</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Gestiona tus captaciones y asignaciones activas.</p>
      </div>

      <fwb-button @click="showModal = true" gradient="blue" class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Registrar Inmueble
      </fwb-button>
    </header>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card v-for="property in myProperties" :key="property.id" class="hover:shadow-lg transition-shadow">
        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-bold text-blue-600 uppercase">{{ property.type }}</span>
              <fwb-badge :type="property.status === 'DISPONIBLE' ? 'green' : 'indigo'">
                {{ property.status }}
              </fwb-badge>
          </div>
          <h5 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ property.title }}</h5>
          <p class="text-gray-500 text-sm mb-4">{{ property.address }}</p>
          
          <div class="flex items-center space-x-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
            <span>📏 {{ property.m2 }} m²</span>
            <span>🛏️ {{ property.rooms }} Hab.</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-2xl font-bold text-gray-900 dark:text-white">
              ${{ property.price.toLocaleString() }}
            </span>
            <fwb-button color="alternative" size="sm">Ver Detalles</fwb-button>
          </div>
        </div>
      </fwb-card>
    </div>

    <fwb-modal v-if="showModal" @close="showModal = false">
      <template #header>
        <div class="text-lg font-bold">Registrar Nueva Propiedad</div>
      </template>
      <template #body>
        <property-form @submit="handleCreate" @cancel="showModal = false" />
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FwbCard, FwbButton, FwbBadge, FwbModal } from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { useAuth } from '../composables/useAuth'
import PropertyForm from '../components/properties/PropertyForm.vue'

const { user } = useAuth()
const myProperties = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const agentId = user.value?.userId || user.value?.sub
    if (agentId) {
      myProperties.value = await propertyService.getPropertiesByAgent(agentId)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const handleCreate = async (payload: any) => {
  try {
    await propertyService.createProperty(payload)
    showModal.value = false
    await loadData()
  } catch (error: any) {
    alert(error.response?.data?.message || 'Error al registrar')
  }
}

onMounted(loadData)
</script>