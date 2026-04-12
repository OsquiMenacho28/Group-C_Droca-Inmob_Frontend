<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">Mis Inmuebles</h1>
        <p class="text-gray-500 text-sm">
          Gestiona y filtra tus propiedades asignadas
        </p>
      </div>
      <fwb-button @click="openCreateModal" gradient="blue">
        <div class="flex items-center">
          <IconLucidePlus class="w-4 h-4 mr-2" />
          Registrar Nuevo
        </div>
      </fwb-button>
    </div>

    <div
      class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label
            class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-wider"
            >Buscar por título</label
          >
          <fwb-input
            v-model="filterTitle"
            placeholder="Ej: Departamento..."
            @input="handleFilterDebounce"
          />
        </div>
        <div>
          <label
            class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-wider"
            >Tipo de Operación</label
          >
          <select
            v-model="filterOpType"
            @change="resetAndLoad"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="VENTA">Venta</option>
            <option value="ALQUILER">Alquiler</option>
            <option value="ANTICRETICO">Anticrético</option>
          </select>
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase"
            >Mostrar</label
          >
          <select
            v-model="pageSize"
            @change="resetAndLoad"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
          >
            <option :value="6">6 elementos</option>
            <option :value="12">12 elementos</option>
            <option :value="24">24 elementos</option>
          </select>
        </div>
        <div class="flex justify-end">
          <fwb-button color="alternative" size="sm" @click="clearAllFilters"
            >Limpiar Filtros</fwb-button
          >
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10 dark:text-white">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500">Cargando tus propiedades...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <fwb-card
        v-for="p in myProperties"
        :key="p.id"
        class="flex flex-col h-full overflow-hidden border-gray-200 dark:border-gray-700 relative"
      >
        <div class="absolute top-2 right-2 z-10 flex gap-1">
          <button
            @click="openEditModal(p)"
            class="bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors shadow-lg"
            title="Editar propiedad"
          >
            <IconLucidePencil class="w-4 h-4" />
          </button>

          <button
            @click="viewDetails(p)"
            class="bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 rounded-full p-1.5 hover:text-blue-600 shadow-lg transition-all"
            title="Ver detalles e historial"
          >
            <IconLucideClipboardList class="w-4 h-4" />
          </button>

          <button
            v-if="isAdmin"
            @click="confirmDelete(p)"
            class="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-lg"
            title="Eliminar propiedad"
          >
            <IconLucideTrash class="w-4 h-4" />
          </button>
        </div>

        <div
          class="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400"
        >
          <img
            v-if="p.imageUrls?.length"
            :src="p.imageUrls[0]"
            class="h-full w-full object-cover"
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
          <div class="flex gap-2 mb-3">
            <fwb-badge :type="getOpTypeBadge(p.operationType)">{{
              p.operationType
            }}</fwb-badge>
            <fwb-badge type="dark">{{ p.type }}</fwb-badge>
          </div>

          <h5 class="text-xl font-bold dark:text-white mb-1">{{ p.title }}</h5>
          <p class="text-sm text-gray-500 mb-4">{{ p.address }}</p>

          <div class="mt-auto">
            <p class="text-2xl font-black text-blue-600">
              ${{ p.price.toLocaleString() }}
            </p>

            <div
              class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700"
            >
              <document-upload
                :property-id="p.id"
                :agent-id="p.assignedAgentId || undefined"
              />
            </div>
          </div>
        </div>
      </fwb-card>
    </div>

    <div
      v-if="!loading && myProperties.length === 0"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <p class="text-gray-500">
        No tienes inmuebles que coincidan con la búsqueda.
      </p>
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

    <fwb-modal
      v-if="showCreateEditModal"
      @close="closeCreateEditModal"
      size="2xl"
    >
      <template #header>
        <div class="text-lg font-bold">
          {{ isEditing ? 'Editar Propiedad' : 'Nuevo Inmueble' }}
        </div>
      </template>
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

    <fwb-modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <div class="text-lg font-bold text-red-600">Confirmar Eliminación</div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p>
            ¿Estás seguro de que deseas eliminar la propiedad
            <strong>{{ propertyToDelete?.title }}</strong
            >?
          </p>
          <p class="text-sm text-red-500">
            Esta acción eliminará permanentemente la propiedad, sus imágenes y
            documentos asociados. No se puede deshacer.
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <fwb-button color="alternative" @click="showDeleteModal = false"
            >Cancelar</fwb-button
          >
          <fwb-button
            color="red"
            @click="doDeleteProperty"
            :disabled="deleting"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar Permanentemente' }}
          </fwb-button>
        </div>
      </template>
    </fwb-modal>

    <property-details-modal
      v-if="showDetailsModal"
      :show="showDetailsModal"
      :property="selectedProp"
      @close="showDetailsModal = false"
      @status-updated="load"
    />
  </div>
</template>

