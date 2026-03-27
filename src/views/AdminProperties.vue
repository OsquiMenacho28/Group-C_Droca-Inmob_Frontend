<template>
  <div class="p-6 space-y-6">
    <!-- Cabecera -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Gestión de Inventario</h1>
        <p class="text-gray-500 text-sm">Administración global y auditoría de propiedades</p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">Modo Administrador</fwb-badge>
        <fwb-button @click="showCreateModal = true" gradient="blue">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Registrar Nuevo
          </div>
        </fwb-button>
      </div>
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="text-center py-20 dark:text-white">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-500">Cargando catálogo...</p>
    </div>
    
    <!-- Grid de Tarjetas -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card v-for="p in allProperties" :key="p.id" class="flex flex-col h-full overflow-hidden border-gray-200 dark:border-gray-700 relative">
        
        <!-- Owner Badge (Top Left) -->
        <div class="absolute top-2 left-2 z-10">
          <div v-if="p.ownerId" class="bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {{ getOwnerName(p.ownerId) }}
          </div>
          <div v-else class="bg-gray-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
            Sin propietario
          </div>
        </div>

        <!-- Botón de Histórico (Detalles) (Top Right) -->
        <button 
          @click="viewDetails(p)" 
          class="absolute top-2 right-2 z-10 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:text-blue-600 transition-all hover:scale-110"
          title="Ver historial y detalles"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </button>

        <!-- Imagen / Placeholder -->
        <div class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 relative">
          <img v-if="p.imageUrls?.length" :src="p.imageUrls[0]" class="h-full w-full object-cover">
          <span v-else>Sin imágenes</span>
          <!-- Status Badge moved to bottom-right to avoid collision with History button -->
          <div class="absolute bottom-2 right-2">
            <fwb-badge :type="p.status === 'DISPONIBLE' ? 'green' : 'red'">{{ p.status }}</fwb-badge>
          </div>
        </div>

        <!-- Contenido de la Tarjeta -->
        <div class="p-5 flex-1 flex flex-col">
          <h5 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">{{ p.title }}</h5>
          <p class="text-sm text-gray-500 mb-4">{{ p.address }}</p>
          
          <div class="flex justify-between items-end mt-auto">
            <div>
              <p class="text-xs text-gray-400 uppercase font-bold tracking-tighter">Precio de Lista</p>
              <p class="text-2xl font-black text-blue-600">${{ p.price.toLocaleString() }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 uppercase font-bold">Asesor Responsable</p>
              <p class="text-sm font-semibold dark:text-gray-200">
                {{ resolveAgentName(p.assignedAgentId) }}
              </p>
            </div>
          </div>

          <!-- Acciones Rápidas -->
          <div class="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <fwb-button size="sm" color="alternative" @click="prepPriceUpdate(p)" class="w-full">
              Precio
            </fwb-button>
            <fwb-button size="sm" gradient="blue" @click="prepAssignment(p)" class="w-full">
              Asignar
            </fwb-button>
          </div>

          <!-- Assign Owner Button -->
          <div class="mt-2">
            <fwb-button size="sm" color="alternative" @click="prepOwnerAssignment(p)" class="w-full">
              {{ p.ownerId ? 'Cambiar propietario' : 'Asignar propietario' }}
            </fwb-button>
          </div>
        </div>
      </fwb-card>
    </div>

    <!-- Mensaje vacío -->
    <div v-if="!loading && allProperties.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
       <p class="text-gray-500">No hay inmuebles registrados en el sistema.</p>
    </div>

    <!-- MODAL DETALLES E HISTÓRICOS -->
    <property-details-modal 
      v-if="showDetailsModal" 
      :show="showDetailsModal" 
      :property="selectedProp" 
      @close="showDetailsModal = false" 
    />

    <!-- MODAL REGISTRAR NUEVO -->
    <fwb-modal v-if="showCreateModal" @close="showCreateModal = false" size="2xl">
      <template #header><div class="text-lg font-bold">Registrar Propiedad</div></template>
      <template #body>
        <property-form @submit="handleCreate" @cancel="showCreateModal = false" />
      </template>
    </fwb-modal>

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
        <div class="space-y-3">
          <p class="text-sm text-gray-500 italic">Inmueble: {{ selectedProp?.title }}</p>
          <fwb-input v-model.number="newPrice" type="number" label="Nuevo Valor de Mercado ($)" required />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <fwb-button color="alternative" @click="showPriceModal = false">Cancelar</fwb-button>
          <fwb-button @click="doPriceUpdate" gradient="blue">Guardar Cambio</fwb-button>
        </div>
      </template>
    </fwb-modal>

    <!-- MODAL ASIGNAR PROPIETARIO -->
    <fwb-modal v-if="showOwnerModal" @close="showOwnerModal = false">
      <template #header>
        <div class="text-lg font-bold">Asignar Propietario</div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">Inmueble: <span class="font-bold dark:text-white">{{ selectedProp?.title }}</span></p>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccionar Propietario</label>
            <select v-model="selectedOwnerId" class="w-full border border-gray-300 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500">
              <option value="">Sin propietario</option>
              <option v-for="owner in availableOwners" :key="owner.id" :value="owner.id">
                {{ owner.fullName }} ({{ owner.email }})
              </option>
            </select>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <fwb-button color="alternative" @click="showOwnerModal = false">Cancelar</fwb-button>
          <fwb-button gradient="blue" @click="doAssignOwner">Confirmar</fwb-button>
        </div>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { FwbCard, FwbButton, FwbModal, FwbInput, FwbBadge } from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { userService } from '../services/userService'
import AssignAgentModal from '../components/properties/AssignAgentModal.vue'
import PropertyForm from '../components/properties/PropertyForm.vue'
import PropertyDetailsModal from '../components/properties/PropertyDetailsModal.vue'

const allProperties = ref<any[]>([])
const allUsers = ref<any[]>([])
const loading = ref(false)
const showCreateModal = ref(false)
const showAssignModal = ref(false)
const showPriceModal = ref(false)
const showDetailsModal = ref(false)
const selectedProp = ref<any>(null)
const newPrice = ref(0)

// --- Owner Management State ---
const showOwnerModal = ref(false)
const selectedOwnerId = ref('')

// Computed property for active agents
const activeAgents = computed(() => 
  allUsers.value.filter(u => (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') && u.status === 'ACTIVE')
)

// Computed property for available owners (Optimized: uses cached allUsers)
const availableOwners = computed(() => 
  allUsers.value.filter((u: any) => u.userType === 'OWNER' && u.status === 'ACTIVE')
)

const load = async () => {
  loading.value = true
  try {
    // Fetch properties and users in parallel
    const [p, u] = await Promise.all([propertyService.getProperties(), userService.getUsers()])
    allProperties.value = p
    allUsers.value = u
  } catch (e) {
    console.error("Error cargando datos:", e)
  } finally {
    loading.value = false
  }
}

const resolveAgentName = (id: string | null) => {
  if (!id) return 'Sin asignar'
  const u = allUsers.value.find(x => x.id === id)
  return u ? u.fullName : 'Agente Desconocido'
}

// --- Owner Helpers ---
const getOwnerName = (ownerId: string) => {
  const owner = allUsers.value.find(o => o.id === ownerId)
  return owner ? owner.fullName : 'Propietario no encontrado'
}

const viewDetails = (p: any) => {
  selectedProp.value = p
  showDetailsModal.value = true
}

const handleCreate = async (data: any) => {
  try {
    const { files, ...payload } = data
    await propertyService.createProperty(payload)
    showCreateModal.value = false
    await load()
  } catch (e) { alert("Error al registrar inmueble") }
}

const prepPriceUpdate = (p: any) => {
  selectedProp.value = p
  newPrice.value = p.price
  showPriceModal.value = true
}

const doPriceUpdate = async () => {
  try {
    await propertyService.updatePrice(selectedProp.value.id, newPrice.value)
    showPriceModal.value = false
    await load()
  } catch (e) { alert("Error al actualizar precio") }
}

const prepAssignment = (p: any) => {
  selectedProp.value = p
  showAssignModal.value = true
}

const doAssign = async (agentId: string) => {
  try {
    await propertyService.assignAgent(selectedProp.value.id, { agentId })
    showAssignModal.value = false
    await load()
  } catch (e: any) {
    alert(e.response?.data?.detail || "Error en la asignación")
  }
}

// --- Owner Actions ---
const prepOwnerAssignment = (p: any) => {
  selectedProp.value = p
  selectedOwnerId.value = p.ownerId || ''
  showOwnerModal.value = true
}

const doAssignOwner = async () => {
  if (!selectedProp.value) return
  
  try {
    // Assuming propertyService has an assignOwner method
    await propertyService.assignOwner(selectedProp.value.id, { ownerId: selectedOwnerId.value })
    showOwnerModal.value = false
    await load() // Reload properties to reflect changes
    alert(selectedOwnerId.value ? 'Propietario asignado correctamente' : 'Propietario removido correctamente')
  } catch (e: any) {
    alert(e.response?.data?.detail || 'Error al asignar propietario')
  }
}

onMounted(load)
</script>