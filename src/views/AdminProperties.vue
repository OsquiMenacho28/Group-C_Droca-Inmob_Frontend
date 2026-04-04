<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Gestión de Inventario</h1>
        <p class="text-gray-500 text-sm">Administración global y categorización de inmuebles</p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">Modo Administrador</fwb-badge>
        <fwb-button @click="showCreateModal" gradient="blue">Registrar Nuevo</fwb-button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase">Buscar por título</label>
          <fwb-input v-model="filterTitle" placeholder="Ej: Condominio..." @input="handleFilterDebounce" />
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase">Tipo de Operación</label>
          <select v-model="filterOpType" @change="load" class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white">
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

    <div v-if="loading" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-500">Cargando propiedades...</p>
    </div>

    <div v-else-if="allProperties.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed">
      <p class="text-gray-500">No se encontraron propiedades</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card v-for="p in allProperties" :key="p.id" class="flex flex-col h-full border-gray-200 dark:border-gray-700 relative">
        <div class="absolute top-2 left-2 z-10">
          <fwb-badge :type="getOpTypeBadge(p.operationType)">{{ p.operationType || 'No definido' }}</fwb-badge>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <h5 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ p.title || 'Sin título' }}</h5>
          <p class="text-sm text-gray-500 mb-4">{{ p.address || 'Sin dirección' }}</p>
          <p class="text-2xl font-black text-blue-600">${{ (p.price || 0).toLocaleString() }}</p>

          <div class="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <fwb-button size="sm" color="alternative" @click="prepPriceUpdate(p)">Precio</fwb-button>
            <fwb-button size="sm" color="alternative" @click="prepOpTypeUpdate(p)">Operación</fwb-button>
            <fwb-button size="sm" gradient="blue" @click="prepAssignment(p)">Agente</fwb-button>
            <fwb-button size="sm" gradient="purple" @click="prepOwnerAssignment(p)">Dueño</fwb-button>
          </div>
        </div>
      </fwb-card>
    </div>

    <!-- Modales (resto igual) -->
    <fwb-modal v-if="showPriceModal" @close="showPriceModal = false">
      <template #header><div class="text-lg font-bold">Modificar Precio</div></template>
      <template #body>
        <fwb-input v-model.number="newPrice" type="number" label="Nuevo Valor ($)" required />
      </template>
      <template #footer>
        <fwb-button color="alternative" @click="showPriceModal = false">Cancelar</fwb-button>
        <fwb-button @click="doPriceUpdate" gradient="blue">Confirmar</fwb-button>
      </template>
    </fwb-modal>

    <fwb-modal v-if="showOwnerModal" @close="showOwnerModal = false">
      <template #header><div class="text-lg font-bold">Asignar Propietario</div></template>
      <template #body>
        <select v-model="selectedOwnerId" class="w-full border rounded-lg p-2.5 dark:bg-gray-700">
          <option value="">Seleccione un dueño...</option>
          <option v-for="o in availableOwners" :key="o.id" :value="o.id">{{ o.fullName }}</option>
        </select>
      </template>
      <template #footer>
        <fwb-button @click="doAssignOwner" gradient="blue">Asignar</fwb-button>
      </template>
    </fwb-modal>

    <fwb-modal v-if="showOpTypeModal" @close="showOpTypeModal = false">
       <template #header><div class="text-lg font-bold">Cambiar Operación</div></template>
       <template #body>
         <select v-model="newOpType" class="w-full border rounded-lg p-2.5 dark:bg-gray-700">
            <option value="VENTA">Venta</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="ANTICRETICO">Anticrético</option>
         </select>
       </template>
       <template #footer>
         <fwb-button @click="doOpTypeUpdate" gradient="blue">Guardar</fwb-button>
       </template>
    </fwb-modal>

    <assign-agent-modal v-if="showAssignModal" :show="showAssignModal" :property="selectedProp" :agents="activeAgents" @confirm="doAssign" @close="showAssignModal = false" />
    <fwb-modal v-if="showCreateModal" @close="showCreateModal = false" size="2xl">
      <template #header><div class="text-lg font-bold">Registrar</div></template>
      <template #body><property-form @submit="handleCreate" @cancel="showCreateModal = false" /></template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { FwbCard, FwbButton, FwbModal, FwbInput, FwbBadge } from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { userService } from '../services/userService'
import { api } from '../services/api'
import type { Property } from '../types/property'
import AssignAgentModal from '../components/properties/AssignAgentModal.vue'
import PropertyForm from '../components/properties/PropertyForm.vue'

