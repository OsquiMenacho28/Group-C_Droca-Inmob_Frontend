<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold dark:text-white">{{ t('agentDashboard.title') }}</h1>
        <p class="text-gray-500 text-sm dark:text-gray-400">{{ t('agentDashboard.subtitle') }}</p>
      </div>
      <fwb-button @click="openCreateModal" gradient="blue">
        <div class="flex items-center">
          <IconLucidePlus class="w-4 h-4 mr-2" />
          {{ t('agentDashboard.registerNew') }}
        </div>
      </fwb-button>
    </div>

    <!-- Inventory metrics indicator -->
    <InventoryMetricsCard />

    <div
      class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-wider">
            {{ t('agentDashboard.searchTitle') }}
          </label>
          <fwb-input
            v-model="filterTitle"
            :placeholder="t('clientProperties.titlePlaceholder')"
            @input="handleFilterDebounce"
          />
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-wider">
            {{ t('agentDashboard.operationType') }}
          </label>
          <select
            v-model="filterOpType"
            @change="resetAndLoad"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
          >
            <option value="">--</option>
            <option value="VENTA">{{ t('agentDashboard.sale') }}</option>
            <option value="ALQUILER">{{ t('agentDashboard.rent') }}</option>
            <option value="ANTICRETICO">{{ t('agentDashboard.anticretic') }}</option>
          </select>
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-wider">
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
            <option value="RETIRADO">{{ t('status.RETIRADO') }}</option>
          </select>
        </div>
        <div>
          <label class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-wider">
            {{ t('agentDashboard.show') }}
          </label>
          <select
            v-model="pageSize"
            @change="resetAndLoad"
            class="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
          >
            <option :value="6">{{ t('agentDashboard.itemsCount', { n: 6 }) }}</option>
            <option :value="12">{{ t('agentDashboard.itemsCount', { n: 12 }) }}</option>
            <option :value="24">{{ t('agentDashboard.itemsCount', { n: 24 }) }}</option>
          </select>
        </div>
        <div class="flex justify-end">
          <fwb-button color="alternative" size="sm" @click="clearAllFilters" class="w-full">
            {{ t('agentDashboard.clearFilters') }}
          </fwb-button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10 dark:text-white">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"
      ></div>
      <p class="mt-2 text-gray-500">{{ t('agentDashboard.loading') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <property-card
        v-for="p in myProperties"
        :key="p.id"
        :property="p"
        :agent-name="p.agentName"
        show-history-button
        @view-details="viewDetails"
        @open-zoom="viewDetails"
      >
        <template #actions-top="{ property, statusHelpers }">
          <button
            @click="openEditModal(property)"
            :disabled="statusHelpers.isSold.value"
            class="bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            :title="t('agentDashboard.editProperty')"
          >
            <IconLucidePencil class="w-4 h-4" />
          </button>

          <!-- Retirement button (FROM INCOMING) -->
          <button
            v-if="
              property.status !== 'RETIRADO' &&
              property.status !== 'VENDIDO' &&
              property.status !== 'ELIMINADO'
            "
            @click="openRetirementModal(property)"
            class="bg-orange-600 text-white rounded-full p-1.5 hover:bg-orange-700 transition-colors shadow-lg"
            :title="t('retirement.title')"
          >
            <IconLucideArchive class="w-4 h-4" />
          </button>

          <button
            v-if="isAdmin"
            @click="confirmDelete(property)"
            :disabled="statusHelpers.isSold.value"
            class="bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            :title="t('common.delete')"
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
          <!-- Reincorporate button (YOUR FEATURE) -->
          <fwb-button
            v-if="statusHelpers.isMinimalInfo.value && isAdmin"
            size="sm"
            gradient="green"
            class="w-full shadow-lg"
            @click="prepReincorporate(property)"
          >
            <div class="flex items-center justify-center gap-2">
              <IconLucideRefreshCw class="w-4 h-4" />
              {{ t('propertyDetails.reincorporate') }}
            </div>
          </fwb-button>
          <fwb-button
            v-else-if="!statusHelpers.isSold.value"
            size="sm"
            gradient="green"
            class="w-full"
            @click="prepClosure(property)"
          >
            {{ t('adminProperties.registerClosure') }}
          </fwb-button>
        </template>
      </property-card>
    </div>

    <div
      v-if="!loading && myProperties.length === 0"
      class="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <p class="text-gray-500">{{ t('agentDashboard.noResults') }}</p>
    </div>

    <Pagination
      v-if="!loading && totalPages > 1"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-pages="totalPages"
      :total="totalItems"
      @change="load"
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

    <fwb-modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #header>
        <div class="text-lg font-bold text-red-600">{{ t('agentDashboard.confirmDelete') }}</div>
      </template>
      <template #body>
        <div class="space-y-4">
          <p>
            {{ t('agentDashboard.confirmDeleteText', { name: propertyToDelete?.title }) }}
          </p>
          <p class="text-sm text-red-500">{{ deleteWarningText }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <fwb-button color="alternative" @click="showDeleteModal = false">
            {{ t('common.cancel') }}
          </fwb-button>
          <fwb-button color="red" @click="doDeleteProperty" :disabled="deleting">
            {{ deleting ? t('agentDashboard.deleting') : t('agentDashboard.deletePermanently') }}
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

    <!-- Global Toast -->
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
  import InventoryMetricsCard from '@/components/properties/InventoryMetricsCard.vue';
  import IconLucideTrash from '~icons/lucide/trash';
  import IconLucideArchive from '~icons/lucide/archive';
  import IconLucideRefreshCw from '~icons/lucide/refresh-cw';
  import { ref, onMounted, computed, reactive } from 'vue';
  import { FwbButton, FwbModal, FwbInput } from 'flowbite-vue';
  import { propertyService } from '@/modules/properties';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { apiClient as api } from '@/api';
  import type { ApiResponse } from '@/api/types';
  import type { Property, PropertyFormPayload, OperationType } from '@/types/property';
  import PropertyFormModal from '@/components/properties/PropertyFormModal.vue';
  import DocumentUpload from '@/components/properties/DocumentUpload.vue';
  import PropertyDetailsModal from '@/components/properties/PropertyDetailsModal.vue';
  import ClosureModal from '@/components/operations/ClosureModal.vue';
  import RetirementModal from '@/components/properties/RetirementModal.vue';
  import ConfirmModal from '@/components/ui/ConfirmModal.vue';
  import Pagination from '@/components/ui/Pagination.vue';
  import PropertyCard from '@/components/properties/PropertyCard.vue';
  import type { AxiosError } from 'axios';
  import { useI18n } from 'vue-i18n';
  import AppToast from '@/components/ui/AppToast.vue';
  import { handleApiError } from '@/api/errorHandler';

  interface ApiErrorResponse {
    error?: string;
    message?: string;
    detail?: string;
  }

  const { t } = useI18n();
  const authStore = useAuthStore();
  const myProperties = ref<Property[]>([]);
  const loading = ref(false);
  const deleting = ref(false);
  const showCreateEditModal = ref(false);
  const showDeleteModal = ref(false);
  const showClosureModal = ref(false);
  const showRetirementModal = ref(false);
  const showReincorporateConfirm = ref(false);
  const isEditing = ref(false);
  const editingProperty = ref<Record<string, unknown> | null>(null);
  const propertyToDelete = ref<Property | null>(null);
  const propertyToRetire = ref<Property | null>(null);
  const formKey = ref(0);
  const showDetailsModal = ref(false);
  const selectedProp = ref<Property | null>(null);
  const currentPage = ref(0);
  const totalPages = ref(0);
  const totalItems = ref(0);
  const pageSize = ref(6);

  const filterTitle = ref('');
  const filterOpType = ref('');
  const filterStatus = ref('');
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // UI States
  const toast = reactive({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  const isAdmin = computed(() => {
    const u = authStore.user as UserClaims | null;
    const roles = (u?.roles || []) as string[];
    return roles.includes('ADMIN') || u?.userType === 'ADMIN';
  });

  const deleteWarningText = computed(() => t('agentDashboard.deleteWarning'));

  const load = async () => {
    loading.value = true;
    try {
      const u = authStore.user as UserClaims | null;
      const agentId = u?.userId || u?.sub;
      const response = await api.get<ApiResponse<Property[]>>('/properties', {
        params: {
          title: filterTitle.value || undefined,
          operationType: filterOpType.value || undefined,
          status: filterStatus.value || undefined,
          agentId: agentId,
          page: currentPage.value,
          pageSize: pageSize.value || undefined,
        },
      });
      const apiRes = response.data;
      myProperties.value = apiRes.data || [];

      const meta = apiRes.meta;
      totalItems.value = meta?.total || 0;
      const limit = meta?.limit || pageSize.value || 1;
      totalPages.value = Math.ceil(totalItems.value / limit);
    } catch (e) {
      console.error(t('common.error') + ' ' + t('nav.myInmuebles').toLowerCase() + ':', e);
    } finally {
      loading.value = false;
    }
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
    filterStatus.value = '';
    pageSize.value = 6;
    resetAndLoad();
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
          zone: (data as Record<string, unknown>).zone as string,
          type: (data as Record<string, unknown>).type as string,
          m2: (data as Record<string, unknown>).m2 as number,
          rooms: (data as Record<string, unknown>).rooms as number,
          operationType: (data as Record<string, unknown>).operationType as OperationType,
          ownerId: ((data as Record<string, unknown>).ownerId as string) || null,
        };

        await propertyService.updatePropertyAsAgent(
          editingProperty.value.id as string,
          updatePayload
        );

        toast.message = t('agentDashboard.propertyUpdated');
        toast.type = 'success';
        toast.show = true;
      } else {
        const payload = data as PropertyFormPayload;
        await propertyService.createProperty(payload);

        toast.message = t('agentDashboard.propertyCreated');
        toast.type = 'success';
        toast.show = true;
      }
      closeCreateEditModal();
      await load();
    } catch (e: unknown) {
      const axiosError = e as AxiosError<ApiErrorResponse>;
      console.error(t('common.error') + ' saving property:', e);

      toast.message = axiosError.response?.data?.detail || axiosError.message || t('common.error');
      toast.type = 'error';
      toast.show = true;
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

      toast.message = t('common.success');
      toast.type = 'success';
      toast.show = true;
    } catch (e: unknown) {
      const axiosError = e as AxiosError<ApiErrorResponse>;
      console.error(t('common.error') + ' ' + t('common.delete').toLowerCase() + ' property:', e);

      toast.message = axiosError.response?.data?.detail || t('common.error');
      toast.type = 'error';
      toast.show = true;
    } finally {
      deleting.value = false;
      propertyToDelete.value = null;
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

  const viewDetails = (p: Property) => {
    selectedProp.value = p;
    showDetailsModal.value = true;
  };

  const prepClosure = (p: Property) => {
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

  const reincorporateConfirmMessage = computed(() =>
    selectedProp.value?.status === 'VENDIDO'
      ? t('propertyDetails.reincorporateSoldConfirmMessage')
      : t('propertyDetails.reincorporateConfirmMessage')
  );

  const prepReincorporate = (p: Property) => {
    selectedProp.value = p;
    showReincorporateConfirm.value = true;
  };

  const handleReincorporate = async () => {
    if (!selectedProp.value) return;

    loading.value = true;
    showReincorporateConfirm.value = false;

    try {
      await propertyService.reincorporateProperty(selectedProp.value.id);
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

  const handleLocalLocationUpdate = (updatedProp: Property) => {
    const index = myProperties.value.findIndex((p) => p.id === updatedProp.id);
    if (index !== -1) {
      myProperties.value[index] = { ...myProperties.value[index], ...updatedProp };
      if (selectedProp.value && selectedProp.value.id === updatedProp.id) {
        selectedProp.value = { ...updatedProp };
      }
    }
  };

  onMounted(async () => {
    await load();

    // Check if we arrived here to clone a property
    const state = window.history.state;
    if (state && state.cloneProperty) {
      const sourceData = state.cloneProperty;

      editingProperty.value = {
        ...sourceData,
        id: undefined,
        title: sourceData.title + ' (COPY)',
        status: 'DISPONIBLE',
      };

      isEditing.value = false;
      formKey.value++;

      setTimeout(() => {
        showCreateEditModal.value = true;
      }, 100);

      window.history.replaceState({ ...state, cloneProperty: null }, '');
    }
  });
</script>
