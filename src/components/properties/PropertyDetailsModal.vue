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
      <div class="grid grid-cols-1 gap-8" :class="{ 'lg:grid-cols-2': showSidebar }">
        <div class="space-y-4">
          <div
            class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            <h4 class="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">
              {{ t('propertyDetails.technicalSheet') }}
            </h4>
            <div class="grid grid-cols-2 gap-y-3 text-sm">
              <span class="text-gray-500 font-medium">{{ t('propertyDetails.location') }}</span>
              <span class="dark:text-white text-right">{{ property?.address }}</span>

              <span class="text-gray-500 font-medium">{{ t('propertyDetails.area') }}</span>
              <span class="dark:text-white text-right">
                {{ property?.m2 }} {{ t('common.units.m2') }}
              </span>

              <span class="text-gray-500 font-medium">{{ t('propertyDetails.bedrooms') }}</span>
              <span class="dark:text-white text-right">{{ property?.rooms }}</span>

              <span class="text-gray-500 font-medium">{{ t('propertyDetails.type') }}</span>
              <span class="dark:text-white text-right">{{ property?.type }}</span>

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
                    property?.status === 'ELIMINADO'
                  "
                  class="text-xs font-bold rounded-lg border-gray-300 py-1 px-2 dark:bg-gray-700 dark:text-white"
                  :class="statusColorClass(localStatus)"
                >
                  <option value="DISPONIBLE">
                    {{ t('propertyDetails.statusAvailable') }}
                  </option>
                  <option value="RESERVADO">
                    {{ t('propertyDetails.statusReserved') }}
                  </option>
                  <option value="EN_NEGOCIACION">
                    {{ t('propertyDetails.statusNegotiating') }}
                  </option>
                  <option value="RETIRADO">{{ t('status.RETIRADO') }}</option>
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
              :can-manage="!isClientView && (isAdmin || isAssignedAgent || isRelatedToOperation)"
            />
          </div>

          <div
            class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <h4 class="text-xs font-black text-green-600 uppercase tracking-widest mb-3">
              {{ t('propertyDetails.responsible') }}
            </h4>

            <div v-if="loadingOwner" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span class="ml-2 text-sm text-gray-500">{{ t('propertyDetails.loading') }}</span>
            </div>

            <div v-else-if="owner" class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
                >
                  <span class="text-white font-bold text-lg">
                    {{ owner.firstName?.charAt(0) }}{{ owner.lastName?.charAt(0) }}
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

          <!-- ── Listado de visitas con resultados (para el propietario) ── -->
          <div v-if="visits.length > 0" class="mt-6">
            <h4
              class="text-sm font-bold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <IconLucideCalendar class="w-4 h-4" />
              {{ t('propertyDetails.visitsHistory') }}
            </h4>
            <div class="space-y-3 max-h-64 overflow-y-auto pr-2">
              <div
                v-for="v in visits"
                :key="v.id"
                class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="text-xs text-secondary">
                      {{ formatFecha(v.startTime) }}
                    </p>
                    <p class="text-sm font-semibold dark:text-white">
                      {{ v.clientName || t('common.notSpecified') }}
                    </p>
                  </div>
                  <span
                    v-if="v.resultado"
                    :class="resultadoBadgeClass(v.resultado)"
                    class="text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ml-2"
                  >
                    {{ getResultadoLabel(v.resultado) }}
                  </span>
                  <span v-else class="text-[10px] text-gray-400 italic whitespace-nowrap ml-2">
                    {{ t('propertyDetails.noResult') }}
                  </span>
                </div>
                <p v-if="v.observaciones" class="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {{ v.observaciones }}
                </p>
                <p v-if="v.fechaRegistroResultado" class="text-[10px] text-gray-400 mt-1">
                  {{ t('visitResult.registeredOn') }}
                  {{ formatFecha(v.fechaRegistroResultado) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showSidebar" class="space-y-6">
          <!-- Receipts Section (Visible for reserved properties and related users) -->
          <div
            v-if="canManageReceipts"
            class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800"
          >
            <OperationReceiptsSection
              :operation-id="associatedOperation.id!"
              :can-delete="isAdmin || currentUser?.userId === associatedOperation.agentId"
            />
          </div>

          <div v-if="!isClientView" class="relative pl-6 border-l-2 border-yellow-400">
            <div
              class="absolute -left-[9px] top-0 w-4 h-4 bg-yellow-400 rounded-full border-4 border-white dark:border-gray-900"
            ></div>
            <h4 class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4">
              {{ t('propertyDetails.priceEvolution') }}
            </h4>

            <div
              v-if="property?.priceHistory?.length"
              class="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
            >
              <div
                v-for="(h, i) in property!.priceHistory"
                :key="i"
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-xs text-gray-400 line-through">
                      {{ t('common.currency.symbol') }}{{ h.oldPrice.toLocaleString() }}
                    </span>
                    <IconLucideArrowRight class="w-3 h-3 text-gray-400" />
                    <span class="text-sm font-bold text-green-600">
                      {{ t('common.currency.symbol') }}{{ h.newPrice.toLocaleString() }}
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

          <div v-if="!isClientView" class="relative pl-6 border-l-2 border-blue-500">
            <div
              class="absolute -left-[9px] top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900"
            ></div>
            <h4 class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4">
              {{ t('propertyDetails.assignmentHistory') }}
            </h4>

            <div
              v-if="property?.assignmentHistory?.length"
              class="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
            >
              <div
                v-for="(ah, i) in property!.assignmentHistory"
                :key="i"
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
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

          <div v-if="!isClientView" class="relative pl-6 border-l-2 border-red-500">
            <div
              class="absolute -left-[9px] top-0 w-4 h-4 bg-red-500 rounded-full border-4 border-white dark:border-gray-900"
            ></div>
            <h4 class="text-sm font-bold dark:text-white uppercase tracking-tight mb-4">
              {{ t('propertyDetails.statusHistory') }}
            </h4>

            <div
              v-if="property?.statusHistory?.length"
              class="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
            >
              <div
                v-for="(h, i) in [...(property!.statusHistory || [])].reverse()"
                :key="i"
                class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm"
              >
                <div class="flex justify-between items-center mb-1">
                  <div class="flex items-center space-x-1">
                    <span class="text-[10px] font-bold text-gray-400">
                      {{ t('status.' + h.oldStatus) }}
                    </span>
                    <IconLucideArrowRight class="w-2 h-2 text-gray-400" />
                    <span class="text-[10px] font-bold" :class="statusTextClass(h.newStatus)">
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
                <p class="text-sm text-gray-800 dark:text-gray-200 font-semibold mt-1">
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
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <fwb-button
          v-if="isAdmin && ['ELIMINADO', 'RETIRADO', 'VENDIDO'].includes(property?.status ?? '')"
          @click="showReincorporateConfirm = true"
          color="green"
          :disabled="updatingStatus"
        >
          <div class="flex items-center gap-2">
            <IconLucideRefreshCw class="w-4 h-4" :class="{ 'animate-spin': updatingStatus }" />
            {{ t('propertyDetails.reincorporate') }}
          </div>
        </fwb-button>

        <fwb-button color="alternative" @click="$emit('close')">
          {{ t('propertyDetails.close') }}
        </fwb-button>
      </div>
    </template>
  </BaseModal>

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
</template>

<script setup lang="ts">
  import { ref, watch, reactive, computed } from 'vue';
  import { FwbBadge, FwbButton } from 'flowbite-vue';
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
  import IconLucideCalendar from '~icons/lucide/calendar';
  import IconLucideHome from '~icons/lucide/home';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';
  import AppToast from '@/components/ui/AppToast.vue';
  import IconLucideRefreshCw from '~icons/lucide/refresh-cw';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import ConfirmModal from '@/components/ui/ConfirmModal.vue';
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
      owner.value = await personService.getPersonByAuthUserId(props.property.ownerId);
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
        associatedOperation.value = await propertyService.getOperationByPropertyId(
          props.property.id
        );
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
    const roles = (u?.roles as string[]) || [];
    return roles.includes('ADMIN') || u?.userType === 'ADMIN';
  });

  const isAssignedAgent = computed(() => {
    if (!props.property || !currentUser.value) return false;
    const userId = currentUser.value.userId || currentUser.value.sub || currentUser.value.id;
    return userId === props.property.assignedAgentId;
  });

  const isRelatedToOperation = computed(() => {
    if (!associatedOperation.value || !currentUser.value) return false;
    const userId = currentUser.value.userId || currentUser.value.sub || currentUser.value.id;
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

  // Helper functions for resultado
  const getResultadoLabel = (resultado: string): string => {
    const map: Record<string, string> = {
      INTERESADO: t('visitResult.interesado'),
      NO_INTERESADO: t('visitResult.noInteresado'),
      PENDIENTE: t('visitResult.pendiente'),
    };
    return map[resultado] || resultado;
  };

  const resultadoBadgeClass = (resultado: string): string => {
    const map: Record<string, string> = {
      INTERESADO: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      NO_INTERESADO: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      PENDIENTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return map[resultado] || 'bg-gray-100 text-gray-800';
  };

  const handleReincorporate = async () => {
    if (!props.property) return;

    updatingStatus.value = true;
    showReincorporateConfirm.value = false;

    try {
      const updatedProperty = await propertyService.reincorporateProperty(props.property.id);

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
    if (props.property.status === 'VENDIDO' || props.property.status === 'ELIMINADO') {
      toast.message = t('propertyDetails.statusChangeBlocked');
      toast.type = 'error';
      toast.show = true;
      localStatus.value = props.property.status;
      return;
    }

    updatingStatus.value = true;
    try {
      let updatedProperty: Property;
      if (localStatus.value === 'RETIRADO') {
        updatedProperty = await propertyService.withdrawProperty(props.property.id);
      } else {
        updatedProperty = await propertyService.updateStatus(props.property.id, localStatus.value);
      }

      localStatus.value = updatedProperty.status;
      toast.message = t('propertyDetails.statusUpdated');
      toast.type = 'success';
      toast.show = true;

      emit('status-updated', updatedProperty);
      if (['RESERVADO', 'VENDIDO', 'EN_NEGOCIACION'].includes(updatedProperty.status)) {
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(getLocaleString(), {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFecha = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString(getLocaleString(), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
</script>