const allProperties = ref<Property[]>([])
const allUsers = ref<any[]>([])
const loading = ref(false)
const filterTitle = ref('')
const filterOpType = ref('')
let debounceTimer: any = null

const showCreateModal = ref(false)
const showAssignModal = ref(false)
const showPriceModal = ref(false)
const showOpTypeModal = ref(false)
const showOwnerModal = ref(false)

const selectedProp = ref<Property | null>(null)
const newPrice = ref(0)
const newOpType = ref('')
const selectedOwnerId = ref('')

// COMPUTED
const activeAgents = computed(() => 
  allUsers.value.filter(u => (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') && u.status === 'ACTIVE')
)
const availableOwners = computed(() => 
  allUsers.value.filter(u => u.userType === 'OWNER' && u.status === 'ACTIVE')
)

// CARGA - Manejar respuesta paginada correctamente
const load = async () => {
  loading.value = true
  try {
    const filters: any = {}
    if (filterTitle.value) filters.title = filterTitle.value
    if (filterOpType.value) filters.operationType = filterOpType.value
    
    const response = await propertyService.getProperties(filters)
    
    // Verificar si la respuesta es paginada o array directo
    if (response && response.data && Array.isArray(response.data)) {
      allProperties.value = response.data
    } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
      allProperties.value = response.data.data
    } else if (Array.isArray(response)) {
      allProperties.value = response
    } else {
      console.error('Formato de respuesta inesperado:', response)
      allProperties.value = []
    }
    
    // Cargar usuarios solo si es necesario
    try {
      const users = await userService.getUsers()
      allUsers.value = users
    } catch (userError) {
      console.error('Error cargando usuarios:', userError)
      allUsers.value = []
    }
  } catch (error) {
    console.error('Error cargando propiedades:', error)
    allProperties.value = []
  } finally {
    loading.value = false
  }
}

const handleFilterDebounce = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 500)
}

const clearAllFilters = () => { 
  filterTitle.value = ''; 
  filterOpType.value = ''; 
  load() 
}

// HELPERS
const getOpTypeBadge = (type: string): any => {
  if (type === 'VENTA') return 'indigo'
  if (type === 'ALQUILER') return 'green'
  if (type === 'ANTICRETICO') return 'yellow'
  return 'dark'
}

// FUNCIONES DE PREPARACIÓN
const prepAssignment = (p: Property) => { selectedProp.value = p; showAssignModal.value = true }
const prepOwnerAssignment = (p: Property) => { selectedProp.value = p; selectedOwnerId.value = p.ownerId || ''; showOwnerModal.value = true }
const prepPriceUpdate = (p: Property) => { selectedProp.value = p; newPrice.value = p.price || 0; showPriceModal.value = true }
const prepOpTypeUpdate = (p: Property) => { selectedProp.value = p; newOpType.value = p.operationType || 'VENTA'; showOpTypeModal.value = true }

// ACCIONES DE GUARDADO
const doPriceUpdate = async () => {
  if (!selectedProp.value) return
  try {
    await propertyService.updatePrice(selectedProp.value.id, newPrice.value)
    showPriceModal.value = false
    await load()
  } catch (e) { 
    console.error('Error actualizando precio:', e)
    alert('Error al actualizar el precio') 
  }
}

const doAssignOwner = async () => {
  if (!selectedProp.value) return
  try {
    await propertyService.assignOwner(selectedProp.value.id, { ownerId: selectedOwnerId.value })
    showOwnerModal.value = false
    await load()
  } catch (e) { 
    console.error('Error asignando propietario:', e)
    alert('Error al asignar propietario') 
  }
}

const doOpTypeUpdate = async () => {
  if (!selectedProp.value) return
  try {
    await api.patch(`/properties/${selectedProp.value.id}/operation-type`, { operationType: newOpType.value })
    showOpTypeModal.value = false
    await load()
  } catch (e) { 
    console.error('Error actualizando tipo de operación:', e)
    alert('Error al actualizar el tipo de operación') 
  }
}

const doAssign = async (agentId: string) => {
  if (!selectedProp.value) return
  try {
    await propertyService.assignAgent(selectedProp.value.id, { agentId })
    showAssignModal.value = false
    await load()
  } catch (e) { 
    console.error('Error asignando agente:', e)
    alert('Error al asignar agente') 
  }
}

const handleCreate = async (data: any) => {
  try { 
    await propertyService.createProperty(data)
    showCreateModal.value = false
    await load()
    alert('Propiedad registrada con éxito')
  } catch (e) { 
    console.error('Error creando propiedad:', e)
    alert('Error al registrar la propiedad') 
  }
}

onMounted(load)
</script>