<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-5xl mx-auto px-4 py-5">
      <!-- Back button and Actions -->
      <div class="flex justify-between items-center mb-4 flex-wrap gap-3">
        <FwbButton
          tag="router-link"
          to="/dashboard/operations"
          color="light"
          size="xs"
          class="!px-2.5 !py-1 text-xs dark:bg-gray-800 dark:border-gray-700"
        >
          <template #prefix>
            <IconLucideArrowLeft class="w-3 h-3" />
          </template>
          {{ t('operations.backToList') }}
        </FwbButton>

        <div v-if="operation && operation.status !== 'CANCELLED'" class="flex gap-2 flex-wrap">
          <FwbButton
            color="red"
            size="xs"
            class="!px-2.5 !py-1 text-xs font-bold uppercase tracking-tight"
            @click="triggerCancel('ONLY')"
            :disabled="cancelling"
            outline
          >
            <template #prefix>
              <IconLucideBan class="w-3 h-3" />
            </template>
            {{ cancelling ? t('common.processing') : t('operations.cancelOperation') }}
          </FwbButton>

          <FwbButton
            color="red"
            size="xs"
            class="!px-2.5 !py-1 text-xs font-bold uppercase tracking-tight"
            @click="triggerCancel('RECREATE')"
            :disabled="cancelling"
          >
            <template #prefix>
              <IconLucidePlusCircle class="w-3 h-3" />
            </template>
            {{ cancelling ? t('common.processing') : t('operations.cancelAndRecreate') }}
          </FwbButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loadingOperation" class="flex justify-center py-12">
        <fwb-spinner size="8" />
      </div>

      <!-- Error -->
      <FwbAlert v-else-if="operationError" type="danger" dismissible class="mb-4 text-sm">
        {{ operationError }}
      </FwbAlert>

      <!-- Main content -->
      <template v-else-if="operation">
        <!-- Header card -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm"
        >
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <FwbBadge type="default" size="xs">{{ t('operations.operationBadge') }}</FwbBadge>
            <FwbBadge :type="statusBadgeType" size="xs">
              <div class="flex items-center gap-1">
                <div :class="['w-1.5 h-1.5 rounded-full', statusDotClass]"></div>
                {{ t('status.' + operation.status) }}
              </div>
            </FwbBadge>
          </div>
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h1 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ operation.propertyName }}
            </h1>
            <div class="text-xs text-gray-500 font-mono">ID: {{ operationId }}</div>
          </div>
        </div>

        <!-- Details + Price row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <!-- Details card -->
          <div
            class="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
          >
            <h3
              class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1"
            >
              <IconLucideInfo class="w-3.5 h-3.5" />
              {{ t('common.details') }}
            </h3>
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <span class="text-gray-500 dark:text-gray-400 font-medium">
                {{ t('adminProperties.owner') }}:
              </span>
              <span class="text-gray-900 dark:text-white font-semibold">
                {{ operation.ownerName || '-' }}
              </span>

              <span class="text-gray-500 dark:text-gray-400 font-medium">
                {{ t('operations.client') }}:
              </span>
              <span class="text-gray-900 dark:text-white font-semibold">
                {{ operation.clientName || '-' }}
              </span>

              <span class="text-gray-500 dark:text-gray-400 font-medium">
                {{ t('adminProperties.advisor') }}:
              </span>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ operation.agentName || '-' }}
                </span>
              </div>

              <span class="text-gray-500 dark:text-gray-400 font-medium">
                {{ t('adminProperties.closingDate') }}:
              </span>
              <span class="text-gray-900 dark:text-white font-semibold">
                {{ formatDate(operation.closureDate) }}
              </span>
            </div>
          </div>

          <!-- Price card -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col justify-center text-center"
          >
            <p
              class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide"
            >
              {{ t('adminProperties.finalPrice') }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {{ formatCurrency(operation.finalPrice, operation.currency) }}
            </p>
            <p class="text-xs text-gray-500 mt-1">{{ t('common.includingTaxes') }}</p>
          </div>
        </div>

        <!-- Property Info & Documents row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Property Basic Info & Images -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
          >
            <h3
              class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1"
            >
              <IconLucideBuilding class="w-3.5 h-3.5" />
              {{ t('adminProperties.property') }}
            </h3>
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <span class="text-gray-500 dark:text-gray-400 font-medium">
                {{ t('adminProperties.propertyType') }}:
              </span>
              <span class="text-gray-900 dark:text-white font-semibold">
                {{ operation.propertyType ? t('propertyTypes.' + operation.propertyType) : '-' }}
              </span>

              <span class="text-gray-500 dark:text-gray-400 font-medium">
                {{ t('adminProperties.operationType') }}:
              </span>
              <span class="text-gray-900 dark:text-white font-semibold">
                {{
                  operation.operationType ? t('propertyOperations.' + operation.operationType) : '-'
                }}
              </span>
            </div>

            <!-- Property Images Thumbnail -->
            <div
              v-if="propertyData?.imageUrls?.length"
              class="mt-4 flex gap-2 overflow-x-auto pb-2"
            >
              <img
                v-for="(url, idx) in propertyData.imageUrls"
                :key="idx"
                :src="url"
                class="h-16 w-16 object-cover rounded border border-gray-200 dark:border-gray-600 flex-shrink-0"
              />
            </div>
          </div>

          <!-- Property Documents -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
          >
            <h3
              class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1"
            >
              <IconLucideFileText class="w-3.5 h-3.5" />
              {{ t('documentUpload.title') }}
            </h3>
            <div v-if="loadingProperty" class="flex justify-center py-4">
              <fwb-spinner size="6" />
            </div>
            <div v-else-if="propertyDocuments.length" class="space-y-2">
              <div
                v-for="doc in propertyDocuments"
                :key="doc.id"
                class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs"
              >
                <div class="flex items-center gap-2 overflow-hidden">
                  <IconLucideFileText class="w-4 h-4 text-blue-500" />
                  <span class="truncate dark:text-gray-200" :title="doc.originalFileName">
                    {{ doc.originalFileName }}
                  </span>
                </div>
                <a
                  :href="doc.temporaryDownloadUrl"
                  target="_blank"
                  class="text-blue-600 hover:underline font-bold"
                  v-if="doc.temporaryDownloadUrl"
                >
                  {{ t('common.download') }}
                </a>
              </div>
            </div>
            <div v-else class="text-center py-4 text-xs text-gray-400 italic">
              {{ t('documentUpload.noDocuments') }}
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div
          v-if="operation.notes"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm mb-4"
        >
          <div class="flex gap-2">
            <IconLucideFileText class="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {{ t('adminProperties.notes') }}
              </h3>
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ operation.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Receipts -->
        <OperationReceiptsSection :operation-id="operationId" />
      </template>
    </div>

    <!-- Confirm Cancel Modal -->
    <ConfirmModal
      :show="showConfirmCancel"
      :title="t('common.areYouSure')"
      :message="
        cancelMode === 'ONLY'
          ? t('operations.cancelWarning')
          : t('operations.cancelAndRecreateWarning')
      "
      :confirm-text="t('operations.confirmCancel')"
      type="danger"
      :loading="cancelling"
      @close="showConfirmCancel = false"
      @confirm="handleCancelExecution"
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
  import { useI18n } from 'vue-i18n';
  import IconLucideArrowLeft from '~icons/lucide/arrow-left';
  import IconLucideInfo from '~icons/lucide/info';
  import IconLucideBuilding from '~icons/lucide/building';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideBan from '~icons/lucide/ban';
  import IconLucidePlusCircle from '~icons/lucide/plus-circle';
  import { ref, computed, onMounted, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { FwbBadge, FwbAlert, FwbButton, FwbSpinner } from 'flowbite-vue';
  import OperationReceiptsSection from '@/components/operations/receipts/OperationReceiptsSection.vue';
  import { apiClient as api } from '@/api';
  import { handleApiError } from '@/api/errorHandler';
  import { getLocaleString } from '@/locales/i18n';
  import { propertyService } from '@/modules/properties';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import type { Property } from '@/types/property';
  import type { DocumentResponse } from '@/modules/properties';
  import type { OperationData } from '@/types/operation';
  import ConfirmModal from '@/components/ui/ConfirmModal.vue';
  import AppToast from '@/components/ui/AppToast.vue';

  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const operationId = route.params.id as string;

  const operation = ref<OperationData | null>(null);
  const propertyData = ref<Property | null>(null);
  const propertyDocuments = ref<DocumentResponse[]>([]);
  const loadingOperation = ref(false);
  const loadingProperty = ref(false);
  const operationError = ref<string | null>(null);
  const cancelling = ref(false);

  // UI States
  const showConfirmCancel = ref(false);
  const cancelMode = ref<'ONLY' | 'RECREATE'>('ONLY');
  const toast = reactive({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  const isAdmin = computed(() => {
    const u = authStore.user as UserClaims | null;
    return u?.roles?.includes('ADMIN') || u?.userType === 'ADMIN';
  });

  const loadOperation = async () => {
    loadingOperation.value = true;
    try {
      const response = await api.get(`/operations/${route.params.id}`);
      operation.value = response.data.data;

      if (operation.value?.propertyId) {
        loadPropertyData(operation.value.propertyId);
      }
    } catch {
      operationError.value = t('reports.rankingLoadError');
    } finally {
      loadingOperation.value = false;
    }
  };

  const loadPropertyData = async (propId: string) => {
    loadingProperty.value = true;
    try {
      propertyData.value = await propertyService.getPropertyById(propId);
      propertyDocuments.value = await propertyService.getPropertyDocuments(propId);
    } catch (err) {
      console.error('Error loading property assets for operation:', err);
    } finally {
      loadingProperty.value = false;
    }
  };

  onMounted(loadOperation);

  const triggerCancel = (mode: 'ONLY' | 'RECREATE') => {
    cancelMode.value = mode;
    showConfirmCancel.value = true;
  };

  const handleCancelExecution = async () => {
    cancelling.value = true;
    try {
      await api.patch(`/operations/${operationId}/status`, { status: 'CANCELLED' });

      showConfirmCancel.value = false;

      toast.message = t('operations.cancelledText');
      toast.type = 'success';
      toast.show = true;

      if (cancelMode.value === 'RECREATE') {
        const dashboardRoute = isAdmin.value ? 'AdminProperties' : 'AgentDashboard';

        // Ensure we pass a plain object to state
        const cloneData = propertyData.value
          ? JSON.parse(JSON.stringify(propertyData.value))
          : null;

        setTimeout(() => {
          router.push({
            name: dashboardRoute,
            state: { cloneProperty: cloneData },
          });
        }, 1000);
      } else {
        await loadOperation();
      }
    } catch (err: unknown) {
      toast.message = handleApiError(err).message;
      toast.type = 'error';
      toast.show = true;
      showConfirmCancel.value = false;
    } finally {
      cancelling.value = false;
    }
  };

  const statusBadgeType = computed(() => {
    const status = operation.value?.status?.toUpperCase() || '';
    const map: Record<string, 'green' | 'dark' | 'yellow' | 'red'> = {
      ACTIVE: 'green',
      CLOSED: 'dark',
      CANCELLED: 'red',
      PENDING: 'yellow',
    };
    return map[status] || 'dark';
  });

  const statusDotClass = computed(() => {
    const type = statusBadgeType.value;
    const map: Record<string, string> = {
      green: 'bg-green-500',
      dark: 'bg-gray-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
    };
    return map[type] || 'bg-gray-500';
  });

  function formatDate(iso?: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString(getLocaleString(), {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat(getLocaleString(), {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }
</script>
