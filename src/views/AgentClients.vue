<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Mis Clientes</h1>
      <fwb-button @click="openCreateModal" gradient="blue">
        Registrar Nuevo Cliente
      </fwb-button>
    </div>

    <!-- Barra de búsqueda -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <input
          v-model="searchName"
          type="text"
          class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50
                 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600
                 dark:placeholder-gray-400 dark:text-white"
          placeholder="Buscar por nombre..."
        />
      </div>
      <p v-if="searchName && filteredClients.length === 0" class="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
        ⚠️ No se encontraron clientes con nombre "{{ searchName }}"
      </p>
    </div>

    <div v-if="loading" class="text-center py-10">Cargando...</div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-x-auto">
      <fwb-table hoverable>
        <fwb-table-head>
          <fwb-table-head-cell>Nombre</fwb-table-head-cell>
          <fwb-table-head-cell>Zona</fwb-table-head-cell>
          <fwb-table-head-cell>Tipo Inmueble</fwb-table-head-cell>
          <fwb-table-head-cell>Habitaciones</fwb-table-head-cell>
          <fwb-table-head-cell>Presupuesto</fwb-table-head-cell>
          <fwb-table-head-cell>Acciones</fwb-table-head-cell>
        </fwb-table-head>
        <fwb-table-body>
          <fwb-table-row v-for="c in filteredClients" :key="c.id">
            <fwb-table-cell class="font-medium">
              {{ c.fullName || `${c.firstName} ${c.lastName}` }}
            </fwb-table-cell>
            <fwb-table-cell>
              <span v-if="c.preferredZone"
                class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {{ c.preferredZone }}
              </span>
              <span v-else class="text-gray-400 text-xs">—</span>
            </fwb-table-cell>
            <fwb-table-cell>
              <span v-if="c.preferredPropertyType"
                class="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                {{ c.preferredPropertyType }}
              </span>
              <span v-else class="text-gray-400 text-xs">—</span>
            </fwb-table-cell>
            <fwb-table-cell>
              <span v-if="c.preferredRooms" class="font-mono text-sm">{{ c.preferredRooms }}</span>
              <span v-else class="text-gray-400 text-xs">—</span>
            </fwb-table-cell>
            <fwb-table-cell>
              <span v-if="c.budget" class="font-medium text-green-700 dark:text-green-400">
                ${{ Number(c.budget).toLocaleString() }}
              </span>
              <span v-else class="text-gray-400 text-xs">—</span>
            </fwb-table-cell>
            <fwb-table-cell>
              <button @click="openEditModal(c)"
                class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50
                       dark:hover:bg-blue-900/30 rounded transition-colors">
                Editar
              </button>
            </fwb-table-cell>
          </fwb-table-row>
          <fwb-table-row v-if="filteredClients.length === 0 && !loading">
            <fwb-table-cell colspan="6" class="text-center text-gray-500 py-8">
              No hay clientes registrados.
            </fwb-table-cell>
          </fwb-table-row>
        </fwb-table-body>
      </fwb-table>
    </div>

    <fwb-modal v-if="showModal" @close="closeModal">
      <template #header>
        <div class="text-lg font-semibold">
          {{ isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente' }}
        </div>
      </template>
      <template #body>
        <user-form
          :key="formKey"
          :initial-data="editingClient"
          :is-editing="isEditing"
          :client-only="true"
          @submit="handleSubmit"
          @cancel="closeModal"
        />
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  FwbButton, FwbTable, FwbTableHead, FwbTableHeadCell,
  FwbTableBody, FwbTableRow, FwbTableCell, FwbModal
} from 'flowbite-vue';
import { personService } from '../services/personService';
import { userService } from '../services/userService';
import { useAuth } from '../composables/useAuth';
import UserForm from '../components/users/UserForm.vue';

const { user } = useAuth();
const clients = ref<any[]>([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const editingClient = ref<any>(null);
const formKey = ref(0);
const searchName = ref('');

const filteredClients = computed(() => {
  if (!searchName.value.trim()) return clients.value;
  const term = searchName.value.trim().toLowerCase();
  return clients.value.filter(c => {
    const name = (c.fullName || `${c.firstName} ${c.lastName}`).toLowerCase();
    return name.includes(term);
  });
});

const loadClients = async () => {
  loading.value = true;
  try {
    clients.value = await personService.getClientsForAgent();
  } catch (e) {
    console.error('Error loading clients:', e);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingClient.value = null;
  isEditing.value = false;
  formKey.value++;
  showModal.value = true;
};

const openEditModal = (client: any) => {
  editingClient.value = { ...client };
  isEditing.value = true;
  formKey.value++;
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; };

const handleSubmit = async (formData: any) => {
  try {
    if (isEditing.value && editingClient.value) {
      await personService.updateClientForAgent(editingClient.value.id, formData);
    } else {
      const agentId = user.value?.sub;
      if (!agentId) throw new Error('No se pudo identificar al agente autenticado');
      await userService.createUser({ ...formData, userType: 'INTERESTED_CLIENT', assignedAgentId: agentId });
    }
    await loadClients();
    closeModal();
  } catch (error: any) {
    alert(error.response?.data?.detail || error.message || 'Error al procesar la solicitud');
  }
};

onMounted(loadClients);
</script>