<template>
  <div class="p-6 space-y-6">
    <h1 class="text-3xl font-bold dark:text-white">Gestión Global de Inventario</h1>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
      <fwb-table hoverable>
        <fwb-table-head>
          <fwb-table-head-cell>Inmueble</fwb-table-head-cell>
          <fwb-table-head-cell>Precio Actual</fwb-table-head-cell>
          <fwb-table-head-cell>Agente</fwb-table-head-cell>
          <fwb-table-head-cell>Acciones</fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="p in allProperties" :key="p.id">
            <fwb-table-cell>{{ p.title }}</fwb-table-cell>
            <fwb-table-cell class="font-bold text-blue-500">${{ p.price }}</fwb-table-cell>
            <fwb-table-cell>{{ p.assignedAgentId || 'Sin asignar' }}</fwb-table-cell>
            <fwb-table-cell class="flex space-x-2">
              <fwb-button size="xs" @click="prepPriceUpdate(p)">Actualizar Precio</fwb-button>
              <fwb-button size="xs" color="alternative" @click="prepAssignment(p)">Reasignar</fwb-button>
            </fwb-table-cell>
          </fwb-table-row>
        </fwb-table-body>
      </fwb-table>
    </div>

    <assign-agent-modal 
      :show="showAssignModal" 
      :property="selectedProp" 
      :agents="agents" 
      @confirm="doAssign" 
      @close="showAssignModal = false" 
    />

    <fwb-modal v-if="showPriceModal" @close="showPriceModal = false">
      <template #header><div class="text-lg">Modificar Precio: {{ selectedProp?.title }}</div></template>
      <template #body>
        <fwb-input v-model.number="newPrice" type="number" label="Nuevo Valor de Mercado" />
      </template>
      <template #footer>
        <fwb-button @click="doPriceUpdate" gradient="blue">Guardar Cambio</fwb-button>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  FwbTable, FwbTableHead, FwbTableHeadCell, FwbTableBody, 
  FwbTableRow, FwbTableCell, FwbButton, FwbModal, FwbInput 
} from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { userService } from '../services/userService'
import type { Property } from '../types/property'
import type { User } from '../types/user'
import AssignAgentModal from '../components/properties/AssignAgentModal.vue'

// CORRECCIÓN: Definir tipos explícitos para los refs
const allProperties = ref<Property[]>([])
const agents = ref<User[]>([])
const selectedProp = ref<Property | null>(null)
const showAssignModal = ref(false)
const showPriceModal = ref(false)
const newPrice = ref(0)

const load = async () => {
  allProperties.value = await propertyService.getProperties()
  const users: User[] = await userService.getUsers()
  // Filtrar solo empleados/agentes
  agents.value = users.filter((u: User) => u.userType === 'EMPLOYEE' || u.userType === 'ADMIN')
}

const prepPriceUpdate = (p: Property) => {
  selectedProp.value = p
  newPrice.value = p.price
  showPriceModal.value = true
}

const doPriceUpdate = async () => {
  if (!selectedProp.value) return // Guard clause para evitar null
  
  try {
    await propertyService.updatePrice(selectedProp.value.id, newPrice.value)
    showPriceModal.value = false
    await load()
  } catch (e) {
    alert('Error al actualizar precio')
  }
}

const prepAssignment = (p: Property) => {
  selectedProp.value = p
  showAssignModal.value = true
}

const doAssign = async (agentId: string) => {
  if (!selectedProp.value) return
  
  try {
    await propertyService.assignAgent(selectedProp.value.id, { agentId })
    showAssignModal.value = false
    await load()
  } catch (e: any) {
    alert(e.response?.data?.detail || 'Error en la asignación')
  }
}

onMounted(load)
</script>