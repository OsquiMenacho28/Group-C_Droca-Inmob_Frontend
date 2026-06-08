<template>
  <BaseModal
    :model-value="show"
    :title="property?.title"
    size="2xl"
    @update:model-value="$emit('close')"
  >
    <template #header-icon>
      <div class="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
        <IconLucideHome class="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
    </template>

    <template #header>
      <div class="flex items-center space-x-4">
        <span>{{ property?.title }}</span>
        <fwb-badge :color="getStatusColor(property?.status || '')">
          {{ property?.status ? t('status.' + property.status) : '' }}
        </fwb-badge>
      </div>
    </template>

    <template #body>
      <fwb-tabs v-model="activeTab" variant="underline" class="mb-4">
        <fwb-tab name="details" :title="t('propertyDetails.tabGeneral')">
      <div
        class="grid grid-cols-1 gap-8"
        :class="{ 'lg:grid-cols-2': showSidebar }"
      >
        <div class="space-y-4">
          <div class="app-card p-4 rounded-xl">
            <h4
              class="text-xs font-black text-blue-600 uppercase tracking-widest mb-3"
            >
              {{ t('propertyDetails.technicalSheet') }}
            </h4>
            <div class="grid grid-cols-2 gap-y-3 text-sm">
              <span class="text-gray-500 font-medium">{{
                t('propertyDetails.location')
              }}</span>
              <span class="dark:text-white text-right">{{
                property?.address
              }}</span>

              <span class="text-gray-500 font-medium">{{
                t('propertyDetails.area')
              }}</span>
              <span class="dark:text-white text-right">
                {{ property?.m2 }} {{ t('common.units.m2') }}
              </span>

              <span class="text-gray-500 font-medium">{{
                t('propertyDetails.bedrooms')
              }}</span>
              <span class="dark:text-white text-right">{{
                property?.rooms
              }}</span>

              <span class="text-gray-500 font-medium">{{
                t('propertyDetails.type')
              }}</span>
              <span class="dark:text-white text-right">{{
                property?.type
              }}</span>

              <span class="text-gray-500 font-medium">
                {{ t('propertyDetails.currentStatus') }}
              </span>
              <div class="flex justify-end">
                <select
                  v-if="!isClientView"
                  v-model="localStatus"
                  @change="handleStatusChange"
                  :disabled="
                    updatingStatus ||
                    property?.status === 'VENDIDO' ||
                    property?.status === 'ELIMINADO' ||
                    (!isAdmin && !isAssignedAgent)
                  "
                  class="text-xs font-bold rounded-lg border-gray-300 py-1 px-2 dark:bg-gray-700 dark:text-white"
                  :class="statusColorClass(localStatus)"
                >
                  <option
                    v-for="opt in availableStatusOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
                <span
                  v-else
                  class="dark:text-white text-right"
                  :class="statusTextClass(property?.status)"
                >
                  {{ property?.status ? t('status.' + property.status) : '' }}
                </span>
              </div>
            </div>
          </div>

          <div class="rounded-xl overflow-hidden shadow-sm">
            <ImageGallery
              :property-id="property?.id"
              :can-manage="
                !isClientView &&
                (isAdmin || isAssignedAgent || isRelatedToOperation)
              "
            />
          </div>

          <div class="app-card p-4 rounded-xl shadow-sm">
            <h4
              class="text-xs font-black text-green-600 uppercase tracking-widest mb-3"
            >
              {{ t('propertyDetails.responsible') }}
            </h4>

            <div
              v-if="loadingOwner"
              class="flex items-center justify-center py-8"
            >
              <div
                class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"
              ></div>
              <span class="ml-2 text-sm text-gray-500">{{
                t('propertyDetails.loading')
              }}</span>
            </div>

            <div v-else-if="owner" class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
                >
                  <span class="text-white font-bold text-lg">
                    {{ owner.firstName?.charAt(0)
                    }}{{ owner.lastName?.charAt(0) }}
                  </span>
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <h5 class="text-sm font-semibold text-primary truncate">
                  {{ owner.firstName }} {{ owner.lastName }}
                </h5>
                <p class="text-xs text-secondary mb-2">
                  {{ t('propertyDetails.ownerLabel') }}
                </p>

                <div class="space-y-1">
                  <div
                    v-if="owner.email"
                    class="flex items-center text-xs text-gray-600 dark:text-gray-300"
                  >
                    <IconLucideMail class="w-3 h-3 mr-1 flex-shrink-0" />
                    <span class="truncate">{{ owner.email }}</span>
                  </div>

                  <div
                    v-if="owner.phone"
                    class="flex items-center text-xs text-gray-600 dark:text-gray-300"
                  >
                    <IconLucidePhone class="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>{{ owner.phone }}</span>
                  </div>
                </div>

                <div class="flex gap-2 mt-3">
                  <fwb-button
                    v-if="owner.phone"
                    @click="contactViaWhatsApp"
                    size="xs"
                    color="green"
                    class="flex-1"
                  >
                    <IconLucideMessageSquare class="w-3 h-3 mr-1" />
                    {{ t('propertyDetails.whatsapp') }}
                  </fwb-button>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-6">
              <IconLucideUser class="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p class="text-xs text-secondary">
                {{ t('propertyDetails.noOwnerAssigned') }}
              </p>
            </div>
          </div>

        </div>

        <div v-if="showSidebar" class="space-y-6">
          <!-- Receipts Section (Visible for reserved properties and related users) -->
          <div
            v-if="associatedOperation"
            class="p-4 app-card bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30"
          >
            <OperationReceiptsSection
              :operation-id="associatedOperation.id!"
              :can-delete="
                isAdmin || currentUser?.userId === associatedOperation.agentId
              "
            />
          </div>

          <div
            v-if="!isClientView"
            class="relative pl-6 border-l-2 border-yellow-400"
          >
            <div
              class="absolute -left-[9px] top-0 w-4 h-4 bg-yellow-400 rounded-full border-4 border-white dark:border-gray-900"
            ></div>
            <h4
              class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4"
            >
              {{ t('propertyDetails.priceEvolution') }}
            </h4>

            <div
              v-if="property?.priceHistory?.length"
              class="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
            >
              <div
                v-for="(h, i) in property!.priceHistory"
                :key="i"
                class="app-card p-3 rounded-lg"
              >
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-400 line-through">
                      {{ t('common.currency.symbol')
                      }}{{ h.oldPrice.toLocaleString() }}
                    </span>
                    <IconLucideArrowRight class="w-3 h-3 text-gray-400" />
                    <span class="text-sm font-bold text-green-600">
                      {{ t('common.currency.symbol')
                      }}{{ h.newPrice.toLocaleString() }}
                    </span>
                  </div>
                  <span
                    class="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 font-mono"
                  >
                    {{ formatDate(h.changedAt) }}
                  </span>
                </div>
                <p class="text-[10px] text-gray-400">
                  {{ t('propertyDetails.modifiedBy') }}
                  <span class="text-gray-600 dark:text-gray-300 font-medium">
                    {{ h.changedBy }}
                  </span>
                </p>
              </div>
            </div>
            <div
              v-else
              class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic"
            >
              {{ t('propertyDetails.noPriceChanges') }}
            </div>
          </div>

          <div
            v-if="!isClientView"
            class="relative pl-6 border-l-2 border-blue-500"
          >
            <div
              class="absolute -left-[9px] top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900"
            ></div>
            <h4
              class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4"
            >
              {{ t('propertyDetails.assignmentHistory') }}
            </h4>

            <div
              v-if="property?.assignmentHistory?.length"
              class="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
            >
              <div
                v-for="(ah, i) in property!.assignmentHistory"
                :key="i"
                class="app-card p-3 rounded-lg"
              >
                <p class="text-xs dark:text-gray-200">
                  {{ t('propertyDetails.previousAgent') }}
                  <span class="font-bold text-blue-600">{{ ah.agentId }}</span>
                </p>
                <div
                  class="flex justify-between items-center mt-2 pt-2 border-t border-gray-50 dark:border-gray-700"
                >
                  <p class="text-[10px] text-gray-400">
                    {{ t('propertyDetails.assignedBy') }} {{ ah.assignedBy }}
                  </p>
                  <span class="text-[10px] text-gray-400 font-mono">
                    {{ formatDate(ah.assignedAt) }}
                  </span>
                </div>
              </div>
            </div>
            <div
              v-else
              class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic"
            >
              {{ t('propertyDetails.noAssignmentChanges') }}
            </div>
          </div>

          <div
            v-if="!isClientView"
            class="relative pl-6 border-l-2 border-red-500"
          >
            <div
              class="absolute -left-[9px] top-0 w-4 h-4 bg-red-500 rounded-full border-4 border-white dark:border-gray-900"
            ></div>
            <h4
              class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4"
            >
              {{ t('propertyDetails.statusHistory') }}
            </h4>

            <div
              v-if="property?.statusHistory?.length"
              class="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
            >
              <div
                v-for="(h, i) in [...(property!.statusHistory || [])].reverse()"
                :key="i"
                class="app-card p-3 rounded-lg"
              >
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center space-x-1">
                    <span class="text-[10px] font-bold text-gray-400">
                      {{ t('status.' + h.oldStatus) }}
                    </span>
                    <IconLucideArrowRight class="w-2 h-2 text-gray-400" />
                    <span
                      class="text-[10px] font-bold"
                      :class="statusTextClass(h.newStatus)"
                    >
                      {{ t('status.' + h.newStatus) }}
                    </span>
                  </div>
                  <span class="text-[9px] text-gray-400 font-mono">
                    {{ formatDate(h.changedAt) }}
                  </span>
                </div>
                <p class="text-[9px] text-gray-500">
                  {{ t('propertyDetails.changedBy') }} {{ h.changedBy }}
                </p>
              </div>
            </div>
            <div
              v-else
              class="p-4 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg text-gray-400 text-xs italic"
            >
              {{ t('propertyDetails.noStatusChanges') }}
            </div>
          </div>

          <!-- Retirement reason section (visible only if property is RETIRADO) - FROM INCOMING -->
          <div
            v-if="property?.status === 'RETIRADO'"
            class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
          >
            <div class="grid grid-cols-1 gap-3">
              <div>
                <p class="text-xs text-secondary uppercase font-bold">
                  {{ t('retirement.motivoLabel') }}
                </p>
                <p
                  class="text-sm text-gray-800 dark:text-gray-200 font-semibold mt-1"
                >
                  {{ getMotivoLabel(property.motivoRetiro) }}
                </p>
              </div>
              <div v-if="property.detalleRetiro">
                <p class="text-xs text-secondary uppercase font-bold">
                  {{ t('retirement.detalleLabel') }}
                </p>
                <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {{ property.detalleRetiro }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </fwb-tab>

        <fwb-tab name="visits" :title="t('propertyDetails.visitsHistory')">
          <PropertyVisitsHistoryTab
            :visits="visits"
            :loading="loadingVisits"
          />
        </fwb-tab>
      </fwb-tabs>
    </template>
    <template #footer>
      <div class="flex flex-wrap justify-end gap-3">
        <template v-if="isAdmin && property?.id">
          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="generatingPdf"
            @click.stop="handleGeneratePdf"
          >
            <IconLucideFileDown
              class="w-4 h-4"
              :class="{ 'animate-pulse': generatingPdf }"
            />
            {{
              generatingPdf
                ? t('propertyPdf.generating')
                : t('propertyPdf.generate')
            }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
            @click.stop="openSendPdfModal"
          >
            <IconLucideMail class="w-4 h-4" />
            {{ t('propertyPdf.sendEmail') }}
          </button>
        </template>

        <fwb-button
          v-if="
            isAdmin &&
            ['ELIMINADO', 'RETIRADO', 'VENDIDO'].includes(
              property?.status ?? ''
            )
          "
          @click="showReincorporateConfirm = true"
          color="green"
          :disabled="updatingStatus"
        >
          <div class="flex items-center gap-2">
            <IconLucideRefreshCw
              class="w-4 h-4"
              :class="{ 'animate-spin': updatingStatus }"
            />
            {{ t('propertyDetails.reincorporate') }}
          </div>
        </fwb-button>

        <fwb-button color="alternative" @click="$emit('close')">
          {{ t('propertyDetails.close') }}
        </fwb-button>
      </div>
    </template>
  </BaseModal>

  <Teleport to="body">
    <ConfirmModal
      :show="showReincorporateConfirm"
      :title="t('propertyDetails.reincorporateConfirmTitle')"
      :message="reincorporateConfirmMessage"
      type="question"
      @confirm="handleReincorporate"
      @close="showReincorporateConfirm = false"
    />
  </Teleport>

  <Teleport to="body">
    <RetirementModal
      v-if="showRetirementModal"
      :show="showRetirementModal"
      :property-id="property?.id || ''"
      :property-title="property?.title || ''"
      @close="handleRetirementCancel"
      @success="handleRetirementSuccess"
    />
  </Teleport>

  <Teleport to="body">
    <SendPropertyPdfModal
      v-if="showSendPdfModal && property?.id"
      :show="showSendPdfModal"
      :property-id="property.id"
      :property-title="property.title || ''"
      @close="showSendPdfModal = false"
      @success="handleSendPdfSuccess"
      @error="handleSendPdfError"
    />
  </Teleport>

  <!-- Global Toast -->
  <AppToast
    :show="toast.show"
    :message="toast.message"
    :type="toast.type"
    @close="toast.show = false"
  />
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue';
import { FwbBadge, FwbButton, FwbTabs, FwbTab } from 'flowbite-vue';
import { propertyService } from '@/modules/properties';
import { personService } from '@/services/personService';
import { getVisitsForProperty } from '@/services/visitRequestService';
import type { Property } from '@/types/property';
import type { Visit } from '@/types/reschedule';

import IconLucideMail from '~icons/lucide/mail';
import IconLucidePhone from '~icons/lucide/phone';
import IconLucideMessageSquare from '~icons/lucide/message-square';
import IconLucideUser from '~icons/lucide/user';
import IconLucideArrowRight from '~icons/lucide/arrow-right';
import IconLucideHome from '~icons/lucide/home';
import { useI18n } from 'vue-i18n';
import { formatDate } from '@/utils/dateTime';
import PropertyVisitsHistoryTab from '@/components/properties/PropertyVisitsHistoryTab.vue';
import SendPropertyPdfModal from '@/components/properties/SendPropertyPdfModal.vue';
import IconLucideFileDown from '~icons/lucide/file-down';
import AppToast from '@/components/ui/AppToast.vue';
import IconLucideRefreshCw from '~icons/lucide/refresh-cw';
import { useAuthStore, type UserClaims } from '@/modules/auth';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import RetirementModal from '@/components/properties/RetirementModal.vue';
import { handleApiError } from '@/api/errorHandler';
import type { OperationData } from '@/types/operation';
import OperationReceiptsSection from '@/components/operations/receipts/OperationReceiptsSection.vue';
import ImageGallery from '@/components/properties/ImageGallery.vue';
import BaseModal from '@/components/ui/BaseModal.vue';

const { t } = useI18n();

interface PersonOwner {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

const props = defineProps<{
  show: boolean;
  property: Property | null;
  isClientView?: boolean;
}>();

const emit = defineEmits(['close', 'status-updated']);

const authStore = useAuthStore();
const currentUser = computed(() => authStore.user as UserClaims | null);
const showReincorporateConfirm = ref(false);
const showRetirementModal = ref(false);
const showSendPdfModal = ref(false);
const generatingPdf = ref(false);
const activeTab = ref('details');

const localStatus = ref(props.property?.status || '');
const updatingStatus = ref(false);
const owner = ref<PersonOwner | null>(null);
const loadingOwner = ref(false);
const associatedOperation = ref<OperationData | null>(null);
const visits = ref<Visit[]>([]);
const loadingVisits = ref(false);

// UI States
const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error' | 'info',
});

const loadOwnerInfo = async () => {
  if (!props.property?.ownerId) {
    owner.value = null;
    return;
  }

  loadingOwner.value = true;
  try {
    owner.value = await personService.getPersonByAuthUserId(
      props.property.ownerId
    );
  } catch (error) {
    console.error('Error loading owner info:', error);
    owner.value = null;
  } finally {
    loadingOwner.value = false;
  }
};

const loadOperationInfo = async () => {
  if (!props.property?.id) return;

  const status = props.property.status;
  if (status === 'RESERVADO') {
    try {
      associatedOperation.value =
        await propertyService.getOperationByPropertyId(props.property.id);
    } catch {
      associatedOperation.value = null;
    }
  } else {
    associatedOperation.value = null;
  }
};

const loadVisits = async () => {
  if (!props.property?.id) return;
  loadingVisits.value = true;
  try {
    visits.value = await getVisitsForProperty(props.property.id);
  } catch (error) {
    console.error('Error loading visits for property:', error);
    visits.value = [];
  } finally {
    loadingVisits.value = false;
  }
};

const isAdmin = computed(() => {
  const u = authStore.user as UserClaims | null;
  if (!u) return false;
  const roles = Array.isArray(u.roles) ? u.roles.map(String) : [];
  const normalizedRoles = roles.map((role) => role.toUpperCase());
  return (
    normalizedRoles.includes('ADMIN') ||
    normalizedRoles.includes('ROLE_ADMIN') ||
    String(u.role || '').toUpperCase() === 'ADMIN' ||
    u.userType === 'ADMIN'
  );
});

const isAssignedAgent = computed(() => {
  if (!props.property || !currentUser.value) return false;
  const userId =
    currentUser.value.userId || currentUser.value.sub || currentUser.value.id;
  return userId === props.property.assignedAgentId;
});

const availableStatusOptions = computed(() => {
  const options = [
    { value: 'DISPONIBLE', label: t('propertyDetails.statusAvailable') },
    { value: 'RETIRADO', label: t('status.RETIRADO') },
  ];

  if (isAdmin.value) {
    options.push(
      { value: 'RESERVADO', label: t('propertyDetails.statusReserved') },
      { value: 'EN_NEGOCIACION', label: t('propertyDetails.statusNegotiating') }
    );
  }

  const current = props.property?.status;
  if (current && !options.some((opt) => opt.value === current)) {
    let label = current;
    if (current === 'RESERVADO') label = t('propertyDetails.statusReserved');
    else if (current === 'EN_NEGOCIACION')
      label = t('propertyDetails.statusNegotiating');
    else if (current === 'VENDIDO') label = t('status.VENDIDO');
    else if (current === 'ELIMINADO') label = t('status.ELIMINADO');

    options.push({ value: current, label });
  }

  return options;
});

const isRelatedToOperation = computed(() => {
  if (!associatedOperation.value || !currentUser.value) return false;
  const userId =
    currentUser.value.userId || currentUser.value.sub || currentUser.value.id;
  return (
    isAdmin.value ||
    userId === associatedOperation.value.agentId ||
    userId === associatedOperation.value.clientId ||
    userId === associatedOperation.value.ownerId
  );
});

const canManageReceipts = computed(
  () =>
    props.property?.status === 'RESERVADO' &&
    !!associatedOperation.value &&
    isRelatedToOperation.value
);

const reincorporateConfirmMessage = computed(() =>
  props.property?.status === 'VENDIDO'
    ? t('propertyDetails.reincorporateSoldConfirmMessage')
    : t('propertyDetails.reincorporateConfirmMessage')
);

const showSidebar = computed(() => {
  if (!props.isClientView) return true;
  return canManageReceipts.value;
});

// Helper function to get motivo label
const getMotivoLabel = (motivo?: string) => {
  if (!motivo) return '';
  const key = `retirement.reason${motivo.charAt(0).toUpperCase() + motivo.slice(1).toLowerCase()}`;
  const translation = t(key);
  return translation !== key ? translation : motivo;
};

const handleGeneratePdf = async () => {
  if (!props.property?.id) return;

  generatingPdf.value = true;
  try {
    await propertyService.downloadPropertyPdf(props.property.id);
    toast.message = t('propertyPdf.downloadSuccess');
    toast.type = 'success';
    toast.show = true;
  } catch (err: unknown) {
    toast.message = handleApiError(err).message || t('propertyPdf.downloadError');
    toast.type = 'error';
    toast.show = true;
  } finally {
    generatingPdf.value = false;
  }
};

const openSendPdfModal = () => {
  showSendPdfModal.value = true;
};

const handleSendPdfSuccess = (message: string) => {
  showSendPdfModal.value = false;
  toast.message = message || t('propertyPdf.sendSuccess');
  toast.type = 'success';
  toast.show = true;
};

const handleSendPdfError = (message: string) => {
  toast.message = message || t('propertyPdf.sendError');
  toast.type = 'error';
  toast.show = true;
};

const handleReincorporate = async () => {
  if (!props.property) return;

  updatingStatus.value = true;
  showReincorporateConfirm.value = false;

  try {
    const updatedProperty = await propertyService.reincorporateProperty(
      props.property.id
    );

    // Actualización reactiva
    localStatus.value = 'DISPONIBLE';

    toast.message = t('propertyDetails.reincorporateSuccess');
    toast.type = 'success';
    toast.show = true;

    // Notificar al padre para que actualice la lista
    emit('status-updated', updatedProperty);

    // Cerrar el modal después de un breve retraso para ver el toast
    setTimeout(() => {
      emit('close');
    }, 1500);
  } catch (err: unknown) {
    const errorObj = handleApiError(err);
    toast.message = errorObj.message;
    toast.type = 'error';
    toast.show = true;
  } finally {
    updatingStatus.value = false;
  }
};

watch(
  () => props.property,
  (newProperty) => {
    if (newProperty) {
      localStatus.value = newProperty.status;
      loadOwnerInfo();
      loadOperationInfo();
      loadVisits();
    }
  },
  { immediate: true }
);

const handleStatusChange = async () => {
  if (!props.property || localStatus.value === props.property.status) return;

  // Prevenir cambios en estados bloqueados
  if (
    props.property.status === 'VENDIDO' ||
    props.property.status === 'ELIMINADO'
  ) {
    toast.message = t('propertyDetails.statusChangeBlocked');
    toast.type = 'error';
    toast.show = true;
    localStatus.value = props.property.status;
    return;
  }

  if (localStatus.value === 'RETIRADO') {
    showRetirementModal.value = true;
    return;
  }

  updatingStatus.value = true;
  try {
    let updatedProperty: Property;
    updatedProperty = await propertyService.updateStatus(
      props.property.id,
      localStatus.value
    );

    localStatus.value = updatedProperty.status;
    toast.message = t('propertyDetails.statusUpdated');
    toast.type = 'success';
    toast.show = true;

    emit('status-updated', updatedProperty);
    if (
      ['RESERVADO', 'VENDIDO', 'EN_NEGOCIACION'].includes(
        updatedProperty.status
      )
    ) {
      loadOperationInfo();
    } else {
      associatedOperation.value = null;
    }
  } catch (err: unknown) {
    localStatus.value = props.property.status;
    const errorObj = err as {
      response?: { data?: { message?: string; detail?: string } };
    };

    toast.message =
      errorObj.response?.data?.message ||
      errorObj.response?.data?.detail ||
      t('propertyDetails.statusUpdateError');
    toast.type = 'error';
    toast.show = true;
  } finally {
    updatingStatus.value = false;
  }
};

const handleRetirementSuccess = async () => {
  showRetirementModal.value = false;
  localStatus.value = 'RETIRADO';

  try {
    const updatedProperty = await propertyService.getPropertyById(
      props.property!.id
    );
    emit('status-updated', updatedProperty);

    toast.message = t('retirement.success');
    toast.type = 'success';
    toast.show = true;

    setTimeout(() => {
      emit('close');
    }, 1500);
  } catch {
    emit('status-updated', { ...props.property, status: 'RETIRADO' });
    emit('close');
  }
};

const handleRetirementCancel = () => {
  showRetirementModal.value = false;
  localStatus.value = props.property?.status || '';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DISPONIBLE':
      return 'green';
    case 'RESERVADO':
      return 'yellow';
    case 'VENDIDO':
      return 'red';
    case 'EN_NEGOCIACION':
      return 'blue';
    case 'ELIMINADO':
      return 'gray';
    case 'RETIRADO':
      return 'orange';
    default:
      return 'gray';
  }
};

