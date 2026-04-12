<template>
  <div class="p-6 space-y-6">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold dark:text-white">
          Gestión de Inventario
        </h1>
        <p class="text-gray-500 text-sm">
          Administración global y auditoría de propiedades
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">Modo Administrador</fwb-badge>
        <fwb-button @click="openCreateModal" gradient="blue">
          <div class="flex items-center">
            <IconLucidePlus class="w-4 h-4 mr-2" />
            Registrar Nuevo
          </div>
        </fwb-button>
      </div>
    </div>

    <div
      class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase"
            >Buscar por título</label
          >
          <fwb-input
            v-model="filterTitle"
            placeholder="Ej: Condominio..."
            @input="handleFilterDebounce"
          />
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase"
            >Tipo de Operación</label
          >
          <select
            v-model="filterOpType"
            @change="resetAndLoad"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos los tipos</option>
            <option value="VENTA">Venta</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="ANTICRETICO">Anticrético</option>
          </select>
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase"
            >Elementos por página</label
          >
          <select
            v-model="pageSize"
            @change="resetAndLoad"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
          >
            <option :value="5">5 por página</option>
            <option :value="9">9 por página</option>
            <option :value="20">20 por página</option>
            <option :value="50">50 por página</option>
          </select>
        </div>
        <div class="flex justify-end gap-2">
          <fwb-button color="alternative" size="sm" @click="clearAllFilters"
            >Limpiar Filtros</fwb-button
          >
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20 dark:text-white">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500">Cargando catálogo...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card
        v-for="p in allProperties"
        :key="p.id"
        class="flex flex-col h-full overflow-hidden border-gray-200 dark:border-gray-700 relative"
      >
        <button
          @click="viewDetails(p)"
          class="absolute top-2 left-2 z-10 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:text-blue-600 transition-all hover:scale-110"
          title="Ver historial y detalles"
        >
          <IconLucideClipboardList class="w-5 h-5" />
        </button>

        <div class="absolute top-2 left-12 z-10">
          <fwb-badge :type="getOpTypeBadge(p.operationType)">{{
            p.operationType || 'No definido'
          }}</fwb-badge>
        </div>

        <div class="absolute top-2 right-2 flex space-x-1 z-10">
          <button
            @click="openEditModal(p)"
            class="bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 shadow-lg"
            title="Editar"
          >
            <IconLucidePencil class="w-4 h-4" />
          </button>
          <button
            @click="confirmDelete(p)"
            class="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-lg"
            title="Eliminar"
          >
            <IconLucideTrash class="w-4 h-4" />
          </button>
        </div>

        <div
          class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 relative"
        >
          <img
            v-if="p.imageUrls?.length"
            :src="p.imageUrls[0]"
            class="h-full w-full object-cover"
            @error="handleImageError($event)"
          />
          <span v-else>Sin imágenes</span>
          <div class="absolute bottom-2 right-2">
            <span
              :class="getStatusBadgeClass(p.status)"
              class="text-xs font-medium px-2.5 py-0.5 rounded"
            >
              {{ p.status }}
            </span>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <p class="text-[10px] text-gray-400 uppercase font-bold">
            Dueño: {{ getOwnerName(p.ownerId) || 'No asignado' }}
          </p>
          <h5
            class="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-1"
          >
            {{ p.title }}
          </h5>
          <p class="text-sm text-gray-500 mb-4">{{ p.address }}</p>

          <div class="flex justify-between items-end mt-auto">
            <div>
              <p
                class="text-xs text-gray-400 uppercase font-bold tracking-tighter"
              >
                Precio
              </p>
              <p class="text-2xl font-black text-blue-600">
                ${{ (p.price || 0).toLocaleString() }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 uppercase font-bold">
                Asesor
              </p>
              <p class="text-sm font-semibold dark:text-gray-200">
                {{ resolveAgentName(p.assignedAgentId) }}
              </p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <document-upload
              :property-id="p.id"
              :agent-id="p.assignedAgentId || undefined"
            />
          </div>

          <div
            class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <fwb-button
              size="sm"
              color="alternative"
              @click="prepPriceUpdate(p)"
              >Precio</fwb-button
            >
            <fwb-button
              size="sm"
              color="alternative"
              @click="prepOpTypeUpdate(p)"
              >Operación</fwb-button
            >
            <fwb-button size="sm" gradient="blue" @click="prepAssignment(p)"
              >Agente</fwb-button
            >
            <fwb-button
              size="sm"
              gradient="purple"
              @click="prepOwnerAssignment(p)"
              >Dueño</fwb-button
            >
          </div>
        </div>
      </fwb-card>
    </div>

    <div
      v-if="!loading && allProperties.length === 0"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <p class="text-gray-500">No hay inmuebles registrados.</p>
    </div>

    <div
      v-if="totalPages > 1"
      class="flex justify-center items-center space-x-2 mt-8 pb-10"
    >
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 0"
        class="px-3 py-2 rounded-lg border dark:border-gray-600 disabled:opacity-30 dark:text-white bg-white dark:bg-gray-800"
      >
        Anterior
      </button>

      <template v-for="page in totalPages" :key="page">
        <button
          @click="changePage(page - 1)"
          :class="[
            'px-4 py-2 rounded-lg border transition-colors',
            currentPage === page - 1
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:bg-gray-100',
          ]"
        >
          {{ page }}
        </button>
      </template>

      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        class="px-3 py-2 rounded-lg border dark:border-gray-600 disabled:opacity-30 dark:text-white bg-white dark:bg-gray-800"
      >
        Siguiente
      </button>
    </div>

    <property-details-modal
      v-if="showDetailsModal"
      :show="showDetailsModal"
      :property="selectedProp"
      :is-client-view="false"
      @close="closeDetailsModal"
      @status-updated="handleStatusUpdated"
    />

    <fwb-modal
      v-if="showCreateEditModal"
      @close="closeCreateEditModal"
      size="2xl"
    >
      <template #header
        ><div class="text-lg font-bold">
          {{ isEditing ? 'Editar Propiedad' : 'Registrar Propiedad' }}
        </div></template
      >
      <template #body>
        <property-form
          :key="formKey"
          :initial-data="editingProperty || undefined"
          :property-id="(editingProperty?.id as string) || undefined"
          @submit="handleCreateEdit"
          @cancel="closeCreateEditModal"
        />
      </template>
    </fwb-modal>

    <assign-agent-modal
      v-if="showAssignModal"
      :show="showAssignModal"
      :property="selectedProp"
      :agents="activeAgents"
      @confirm="doAssign"
      @close="showAssignModal = false"
    />

    <fwb-modal v-if="showOwnerModal" @close="showOwnerModal = false">
      <template #header
        ><div class="text-lg font-bold">Asignar Propietario</div></template
      >
      <template #body>
        <select
          v-model="selectedOwnerId"
          class="w-full border rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Seleccione un dueño...</option>
          <option v-for="o in availableOwners" :key="o.id" :value="o.id">
            {{ o.fullName }}
          </option>
        </select>
      </template>
      <template #footer>
        <fwb-button @click="doAssignOwner" gradient="blue">Asignar</fwb-button>
      </template>
    </fwb-modal>

    <fwb-modal v-if="showPriceModal" @close="showPriceModal = false">
      <template #header
        ><div class="text-lg font-bold">Modificar Precio</div></template
      >
      <template #body>
        <fwb-input
          v-model.number="newPrice"
          type="number"
          label="Nuevo Valor ($)"
          required
        />
      </template>
      <template #footer>
        <fwb-button color="alternative" @click="showPriceModal = false"
          >Cancelar</fwb-button
        >
        <fwb-button @click="doPriceUpdate" gradient="blue"
          >Confirmar</fwb-button
        >
      </template>
    </fwb-modal>

    <fwb-modal v-if="showOpTypeModal" @close="showOpTypeModal = false">
      <template #header
        ><div class="text-lg font-bold">Cambiar Operación</div></template
      >
      <template #body>
        <select
          v-model="newOpType"
          class="w-full border rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option value="VENTA">Venta</option>
          <option value="ALQUILER">Alquiler</option>
          <option value="ANTICRETICO">Anticrético</option>
        </select>
      </template>
      <template #footer>
        <fwb-button @click="doOpTypeUpdate" gradient="blue">Guardar</fwb-button>
      </template>
    </fwb-modal>

    <fwb-modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #header
        ><div class="text-lg font-bold text-red-600">
          Eliminar Propiedad
        </div></template
      >
      <template #body>
        <p>
          ¿Seguro que deseas eliminar
          <strong>{{ propertyToDelete?.title }}</strong
          >?
        </p>
      </template>
      <template #footer>
        <fwb-button color="alternative" @click="showDeleteModal = false"
          >Cancelar</fwb-button
        >
        <fwb-button
          color="red"
          @click="doDeleteProperty"
          :disabled="deleting"
          >{{ deleting ? 'Eliminando...' : 'Eliminar' }}</fwb-button
        >
      </template>
    </fwb-modal>
  </div>
