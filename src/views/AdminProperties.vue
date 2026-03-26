<template>
  <div class="p-6 space-y-6">
    <!-- Cabecera con Botón de Agregar -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Gestión de Inventario</h1>
        <p class="text-gray-500 text-sm">Administración global de propiedades</p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">Admin Mode</fwb-badge>
        <!-- BOTÓN AGREGAR INMUEBLE DEVUELTO -->
        <fwb-button @click="showCreateModal = true" gradient="blue">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Registrar Nuevo
          </div>
        </fwb-button>
      </div>
    </div>

    <!-- Grid de Tarjetas -->
    <div v-if="loading" class="text-center py-20 dark:text-white">Cargando inmuebles...</div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card v-for="p in allProperties" :key="p.id" class="flex flex-col h-full overflow-hidden border-gray-200 dark:border-gray-700">
        <div class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 relative">
          <img v-if="p.imageUrls?.length" :src="p.imageUrls[0]" class="h-full w-full object-cover">
          <span v-else>Sin imágenes</span>
          <div class="absolute top-2 right-2">
            <fwb-badge :type="p.status === 'DISPONIBLE' ? 'green' : 'red'">{{ p.status }}</fwb-badge>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <h5 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">{{ p.title }}</h5>
          <p class="text-sm text-gray-500 mb-4">{{ p.address }}</p>
          
          <div class="flex justify-between items-end mt-auto">
            <div>
              <p class="text-xs text-gray-400 uppercase font-bold">Precio</p>
              <p class="text-2xl font-extrabold text-blue-600">${{ p.price.toLocaleString() }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 uppercase font-bold">Responsable</p>
              <p class="text-sm font-medium dark:text-gray-200">{{ resolveAgentName(p.assignedAgentId) }}</p>
            </div>
          </div>

          <!-- Acciones -->
          <div class="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <fwb-button size="sm" color="alternative" @click="prepPriceUpdate(p)">Precio</fwb-button>
            <fwb-button size="sm" gradient="blue" @click="prepAssignment(p)">Asignar</fwb-button>
          </div>
        </div>
      </fwb-card>
    </div>

    <!-- MODAL REGISTRAR NUEVO (HU1) -->
    <fwb-modal v-if="showCreateModal" @close="showCreateModal = false" size="2xl">
      <template #header><div class="text-lg font-bold">Registrar Nueva Propiedad</div></template>
      <template #body>
        <property-form @submit="handleCreate" @cancel="showCreateModal = false" />
      </template>
    </fwb-modal>

    <!-- MODAL ASIGNAR AGENTE (HU3) -->
    <assign-agent-modal
      v-if="showAssignModal"
      :show="showAssignModal"
      :property="selectedProp"
      :agents="activeAgents"
      @confirm="doAssign"
      @close="showAssignModal = false"
    />

    <!-- MODAL EDITAR PRECIO (HU2) -->
    <fwb-modal v-if="showPriceModal" @close="showPriceModal = false">
      <template #header><div class="text-lg font-bold">Actualizar Precio</div></template>
      <template #body>
        <fwb-input v-model.number="newPrice" type="number" label="Nuevo Valor ($)" required />
      </template>
      <template #footer>
        <fwb-button @click="doPriceUpdate" gradient="blue">Guardar</fwb-button>
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { FwbCard, FwbButton, FwbModal, FwbInput, FwbBadge } from 'flowbite-vue'
import { propertyService } from '../services/propertyService'
import { userService } from '../services/userService'
import { useAuth } from '../composables/useAuth'
import AssignAgentModal from '../components/properties/AssignAgentModal.vue'
import PropertyForm from '../components/properties/PropertyForm.vue'

const { user } = useAuth()
const allProperties = ref<any[]>([])
const allUsers = ref<any[]>([])
const loading = ref(false)
const showCreateModal = ref(false)
const showAssignModal = ref(false)
const showPriceModal = ref(false)
const selectedProp = ref<any>(null)
const newPrice = ref(0)

const activeAgents = computed(() => 
  allUsers.value.filter(u => (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') && u.status === 'ACTIVE')
)

const load = async () => {
  loading.value = true
  try {
    const [p, u] = await Promise.all([propertyService.getProperties(), userService.getUsers()])
    allProperties.value = p
    allUsers.value = u
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const resolveAgentName = (id: string) => {
  const u = allUsers.value.find(x => x.id === id);
  return u ? u.fullName : 'Sin asignar';
}

const handleCreate = async (data: any) => {
  try {
    const { files, ...payload } = data;
    await propertyService.createProperty(payload);
    showCreateModal.value = false;
    await load();
  } catch (e) { alert("Error al registrar inmueble"); }
}

const prepPriceUpdate = (p: any) => {
  selectedProp.value = p;
  newPrice.value = p.price;
  showPriceModal.value = true;
}

const doPriceUpdate = async () => {
  await propertyService.updatePrice(selectedProp.value.id, newPrice.value);
  showPriceModal.value = false;
  load();
}

const prepAssignment = (p: any) => {
  selectedProp.value = p;
  showAssignModal.value = true;
}

const doAssign = async (agentId: string) => {
  await propertyService.assignAgent(selectedProp.value.id, { agentId });
  showAssignModal.value = false;
  load();
}

onMounted(load)
</script>