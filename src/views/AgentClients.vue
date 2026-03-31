<template>
  <div class="p-6 space-y-6">
    <!-- Cabecera estilo Property -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Mis Clientes</h1>
        <p class="text-gray-500 text-sm">Cartera de prospectos y clientes asignados</p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">Agente: {{ user?.fullName || 'Asesor' }}</fwb-badge>
        <fwb-button @click="openCreateModal" gradient="blue">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Nuevo Cliente
          </div>
        </fwb-button>
      </div>
    </div>

    <!-- Buscador -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div class="relative max-w-md">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <input 
          v-model="searchName" 
          type="text" 
          placeholder="Buscar cliente por nombre..." 
          class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
        >
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-500">Cargando clientes...</p>
    </div>

    <!-- GRID DE CARDS (Igual que AdminProperties) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card v-for="c in filteredClients" :key="c.id" class="flex flex-col h-full overflow-hidden border-gray-200 dark:border-gray-700 relative">
        
        <!-- Botón de Histórico (Top Right) -->
        <button
          @click="openDetails(c)"
          class="absolute top-3 right-3 z-10 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:text-blue-600 transition-all hover:scale-110"
          title="Ver histórico de cambios"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <!-- Cabecera Visual (Gradiente en lugar de foto) -->
        <div class="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative">
          <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black uppercase shadow-inner">
            {{ c.firstName?.charAt(0) }}{{ c.lastName?.charAt(0) }}
          </div>
          <div class="absolute bottom-2 right-2">
            <fwb-badge type="indigo">{{ c.preferredPropertyType || 'Interesado' }}</fwb-badge>
          </div>
        </div>

        <!-- Contenido de la Card -->
        <div class="p-5 flex-1 flex flex-col">
          <h5 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {{ c.fullName || `${c.firstName} ${c.lastName}` }}
          </h5>
          <p class="text-sm text-gray-500 mb-4 truncate">{{ c.email }}</p>

          <div class="flex justify-between items-end mt-auto">
            <div>
              <p class="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Presupuesto</p>
              <p class="text-2xl font-black text-green-600">${{ Number(c.budget || 0).toLocaleString() }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 uppercase font-bold">Zona Preferida</p>
              <p class="text-sm font-semibold dark:text-gray-200">{{ c.preferredZone || 'Cualquiera' }}</p>
            </div>
          </div>

          <!-- Acciones -->
          <div class="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <fwb-button size="sm" color="alternative" @click="openEditModal(c)" class="w-full">
              Editar Perfil
            </fwb-button>
            <fwb-button size="sm" gradient="blue" @click="openDetails(c)" class="w-full">
              Detalles / Histórico
            </fwb-button>
          </div>
        </div>
      </fwb-card>
    </div>

    <!-- Mensaje si no hay resultados -->
    <div v-if="!loading && filteredClients.length === 0" class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed">
       <p class="text-gray-500">No se encontraron clientes que coincidan.</p>
    </div>

    <!-- MODAL HISTÓRICO Y DETALLES -->
    <client-details-modal 
      v-if="showDetailsModal" 
      :show="showDetailsModal" 
      :client="selectedClient" 
      @close="showDetailsModal = false" 
    />

    <!-- MODAL CREACIÓN / EDICIÓN -->
    <fwb-modal v-if="showModal" @close="closeModal">
      <template #header>
        <div class="text-lg font-semibold">{{ isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente' }}</div>
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
import { FwbButton, FwbBadge, FwbModal, FwbCard } from 'flowbite-vue';
import { personService } from '../services/personService';
import { userService } from '../services/userService';
import { useAuth } from '../composables/useAuth';
import UserForm from '../components/users/UserForm.vue';
import ClientDetailsModal from '../components/users/ClientDetailsModal.vue';

const { user } = useAuth();
const clients = ref<any[]>([]);
const loading = ref(false);
const showModal = ref(false);
const showDetailsModal = ref(false);
const isEditing = ref(false);
const editingClient = ref<any>(null);
const selectedClient = ref<any>(null);
const formKey = ref(0);
const searchName = ref('');

const filteredClients = computed(() => {
  if (!searchName.value.trim()) return clients.value;
  const term = searchName.value.toLowerCase();
  return clients.value.filter(c => 
    (c.fullName || `${c.firstName} ${c.lastName}`).toLowerCase().includes(term)
  );
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

const openDetails = (client: any) => {
  selectedClient.value = client;
  showDetailsModal.value = true;
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
      const agentId = user.value?.sub || user.value?.userId;
      await userService.createUser({ 
        ...formData, 
        userType: 'INTERESTED_CLIENT', 
        assignedAgentId: agentId 
      });
    }
    await loadClients();
    closeModal();
  } catch (error: any) {
    alert(error.response?.data?.detail || 'Error al procesar la solicitud');
  }
};

onMounted(loadClients);
</script>