<script setup lang="ts">
import IconLucidePlus from '~icons/lucide/plus';
import IconLucidePencil from '~icons/lucide/pencil';
import IconLucideClipboardList from '~icons/lucide/clipboard-list';
import IconLucideTrash from '~icons/lucide/trash';
import { ref, onMounted, computed } from 'vue';
import { FwbCard, FwbButton, FwbModal, FwbInput, FwbBadge } from 'flowbite-vue';
import { propertyService } from '@/services/propertyService';
import { useAuth } from '@/composables/useAuth';
import { api } from '@/services/api';
import type { Property, PropertyFormPayload } from '@/types/property';
import PropertyForm from '@/components/properties/PropertyForm.vue';
import DocumentUpload from '@/components/properties/DocumentUpload.vue';
import PropertyDetailsModal from '@/components/properties/PropertyDetailsModal.vue';
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  error?: string;
  message?: string;
  detail?: string;
}

const { user } = useAuth();
const myProperties = ref<Property[]>([]);
const loading = ref(false);
const deleting = ref(false);
const showCreateEditModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const editingProperty = ref<Record<string, unknown> | null>(null);
const propertyToDelete = ref<Property | null>(null);
const formKey = ref(0);
const showDetailsModal = ref(false);
const selectedProp = ref<Property | null>(null);
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = ref(6);

const filterTitle = ref('');
const filterOpType = ref('');
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const isAdmin = computed(() => {
  const roles = (user.value?.roles || []) as string[];
  return roles.includes('ADMIN') || user.value?.userType === 'ADMIN';
});

const load = async () => {
  loading.value = true;
  try {
    const agentId = user.value?.userId || user.value?.sub;
    const response = await api.get('/properties', {
      params: {
        title: filterTitle.value || undefined,
        operationType: filterOpType.value || undefined,
        agentId: agentId,
        page: currentPage.value,
        pageSize: pageSize.value || undefined,
      },
    });
    myProperties.value = response.data.data || response.data;
    totalPages.value = response.data.totalPages || 0;
  } catch (e) {
    console.error('Error cargando inventario:', e);
  } finally {
    loading.value = false;
  }
};

const changePage = (p: number) => {
  currentPage.value = p;
  load();
};

const resetAndLoad = () => {
  currentPage.value = 0;
  load();
};

const handleFilterDebounce = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(resetAndLoad, 500);
};

const clearAllFilters = () => {
  filterTitle.value = '';
  filterOpType.value = '';
  pageSize.value = 6;
  resetAndLoad();
};

const getOpTypeBadge = (type: string) => {
  switch (type) {
    case 'VENTA':
      return 'indigo';
    case 'ALQUILER':
      return 'green';
    case 'ANTICRETICO':
      return 'yellow';
    default:
      return 'dark';
  }
};

const openEditModal = (property: Property) => {
  editingProperty.value = { ...property } as Record<string, unknown>;
  isEditing.value = true;
  formKey.value++;
  showCreateEditModal.value = true;
};

const openCreateModal = () => {
  editingProperty.value = null;
  isEditing.value = false;
  formKey.value++;
  showCreateEditModal.value = true;
};

const closeCreateEditModal = () => {
  showCreateEditModal.value = false;
  editingProperty.value = null;
};

const handleCreateEdit = async (data: unknown) => {
  try {
    if (isEditing.value && editingProperty.value) {
      const updatePayload = {
        title: (data as Record<string, unknown>).title as string,
        address: (data as Record<string, unknown>).address as string,
        type: (data as Record<string, unknown>).type as string,
        m2: (data as Record<string, unknown>).m2 as number,
        rooms: (data as Record<string, unknown>).rooms as number,
        operationType: (data as Record<string, unknown>)
          .operationType as string,
        ownerId: ((data as Record<string, unknown>).ownerId as string) || null,
      };

      await propertyService.updatePropertyAsAgent(
        editingProperty.value.id as string,
        updatePayload
      );
      alert('Propiedad actualizada con éxito');
    } else {
      const payload = data as PropertyFormPayload;
      await propertyService.createProperty(payload);
      alert('Inmueble registrado con éxito');
    }
    closeCreateEditModal();
    await load();
  } catch (e: unknown) {
    const axiosError = e as AxiosError<ApiErrorResponse>;
    console.error('Error saving property:', e);
    alert(
      'Error: ' +
        (axiosError.response?.data?.detail ||
          axiosError.message ||
          'Error de conexión')
    );
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
    alert('Propiedad eliminada exitosamente');
  } catch (e: unknown) {
    const axiosError = e as AxiosError<ApiErrorResponse>;
    console.error('Error eliminando propiedad:', e);
    alert(
      axiosError.response?.data?.detail || 'Error al eliminar la propiedad'
    );
  } finally {
    deleting.value = false;
    propertyToDelete.value = null;
  }
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

const viewDetails = (p: Property) => {
  selectedProp.value = p;
  showDetailsModal.value = true;
};

onMounted(load);
</script>