const statusColorClass = (status: string) => {
  const map: Record<string, string> = {
    DISPONIBLE: 'text-green-600 border-green-200 bg-green-50',
    RESERVADO: 'text-yellow-600 border-yellow-200 bg-yellow-50',
    VENDIDO: 'text-red-600 border-red-200 bg-red-50',
    EN_NEGOCIACION: 'text-blue-600 border-blue-200 bg-blue-50',
    ELIMINADO: 'text-gray-600 border-gray-200 bg-gray-50',
    RETIRADO: 'text-orange-600 border-orange-200 bg-orange-50',
  };
  return map[status] || '';
};

const statusTextClass = (status?: string) => {
  const map: Record<string, string> = {
    DISPONIBLE: 'text-green-600',
    RESERVADO: 'text-yellow-600',
    VENDIDO: 'text-red-600',
    EN_NEGOCIACION: 'text-blue-600',
    ELIMINADO: 'text-gray-600',
    RETIRADO: 'text-orange-600',
  };
  return map[status || ''] || '';
};

const contactViaWhatsApp = () => {
  if (!owner.value?.phone || !props.property) return;

  const cleanPhone = owner.value.phone.replace(/\D/g, '');

  const firstName = owner.value.firstName || '';
  const title = props.property.title || '';
  const address = props.property.address || '';
  const message = encodeURIComponent(
    t('propertyDetails.whatsappMessage', {
      name: firstName,
      title: title,
      address: address,
    })
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
  window.open(whatsappUrl, '_blank');
};

watch(
  () => props.property?.status,
  (newStatus) => {
    if (newStatus) {
      localStatus.value = newStatus;
    }
  }
);

watch(
  () => props.show,
  (show) => {
    if (!show) {
      activeTab.value = 'details';
      showSendPdfModal.value = false;
    }
  }
);
</script>
