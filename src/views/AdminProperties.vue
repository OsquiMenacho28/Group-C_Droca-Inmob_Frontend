<!-- FILE: src/views/AdminProperties.vue -->
<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold dark:text-white">Gestión Global de Inventario</h1>
      <fwb-badge type="indigo">Admin Mode</fwb-badge>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <fwb-table hoverable>
        <fwb-table-head>
          <fwb-table-head-cell>Inmueble</fwb-table-head-cell>
          <fwb-table-head-cell>Precio Actual</fwb-table-head-cell>
          <fwb-table-head-cell>Agente Asignado</fwb-table-head-cell>
          <fwb-table-head-cell class="text-center">Acciones</fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="p in allProperties" :key="p.id">
            <fwb-table-cell class="font-medium text-gray-900 dark:text-white">
              {{ p.title }}
              <p class="text-xs text-gray-400 font-normal">{{ p.address }}</p>
            </fwb-table-cell>
            <fwb-table-cell class="font-bold text-blue-600">
              ${{ p.price.toLocaleString() }}
            </fwb-table-cell>
            <fwb-table-cell>
              <span v-if="p.assignedAgentId" class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                {{ resolveAgentName(p.assignedAgentId) }}
              </span>
              <span v-else class="text-red-400 italic text-xs">Sin responsable</span>
            </fwb-table-cell>
            <fwb-table-cell>
              <div class="flex justify-center space-x-2">
                <!-- BOTÓN EDITAR PRECIO -->
                <fwb-button size="xs" color="alternative" @click="prepPriceUpdate(p)">
                  <div class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Precio
                  </div>
                </fwb-button>
                <!-- BOTÓN ASIGNAR -->
                <fwb-button size="xs" gradient="blue" @click="prepAssignment(p)">
                  <div class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    Asignar
                  </div>
                </fwb-button>
              </div>
            </fwb-table-cell>
          </fwb-table-row>
          <fwb-table-row v-if="allProperties.length === 0">
            <fwb-table-cell colspan="4" class="text-center py-10 text-gray-500">No hay inmuebles registrados.</fwb-table-cell>
          </fwb-table-row>
        </fwb-table-body>
      </fwb-table>
    </div>

    <!-- MODAL ASIGNAR AGENTE -->
    <assign-agent-modal
      v-if="showAssignModal"
      :show="showAssignModal"
      :property="selectedProp"
      :agents="activeAgents"
      @confirm="doAssign"
      @close="showAssignModal = false"
    />

    <!-- MODAL EDITAR PRECIO -->
    <fwb-modal v-if="showPriceModal" @close="showPriceModal = false">
      <template #header><div class="text-lg font-bold">Modificar Precio</div></template>
      <template #body>
        <fwb-input v-model.number="newPrice" type="number" label="Nuevo Valor ($)" required />
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <fwb-button color="alternative" @click="showPriceModal = false">Cancelar</fwb-button>
          <fwb-button @click="doPriceUpdate" gradient="blue">Actualizar</fwb-button>
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  FwbTable, FwbTableHead, FwbTableHeadCell, FwbTableBody, 
  FwbTableRow, FwbTableCell, FwbButton, FwbModal, FwbInput, FwbBadge 
} from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { userService } from '../services/userService'
import AssignAgentModal from '../components/properties/AssignAgentModal.vue'

const allProperties = ref<any[]>([])
const allUsers = ref<any[]>([])
const selectedProp = ref<any>(null)
const showAssignModal = ref(false)
const showPriceModal = ref(false)
const newPrice = ref(0)

const activeAgents = computed(() => 
  allUsers.value.filter(u => (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') && u.status === 'ACTIVE')
)

const load = async () => {
  try {
    const [p, u] = await Promise.all([propertyService.getProperties(), userService.getUsers()])
    allProperties.value = p
    allUsers.value = u
  } catch (e) { console.error(e) }
}

const resolveAgentName = (id: string) => {
  const u = allUsers.value.find(x => x.id === id)
  return u ? u.fullName : 'Desconocido'
}

const prepPriceUpdate = (p: any) => {
  selectedProp.value = p
  newPrice.value = p.price
  showPriceModal.value = true
}

const doPriceUpdate = async () => {
  await propertyService.updatePrice(selectedProp.value.id, newPrice.value)
  showPriceModal.value = false
  load()
}

const prepAssignment = (p: any) => {
  selectedProp.value = p
  showAssignModal.value = true
}

const doAssign = async (agentId: string) => {
  await propertyService.assignAgent(selectedProp.value.id, { agentId })
  showAssignModal.value = false
  load()
}

onMounted(load)
</script>