</template>

<script setup lang="ts">
import IconLucidePlus from '~icons/lucide/plus';
import IconLucideClipboardList from '~icons/lucide/clipboard-list';
import IconLucidePencil from '~icons/lucide/pencil';
import IconLucideTrash from '~icons/lucide/trash';
import { ref, onMounted, computed } from 'vue';
import { FwbCard, FwbButton, FwbModal, FwbInput, FwbBadge } from 'flowbite-vue';
import { propertyService } from '@/services/propertyService';
import { userService } from '@/services/userService';
import { api } from '@/services/api';
import AssignAgentModal from '@/components/properties/AssignAgentModal.vue';
import PropertyForm from '@/components/properties/PropertyForm.vue';
import DocumentUpload from '@/components/properties/DocumentUpload.vue';
import PropertyDetailsModal from '@/components/properties/PropertyDetailsModal.vue';
import type { Property, PropertyFormPayload } from '@/types/property';

interface User {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userType: string;
  status: string;
  assignedAgentId?: string;
}

const allProperties = ref<Property[]>([]);
const allUsers = ref<User[]>([]);
const loading = ref(false);
const totalPages = ref(0);
const currentPage = ref(0);
const pageSize = ref(9);
const deleting = ref(false);
const filterTitle = ref('');
const filterOpType = ref('');
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const showCreateEditModal = ref(false);
const showAssignModal = ref(false);
const showPriceModal = ref(false);
const showOpTypeModal = ref(false);
const showOwnerModal = ref(false);
const showDeleteModal = ref(false);
const showDetailsModal = ref(false);

