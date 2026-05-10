<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">{{ t('adminProperties.title') }}</h1>
        <p class="text-gray-500 text-sm dark:text-gray-400">{{ t('adminProperties.subtitle') }}</p>
      </div>
      <div class="flex items-center space-x-3">
        <fwb-badge type="indigo">{{ t('adminProperties.adminMode') }}</fwb-badge>
        <fwb-button @click="openCreateModal" gradient="blue">
          <div class="flex items-center">
            <IconLucidePlus class="w-4 h-4 mr-2" />
            {{ t('adminProperties.registerNew') }}
          </div>
        </fwb-button>
      </div>
    </div>

    <div
      class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase">
            {{ t('adminProperties.searchTitle') }}
          </label>
          <fwb-input
            v-model="filterTitle"
            :placeholder="t('clientProperties.titlePlaceholder')"
            @input="handleFilterDebounce"
          />
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase">
            {{ t('adminProperties.operationType') }}
          </label>
          <select
            v-model="filterOpType"
            @change="resetAndLoad"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
          >
            <option value="">{{ t('propertyForm.selectOption') }}</option>
            <option value="VENTA">{{ t('agentDashboard.sale') }}</option>
            <option value="ALQUILER">{{ t('agentDashboard.rent') }}</option>
            <option value="ANTICRETICO">{{ t('agentDashboard.anticretic') }}</option>
          </select>
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase">
            {{ t('common.status') }}
          </label>
          <select
            v-model="filterStatus"
            @change="resetAndLoad"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
          >
            <option value="">{{ t('auditLogs.actions.all') }}</option>
            <option value="DISPONIBLE">{{ t('status.DISPONIBLE') }}</option>
            <option value="RESERVADO">{{ t('status.RESERVADO') }}</option>
            <option value="VENDIDO">{{ t('status.VENDIDO') }}</option>
            <option value="EN_NEGOCIACION">{{ t('status.EN_NEGOCIACION') }}</option>
            <option value="ELIMINADO">{{ t('status.ELIMINADO') }}</option>
            <option value="RETIRADO">{{ t('status.RETIRADO') }}</option>
          </select>
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-wider">
            {{ t('adminProperties.itemsPerPage') }}
          </label>
          <select
            v-model="pageSize"
            @change="resetAndLoad"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
          >
            <option :value="10">{{ t('adminProperties.itemsCount', { n: 10 }) }}</option>
            <option :value="25">{{ t('adminProperties.itemsCount', { n: 25 }) }}</option>
            <option :value="50">{{ t('adminProperties.itemsCount', { n: 50 }) }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <fwb-button color="alternative" size="sm" @click="clearAllFilters" class="w-full">
            {{ t('adminProperties.clearFilters') }}
          </fwb-button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20 dark:text-white">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500">{{ t('adminProperties.loading') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <property-card
        v-for="p in allProperties"
        :key="p.id"
        :property="p"
        :owner-name="getOwnerName(p.ownerId) || undefined"
        :agent-name="resolveAgentName(p.assignedAgentId)"
        show-history-button
        @view-details="viewDetails"
        @open-zoom="viewDetails"
      >
        <template #actions-top="{ property, statusHelpers }">
          <button
            @click="openEditModal(property)"
            :disabled="statusHelpers.isSold.value || statusHelpers.isDeleted.value"
            class="bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :title="t('adminProperties.edit')"
          >
            <IconLucidePencil class="w-4 h-4" />
          </button>
          <button
            v-if="
              property.status !== 'RETIRADO' &&
              property.status !== 'VENDIDO' &&
              property.status !== 'ELIMINADO'
            "
            @click="openRetirementModal(property)"
            class="bg-orange-600 text-white rounded-full p-1.5 hover:bg-orange-700 shadow-lg transition-colors"
            :title="t('retirement.title')"
          >
            <IconLucideArchive class="w-4 h-4" />
          </button>
          <button
            @click="confirmDelete(property)"
            :disabled="statusHelpers.isSold.value || statusHelpers.isDeleted.value"
            class="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :title="t('adminProperties.delete')"
          >
            <IconLucideTrash class="w-4 h-4" />
          </button>
        </template>

        <template #documents="{ property }">
          <document-upload
            :property-id="property.id"
            :agent-id="property.assignedAgentId || undefined"
          />
        </template>

        <template #actions-bottom="{ property, statusHelpers }">
          <!-- Reincorporate for terminal states (YOUR FEATURE) -->
          <fwb-button
            v-if="statusHelpers.isMinimalInfo.value"
            size="sm"
            gradient="green"
            @click="prepReincorporate(property)"
            class="w-full shadow-lg"
          >
            <div class="flex items-center justify-center gap-2">
              <IconLucideRefreshCw class="w-4 h-4" />
              {{ t('propertyDetails.reincorporate') }}
            </div>
          </fwb-button>

          <!-- Standard Actions -->
          <template v-else>
            <fwb-button
              size="sm"
              color="alternative"
              @click="prepPriceUpdate(property)"
              class="flex-1"
            >
              {{ t('adminProperties.price') }}
            </fwb-button>
            <fwb-button
              size="sm"
              color="alternative"
              @click="prepOpTypeUpdate(property)"
              class="flex-1"
            >
              {{ t('adminProperties.operation') }}
            </fwb-button>
            <fwb-button size="sm" gradient="blue" @click="prepAssignment(property)" class="flex-1">
              {{ t('adminProperties.agent') }}
            </fwb-button>
            <fwb-button
              size="sm"
              gradient="purple"
              @click="prepOwnerAssignment(property)"
              class="flex-1"
            >
              {{ t('adminProperties.ownerLabel') }}
            </fwb-button>
            <fwb-button
              v-if="!statusHelpers.isSold.value"
              size="sm"
              gradient="green"
              @click="prepClosure(property)"
              class="w-full"
            >
              {{ t('adminProperties.registerClosure') }}
            </fwb-button>
          </template>
        </template>
      </property-card>
    </div>

    <div
      v-if="!loading && allProperties.length === 0"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <p class="text-secondary">{{ t('adminProperties.noProperties') }}</p>
    </div>

    <Pagination
      v-if="!loading && totalPages > 1"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-pages="totalPages"
      :total="totalItems"
      @change="load"
    />

    <!-- Modales -->
    <property-details-modal
      v-if="showDetailsModal"
      :show="showDetailsModal"
      :property="selectedProp"
      :is-client-view="false"
      @close="closeDetailsModal"
      @status-updated="handleStatusUpdated"
    />

    <PropertyFormModal
      v-model="showCreateEditModal"
      :is-editing="isEditing"
      :initial-data="editingProperty || undefined"
      :property-id="(editingProperty?.id as string) || undefined"
      :form-key="formKey"
      @location-updated="handleLocalLocationUpdate"
      @submit="handleCreateEdit"
    />

    <assign-agent-modal
      v-if="showAssignModal"
      :show="showAssignModal"
      :property="selectedProp"
      :agents="activeAgents"
      @confirm="doAssign"
      @close="showAssignModal = false"
    />

    <fwb-modal v-if="showOwnerModal" @close="showOwnerModal = false">
      <template #header>
        <div class="text-lg font-bold dark:text-white">{{ t('adminProperties.assignOwner') }}</div>
      </template>
      <template #body>
        <select
          v-model="selectedOwnerId"
          class="w-full border rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option value="">{{ t('adminProperties.selectOwner') }}</option>
          <option v-for="o in availableOwners" :key="o.id" :value="o.id">
            {{ o.fullName }}
          </option>
        </select>
      </template>
      <template #footer>
        <fwb-button @click="doAssignOwner" gradient="blue">
          {{ t('adminProperties.assign') }}
        </fwb-button>
      </template>
    </fwb-modal>

    <fwb-modal v-if="showPriceModal" @close="showPriceModal = false">
      <template #header>
        <div class="text-lg font-bold dark:text-white">{{ t('adminProperties.modifyPrice') }}</div>
      </template>
      <template #body>
        <fwb-input
          v-model.number="newPrice"
          type="number"
          :label="t('adminProperties.price') + ' ($)'"
          required
        />
      </template>
      <template #footer>
        <fwb-button color="alternative" @click="showPriceModal = false">
          {{ t('common.cancel') }}
        </fwb-button>
        <fwb-button @click="doPriceUpdate" gradient="blue">
          {{ t('adminProperties.confirm') }}
        </fwb-button>
      </template>
    </fwb-modal>

    <fwb-modal v-if="showOpTypeModal" @close="showOpTypeModal = false">
      <template #header>
        <div class="text-lg font-bold dark:text-white">
          {{ t('adminProperties.changeOperation') }}
        </div>
      </template>
      <template #body>
        <select
          v-model="newOpType"
          class="w-full border rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option value="VENTA">{{ t('agentDashboard.sale') }}</option>
          <option value="ALQUILER">{{ t('agentDashboard.rent') }}</option>
          <option value="ANTICRETICO">{{ t('agentDashboard.anticretic') }}</option>
        </select>
      </template>
      <template #footer>
        <fwb-button @click="doOpTypeUpdate" gradient="blue">{{ t('common.save') }}</fwb-button>
      </template>
    </fwb-modal>

    <fwb-modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <div class="text-lg font-bold text-red-600">{{ t('adminProperties.deleteProperty') }}</div>
      </template>
      <template #body>
        <p class="dark:text-gray-300">
          {{ t('agentDashboard.confirmDeleteText', { name: propertyToDelete?.title || '' }) }}
        </p>
        <p class="text-sm text-red-500 mt-2">{{ deleteWarningText }}</p>
      </template>
      <template #footer>
        <fwb-button color="alternative" @click="showDeleteModal = false">
          {{ t('common.cancel') }}
        </fwb-button>
        <fwb-button color="red" @click="doDeleteProperty" :disabled="deleting">
          {{ deleting ? t('adminProperties.deleting') : t('common.delete') }}
        </fwb-button>
      </template>
    </fwb-modal>

    <closure-modal
      v-if="showClosureModal"
      :show="showClosureModal"
      :property="selectedProp!"
      @close="showClosureModal = false"
      @success="handleClosureSuccess"
    />

    <!-- Retirement Modal (FROM INCOMING - reason tracking) -->
    <RetirementModal
      :show="showRetirementModal"
      :property-id="propertyToRetire?.id || ''"
      :property-title="propertyToRetire?.title || ''"
      @close="showRetirementModal = false"
      @success="handleRetirementSuccess"
    />

    <!-- Confirm Modal for Reincorporate (YOUR FEATURE) -->
    <ConfirmModal
      :show="showReincorporateConfirm"
      :title="t('propertyDetails.reincorporateConfirmTitle')"
      :message="reincorporateConfirmMessage"
      type="question"
      @confirm="handleReincorporate"
      @close="showReincorporateConfirm = false"
    />

    <AppToast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup lang="ts">
  import IconLucidePlus from '~icons/lucide/plus';
  import IconLucidePencil from '~icons/lucide/pencil';
  import IconLucideTrash from '~icons/lucide/trash';
  import IconLucideArchive from '~icons/lucide/archive';
  import IconLucideRefreshCw from '~icons/lucide/refresh-cw';
  import { ref, onMounted, computed, watch, reactive } from 'vue';
  import { FwbButton, FwbModal, FwbInput, FwbBadge } from 'flowbite-vue';
  import { propertyService } from '@/modules/properties';
  import { userService } from '@/services/userService';
  import { apiClient as api } from '@/api';
  import { useI18n } from 'vue-i18n';
  import AssignAgentModal from '@/components/properties/AssignAgentModal.vue';
  import PropertyFormModal from '@/components/properties/PropertyFormModal.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import DocumentUpload from '@/components/properties/DocumentUpload.vue';
  import PropertyDetailsModal from '@/components/properties/PropertyDetailsModal.vue';
  import ClosureModal from '@/components/operations/ClosureModal.vue';
  import RetirementModal from '@/components/properties/RetirementModal.vue';
  import ConfirmModal from '@/components/ui/ConfirmModal.vue';
  import PropertyCard from '@/components/properties/PropertyCard.vue';
  import type { Property, PropertyFormPayload } from '@/types/property';
  import AppToast from '@/components/ui/AppToast.vue';
  import { handleApiError } from '@/api/errorHandler';

  const { t } = useI18n();

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
  const totalItems = ref(0);
  const currentPage = ref(0);
  const pageSize = ref(10);
  const deleting = ref(false);
  const filterTitle = ref('');
  const filterOpType = ref('');
  const filterStatus = ref('');

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const showCreateEditModal = ref(false);
  const showAssignModal = ref(false);
  const showPriceModal = ref(false);
  const showOpTypeModal = ref(false);
  const showOwnerModal = ref(false);
  const showDeleteModal = ref(false);
  const showDetailsModal = ref(false);
  const showClosureModal = ref(false);
  const showRetirementModal = ref(false);
  const showReincorporateConfirm = ref(false);

  const isEditing = ref(false);
  const editingProperty = ref<Record<string, unknown> | null>(null);
  const propertyToDelete = ref<Property | null>(null);
  const propertyToRetire = ref<Property | null>(null);
  const formKey = ref(0);
  const selectedProp = ref<Property | null>(null);
  const newPrice = ref(0);
  const newOpType = ref('');
  const selectedOwnerId = ref('');

  const deleteWarningText = computed(() => t('agentDashboard.deleteWarning'));

  const toast = reactive({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  const reincorporateConfirmMessage = computed(() =>
    selectedProp.value?.status === 'VENDIDO'
      ? t('propertyDetails.reincorporateSoldConfirmMessage')
      : t('propertyDetails.reincorporateConfirmMessage')
  );

  const activeAgents = computed(() =>
    allUsers.value.filter(
      (u) => (u.userType === 'EMPLOYEE' || u.userType === 'ADMIN') && u.status === 'ACTIVE'
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
      if (filterStatus.value) filters.status = filterStatus.value;
      filters.page = currentPage.value;
      filters.pageSize = pageSize.value;

      const response = await api.get('/properties', { params: filters });
      const apiRes = response.data;
      allProperties.value = apiRes.data || [];
      const meta = apiRes.meta;
      totalItems.value = meta?.total || 0;
      const limit = meta?.limit || pageSize.value || 1;
      totalPages.value = Math.ceil(totalItems.value / limit);

      if (allUsers.value.length === 0) {
        const res = await userService.getUsers(0, 1000);
        allUsers.value = res.data || [];
      }
    } catch (error) {
      console.error(t('common.error') + ':', error);
    } finally {
      loading.value = false;
    }
  };

  watch(pageSize, () => {
    resetAndLoad();
  });

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
    filterStatus.value = '';
    pageSize.value = 10;
    resetAndLoad();
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
    if (!id) return t('adminProperties.notAssigned');
    const u = allUsers.value.find((x) => x.id === id);
    return u ? u.fullName : t('adminProperties.notAssigned');
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
    if (property.status === 'ELIMINADO') {
      toast.message = 'No se puede editar una propiedad eliminada. Reincorpórala primero.';
      toast.type = 'error';
      toast.show = true;
      return;
    }
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
        await propertyService.updateProperty(editingProperty.value.id as string, data);
        toast.message = t('adminProperties.propertyUpdated');
        toast.type = 'success';
        toast.show = true;
      } else {
        await propertyService.createProperty(data);
        toast.message = t('adminProperties.propertyCreated');
        toast.type = 'success';
        toast.show = true;
      }
      closeCreateEditModal();
      await load();
    } catch {
      toast.message = t('common.error');
      toast.type = 'error';
      toast.show = true;
    }
  };

  const confirmDelete = (property: Property) => {
    if (property.status === 'ELIMINADO') {
      toast.message = 'Esta propiedad ya está eliminada.';
      toast.type = 'error';
      toast.show = true;
      return;
    }
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
      toast.message = t('common.success');
      toast.type = 'success';
      toast.show = true;
    } catch {
      toast.message = t('common.error');
      toast.type = 'error';
      toast.show = true;
    } finally {
      deleting.value = false;
    }
  };

  const openRetirementModal = (property: Property) => {
    propertyToRetire.value = property;
    showRetirementModal.value = true;
  };

  const handleRetirementSuccess = async () => {
    await load();
    showRetirementModal.value = false;
    propertyToRetire.value = null;
    toast.message = t('retirement.success');
    toast.type = 'success';
    toast.show = true;
  };

  const prepAssignment = (p: Property) => {
    if (p.status === 'ELIMINADO') {
      toast.message = 'No se puede asignar agente a una propiedad eliminada.';
      toast.type = 'error';
      toast.show = true;
      return;
    }
    selectedProp.value = p;
    showAssignModal.value = true;
  };

  const prepOwnerAssignment = (p: Property) => {
    if (p.status === 'ELIMINADO') {
      toast.message = 'No se puede asignar propietario a una propiedad eliminada.';
      toast.type = 'error';
      toast.show = true;
      return;
    }
    selectedProp.value = p;
    selectedOwnerId.value = p.ownerId || '';
    showOwnerModal.value = true;
  };

  const prepPriceUpdate = (p: Property) => {
    if (p.status === 'ELIMINADO') {
      toast.message = 'No se puede modificar el precio de una propiedad eliminada.';
      toast.type = 'error';
      toast.show = true;
      return;
    }
    selectedProp.value = p;
    newPrice.value = p.price || 0;
    showPriceModal.value = true;
  };

  const prepOpTypeUpdate = (p: Property) => {
    if (p.status === 'ELIMINADO') {
      toast.message = 'No se puede modificar el tipo de operación de una propiedad eliminada.';
      toast.type = 'error';
      toast.show = true;
      return;
    }
    selectedProp.value = p;
    newOpType.value = p.operationType || 'VENTA';
    showOpTypeModal.value = true;
  };

  const doPriceUpdate = async () => {
    if (!selectedProp.value) return;
    try {
      await propertyService.updatePrice(selectedProp.value.id, newPrice.value);
      showPriceModal.value = false;
      await load();
      toast.message = t('common.success');
      toast.type = 'success';
      toast.show = true;
    } catch {
      toast.message = t('common.error');
      toast.type = 'error';
      toast.show = true;
    }
  };

  const doAssignOwner = async () => {
    if (!selectedProp.value) return;
    try {
      await propertyService.assignOwner(selectedProp.value.id, { ownerId: selectedOwnerId.value });
      showOwnerModal.value = false;
      await load();
      toast.message = t('common.success');
      toast.type = 'success';
      toast.show = true;
    } catch {
      toast.message = t('common.error');
      toast.type = 'error';
      toast.show = true;
    }
  };

  const doOpTypeUpdate = async () => {
    if (!selectedProp.value) return;
    try {
      await api.patch(`/properties/${selectedProp.value.id}/operation-type`, {
        operationType: newOpType.value,
      });
      showOpTypeModal.value = false;
      await load();
      toast.message = t('common.success');
      toast.type = 'success';
      toast.show = true;
    } catch {
      toast.message = t('common.error');
      toast.type = 'error';
      toast.show = true;
    }
  };

  const doAssign = async (agentId: string) => {
    if (!selectedProp.value) return;
    try {
      await propertyService.assignAgent(selectedProp.value.id, { agentId });
      showAssignModal.value = false;
      await load();
      toast.message = t('common.success');
      toast.type = 'success';
      toast.show = true;
    } catch {
      toast.message = t('common.error');
      toast.type = 'error';
      toast.show = true;
    }
  };

  const prepClosure = (p: Property) => {
    if (p.status === 'ELIMINADO' || p.status === 'RETIRADO') {
      toast.message = 'No se puede registrar cierre de una propiedad eliminada o retirada.';
      toast.type = 'error';
      toast.show = true;
      return;
    }
    selectedProp.value = p;
    showClosureModal.value = true;
  };

  const handleClosureSuccess = async () => {
    toast.message = t('adminProperties.closureSuccess');
    toast.type = 'success';
    toast.show = true;
    showClosureModal.value = false;
    await load();
  };

  const handleLocalLocationUpdate = (updatedProp: Property) => {
    const index = allProperties.value.findIndex((p) => p.id === updatedProp.id);
    if (index !== -1) {
      allProperties.value[index] = { ...allProperties.value[index], ...updatedProp };
      if (selectedProp.value && selectedProp.value.id === updatedProp.id) {
        selectedProp.value = { ...updatedProp };
      }
    }
  };

  const prepReincorporate = (p: Property) => {
    selectedProp.value = p;
    showReincorporateConfirm.value = true;
  };

  const handleReincorporate = async () => {
    if (!selectedProp.value) return;

    loading.value = true;
    showReincorporateConfirm.value = false;

    try {
      const updatedProperty = await propertyService.reincorporateProperty(selectedProp.value.id);

      const index = allProperties.value.findIndex((p) => p.id === updatedProperty.id);
      if (index !== -1) {
        allProperties.value[index] = updatedProperty;
      }

      toast.message = t('propertyDetails.reincorporateSuccess');
      toast.type = 'success';
      toast.show = true;

      await load();
    } catch (error: unknown) {
      const appError = handleApiError(error);
      toast.message = appError.message;
      toast.type = 'error';
      toast.show = true;
    } finally {
      loading.value = false;
      selectedProp.value = null;
    }
  };

  onMounted(async () => {
    await load();
    const state = window.history.state;
    if (state && state.cloneProperty) {
      const sourceData = state.cloneProperty;
      editingProperty.value = {
        ...sourceData,
        id: undefined,
      };
      isEditing.value = false;
      formKey.value++;
      showCreateEditModal.value = true;
    }
  });
</script>