const isEditing = ref(false);
const editingProperty = ref<Record<string, unknown> | null>(null);
const propertyToDelete = ref<Property | null>(null);
const formKey = ref(0);
const selectedProp = ref<Property | null>(null);
const newPrice = ref(0);
const newOpType = ref('');
const selectedOwnerId = ref('');

const activeAgents = computed(() =>
  allUsers.value.filter(
    (u) =>
      (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') &&
      u.status === 'ACTIVE'
  )
);
const availableOwners = computed(() =>
  allUsers.value.filter((u) => u.userType === 'OWNER' && u.status === 'ACTIVE')
);

const load = async () => {
  loading.value = true;
  try {
    const filters: Record<string, unknown> = {};
    if (filterTitle.value) filters.title = filterTitle.value;
    if (filterOpType.value) filters.operationType = filterOpType.value;
    filters.page = currentPage.value;
    filters.pageSize = pageSize.value;

    const response = await api.get('/properties', { params: filters });
    allProperties.value =
      response.data?.data || response.data?.content || response.data || [];
    totalPages.value = response.data?.totalPages || 0;

    if (allUsers.value.length === 0) {
      const users = await userService.getUsers();
      allUsers.value = users || [];
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => {
  currentPage.value = page;
  load();
};

const resetAndLoad = () => {
  currentPage.value = 0;
  load();
};

const handleFilterDebounce = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(resetAndLoad, 500);
};

const clearAllFilters = () => {
  filterTitle.value = '';
  filterOpType.value = '';
  pageSize.value = 9;
  resetAndLoad();
};

const getOpTypeBadge = (
  type: string | undefined
): 'indigo' | 'green' | 'yellow' | 'dark' => {
  if (type === 'VENTA') return 'indigo';
  if (type === 'ALQUILER') return 'green';
  if (type === 'ANTICRETICO') return 'yellow';
  return 'dark';
};

const viewDetails = (p: Property) => {
  selectedProp.value = { ...p };
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedProp.value = null;
};

const handleStatusUpdated = async () => {
  await load();
  if (selectedProp.value) {
    const propId = selectedProp.value.id;
    const updatedProperty = allProperties.value.find((p) => p.id === propId);
    if (updatedProperty) {
      selectedProp.value = { ...updatedProperty };
    }
  }
};

const resolveAgentName = (id: string | null) => {
  if (!id) return 'Sin asignar';
  const u = allUsers.value.find((x) => x.id === id);
  return u ? u.fullName : 'Agente Desconocido';
};

const getOwnerName = (ownerId?: string) => {
  if (!ownerId) return null;
  const owner = allUsers.value.find((u) => u.id === ownerId);
  return owner?.fullName || owner?.firstName + ' ' + owner?.lastName || ownerId;
};

const openCreateModal = () => {
  editingProperty.value = null;
  isEditing.value = false;
  formKey.value++;
  showCreateEditModal.value = true;
};

const openEditModal = (property: Property) => {
  editingProperty.value = { ...property } as Record<string, unknown>;
  isEditing.value = true;
  formKey.value++;
  showCreateEditModal.value = true;
};

const closeCreateEditModal = () => {
  showCreateEditModal.value = false;
  editingProperty.value = null;
};

const handleCreateEdit = async (data: PropertyFormPayload) => {
  try {
    if (isEditing.value && editingProperty.value) {
      const updatePayload = {
        title: data.title,
        address: data.address,
        type: data.type,
        m2: data.m2,
        rooms: data.rooms,
        price: data.price,
        operationType: data.operationType,
        ownerId: data.ownerId || null,
      };

      console.log('Actualizando propiedad con payload:', updatePayload);
      await propertyService.updateProperty(
        editingProperty.value.id as string,
        updatePayload
      );
      alert('Propiedad actualizada con éxito');
    } else {
      await propertyService.createProperty(data);
      alert('Inmueble registrado con éxito');
    }
    closeCreateEditModal();
    await load();
  } catch {
    console.error('Error saving property');
    alert('Error: Error desconocido');
  }
};

const confirmDelete = (property: Property) => {
  propertyToDelete.value = property;
  showDeleteModal.value = true;
};

const doDeleteProperty = async () => {
  if (!propertyToDelete.value) return;

  deleting.value = true;
  try {
    await api.delete(`/properties/${propertyToDelete.value.id}`);
    showDeleteModal.value = false;
    await load();
  } finally {
    deleting.value = false;
  }
};

const handleImageError = (event: Event) => {
  (event.target as HTMLImageElement).style.display = 'none';
};

const prepAssignment = (p: Property) => {
  selectedProp.value = p;
  showAssignModal.value = true;
};
const prepOwnerAssignment = (p: Property) => {
  selectedProp.value = p;
  selectedOwnerId.value = p.ownerId || '';
  showOwnerModal.value = true;
};
const prepPriceUpdate = (p: Property) => {
  selectedProp.value = p;
  newPrice.value = p.price || 0;
  showPriceModal.value = true;
};
const prepOpTypeUpdate = (p: Property) => {
  selectedProp.value = p;
  newOpType.value = p.operationType || 'VENTA';
  showOpTypeModal.value = true;
};

const doPriceUpdate = async () => {
  if (!selectedProp.value) return;

  await propertyService.updatePrice(selectedProp.value.id, newPrice.value);
  showPriceModal.value = false;
  await load();
};

const doAssignOwner = async () => {
  if (!selectedProp.value) return;

  await propertyService.assignOwner(selectedProp.value.id, {
    ownerId: selectedOwnerId.value,
  });
  showOwnerModal.value = false;
  await load();
};

const doOpTypeUpdate = async () => {
  if (!selectedProp.value) return;

  await api.patch(`/properties/${selectedProp.value.id}/operation-type`, {
    operationType: newOpType.value,
  });
  showOpTypeModal.value = false;
  await load();
};

const doAssign = async (agentId: string) => {
  if (!selectedProp.value) return;

  await propertyService.assignAgent(selectedProp.value.id, { agentId });
  showAssignModal.value = false;
  await load();
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'DISPONIBLE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'RESERVADO':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'VENDIDO':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'EN_NEGOCIACION':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
  }
};

onMounted(load);
</script>
