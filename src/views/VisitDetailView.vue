<!--
  VisitDetailView.vue
  Vista de detalle de una visita individual.

  Integrar todos los componentes de reprogramación.
  Muestra RescheduleButton (solo si CANCELADA) y RescheduledVisitLink.
  Muestra CancelVisit y ReassignButton (solo si no CANCELADA y es propia).

  Ruta: /visits/:id
-->
<template>
  <div class="app-page py-8 px-4">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Back link -->
      <RouterLink
        to="/calendar"
        class="inline-flex items-center gap-2 text-sm text-secondary hover:text-gray-800 dark:hover:text-gray-200 transition"
      >
        <IconLucideArrowLeft class="w-4 h-4" />
        {{ t('visitDetail.backToCalendar') }}
      </RouterLink>

      <!-- Loading skeleton -->
      <div v-if="loading" class="app-card p-8 animate-pulse space-y-4">
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>

      <!-- Error -->
      <div
        v-else-if="fetchError"
        class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-5 text-red-700 dark:text-red-300 text-sm"
      >
        {{ fetchError }}
      </div>

      <template v-else-if="visit">
        <!-- ── Main visit card ─────────────────────────────────────────── -->
        <div class="app-card p-6 space-y-5 transition-colors">
          <!-- Status badge + title -->
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2"
                :class="statusBadgeClass"
              >
                {{ statusLabel }}
              </span>
              <h1 class="text-2xl font-bold text-primary">
                {{ t('visitDetail.title') }}
              </h1>
              <p class="text-gray-400 dark:text-gray-500 text-xs mt-1 font-mono">
                ID: {{ visit.id }}
              </p>
            </div>
          </div>

          <!-- Visit details grid -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <!-- Scheduled date -->
            <div>
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ t('visitDetail.scheduledDate') }}
              </p>
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {{ formatDate(visit.startTime) }} — {{ formatDate(visit.endTime) }}
              </p>
            </div>

            <!-- Property -->
            <div>
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ t('visitDetail.property') }}
              </p>
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {{ visit.propertyName || visit.propertyId }}
              </p>
            </div>

            <!-- Property address -->
            <div v-if="visit.propertyAddress">
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ t('visitDetail.propertyAddress') }}
              </p>
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {{ visit.propertyAddress }}
              </p>
            </div>

            <!-- Client -->
            <div>
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ t('visitDetail.client') }}
              </p>
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {{ visit.clientName || visit.clientId || '—' }}
              </p>
            </div>

            <!-- Agent -->
            <div>
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ t('visitDetail.agent') }}
              </p>
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {{ visit.agentName || visit.agentId }}
              </p>
            </div>

            <!-- Visit type -->
            <div>
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ t('visitDetail.type') }}
              </p>
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {{
                  visit.type === 'VISIT'
                    ? t('visitDetail.visitTypeVisit')
                    : t('visitDetail.visitTypeClientRequest')
                }}
              </p>
            </div>

            <!-- Vehicle -->
            <div v-if="visit.vehicleId">
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ t('visitDetail.vehicle') }}
              </p>
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {{ visit.vehicleId }}
              </p>
            </div>

            <!-- Travel time go -->
            <div v-if="visit.travelTimeGo != null">
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ t('visitDetail.travelTimeGo') }}
              </p>
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {{ visit.travelTimeGo }} {{ t('visitDetail.minutes') }}
              </p>
            </div>

            <!-- Travel time back -->
            <div v-if="visit.travelTimeBack != null">
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ t('visitDetail.travelTimeBack') }}
              </p>
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {{ visit.travelTimeBack }} {{ t('visitDetail.minutes') }}
              </p>
            </div>

            <!-- Created at -->
            <div v-if="visit.createdAt">
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ t('visitDetail.createdAt') }}
              </p>
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                {{ formatDate(visit.createdAt) }}
              </p>
            </div>

            <!-- Notes (full width) -->
            <div class="sm:col-span-2">
              <p
                class="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium"
              >
                {{ t('visitDetail.notes') }}
              </p>
              <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {{ visit.notes || t('visitDetail.noNotes') }}
              </p>
            </div>
          </div>
        </div>

        <!-- ── Registrar resultado (solo para visitas PROGRAMADAS sin resultado) ── -->
        <div
          v-if="visit.status === 'SCHEDULED' && !visit.resultado"
          class="app-card p-6 space-y-4 transition-colors"
        >
          <h2 class="text-sm font-bold text-secondary uppercase tracking-wide">
            {{ t('visitResult.title') }}
          </h2>
          <form @submit.prevent="submitResultado">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('visitResult.resultado') }} *
                </label>
                <select v-model="resultadoForm.resultado" required class="app-input">
                  <option value="INTERESADO">{{ t('visitResult.interesado') }}</option>
                  <option value="NO_INTERESADO">{{ t('visitResult.noInteresado') }}</option>
                  <option value="PENDIENTE">{{ t('visitResult.pendiente') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ t('visitResult.observaciones') }}
                </label>
                <textarea
                  v-model="resultadoForm.observaciones"
                  rows="3"
                  class="app-input"
                  :placeholder="t('visitResult.observacionesPlaceholder')"
                />
              </div>
              <div class="flex justify-end">
                <FwbButton type="submit" :disabled="submittingResultado" color="blue">
                  {{ submittingResultado ? t('common.processing') : t('visitResult.register') }}
                </FwbButton>
              </div>
            </div>
          </form>
        </div>

        <!-- ── Resultado ya registrado (modo lectura) ── -->
        <div
          v-if="visit.resultado"
          class="app-card bg-gray-50/50 dark:bg-gray-800/50 p-5 space-y-2 transition-colors"
        >
          <div class="flex items-start gap-3">
            <IconLucideClipboardCheck class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div class="flex-1">
              <p class="text-xs text-secondary uppercase tracking-wide">
                {{ t('visitResult.resultado') }}
              </p>
              <p class="text-base font-semibold text-gray-800 dark:text-white">
                {{ getResultadoLabel(visit.resultado) }}
              </p>
              <p v-if="visit.observaciones" class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {{ visit.observaciones }}
              </p>
              <p v-if="visit.fechaRegistroResultado" class="mt-1 text-xs text-gray-400">
                {{ t('visitResult.registeredOn') }} {{ formatDate(visit.fechaRegistroResultado) }}
              </p>
            </div>
          </div>
        </div>

        <!-- ── Origin visit banner (if rescheduled from another) ──────── -->
        <div
          v-if="visit.originVisitId"
          class="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-5 py-4 transition-colors"
        >
          <IconLucideArrowUpDown class="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
          <p class="text-sm text-amber-700 dark:text-amber-300">
            {{ t('visitDetail.rescheduledFrom') }}
          </p>
          <RouterLink
            :to="`/visits/${visit.originVisitId}`"
            class="ml-auto text-xs text-amber-700 dark:text-amber-300 underline hover:text-amber-900 dark:hover:text-amber-100 shrink-0"
          >
            {{ t('visitDetail.viewOriginVisit') }}
          </RouterLink>
        </div>

        <!-- ── Rescheduled visit link (if this one was rescheduled into a new one) ── -->
        <RescheduledVisitLink
          v-if="visit.status === 'CANCELLED'"
          :visit-id="visit.id"
          :key="refreshKey"
        />

        <!-- ── Actions card ───────────────────────────────────────────── -->
        <div class="app-card p-6 space-y-4 transition-colors">
          <h2 class="text-sm font-bold text-secondary uppercase tracking-wide">
            {{ t('visitDetail.actions') }}
          </h2>

          <div class="flex flex-wrap gap-3">
            <!-- Cancel Visit -->
            <FwbButton
              v-if="visit.status !== 'CANCELLED'"
              @click="showCancelConfirm = true"
              :disabled="cancelling"
              color="red"
            >
              <div class="inline-flex items-center gap-2">
                <IconLucideXCircle class="w-4 h-4" />
                {{ cancelling ? t('common.processing') : t('visitDetail.cancelVisit') }}
              </div>
            </FwbButton>

            <!-- Reassign -->
            <ReassignButton
              v-if="visit.status !== 'CANCELLED'"
              :visit-id="visit.id"
              :visit-info="`${formatShortTime(visit.startTime, getLocaleString())} - ${visit.propertyName || visit.propertyId}`"
              @request-sent="handleReassignmentSent"
            />

            <!-- Reschedule (only CANCELLED) -->
            <RescheduleButton
              v-if="visit.status === 'CANCELLED'"
              :visit="visit"
              @rescheduled="onRescheduled"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Cancel confirmation modal -->
    <FwbModal v-if="showCancelConfirm" @close="showCancelConfirm = false">
      <template #header>
        <span class="text-red-600 dark:text-red-500">
          {{ t('visitDetail.confirmCancelTitle') }}
        </span>
      </template>
      <template #body>
        <p class="text-gray-600 dark:text-gray-300">{{ t('visitDetail.confirmCancelText') }}</p>
      </template>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <FwbButton @click="showCancelConfirm = false" color="alternative">
            {{ t('visitDetail.noKeep') }}
          </FwbButton>
          <FwbButton @click="executeCancel" color="red">
            {{ t('visitDetail.yesCancel') }}
          </FwbButton>
        </div>
      </template>
    </FwbModal>

    <!-- Alert toast -->
    <FwbAlert v-if="alertMessage" :type="alertType" class="fixed bottom-4 right-4 z-70 max-w-sm">
      {{ alertMessage }}
    </FwbAlert>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, reactive } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { apiClient as api } from '@/api';
  import { cancelVisit } from '@/services/calendarService';
  import {
    registerVisitResult,
    type RegisterResultadoPayload,
  } from '@/services/visitResultService';
  import { useAuthStore, type UserClaims } from '@/modules/auth';
  import { formatDate, formatShortTime } from '@/utils/dateTime';
  import { getLocaleString } from '@/locales/i18n';
  import { statusBadgeClass as getStatusBadgeClass } from '@/utils/styling';
  import { FwbButton, FwbModal, FwbAlert } from 'flowbite-vue';
  import type { Visit, RescheduleResponse, EventStatus } from '@/types/reschedule';
  import type { AxiosError } from 'axios';

  // ── RESCHEDULE HU — import the new components ─────────────────────────────
  import RescheduleButton from '@/components/visits/reschedule/RescheduleButton.vue';
  import RescheduledVisitLink from '@/components/visits/reschedule/RescheduledVisitLink.vue';
  // ── END RESCHEDULE HU ─────────────────────────────────────────────────────

  // ── REASSIGNMENT HU — import reassign button ──────────────────────────────
  import ReassignButton from '@/components/visits/reassignment/ReassignButton.vue';
  // ── END REASSIGNMENT HU ──────────────────────────────────────────────────

  // ── Icons ──────────────────────────────────────────────────────────────────
  import IconLucideArrowLeft from '~icons/lucide/arrow-left';
  import IconLucideXCircle from '~icons/lucide/x-circle';
  import IconLucideArrowUpDown from '~icons/lucide/arrow-up-down';
  import IconLucideClipboardCheck from '~icons/lucide/clipboard-check';

  const { t } = useI18n();

  // ── Route ─────────────────────────────────────────────────────────────────
  const route = useRoute();
  const visitId = route.params.id as string;

  // ── Auth ──────────────────────────────────────────────────────────────────
  const authStore = useAuthStore();
  const myAgentId = computed(() => {
    const u = authStore.user as UserClaims | null;
    return (u?.sub || u?.userId || '') as string;
  });

  // ── State ─────────────────────────────────────────────────────────────────
  const visit = ref<Visit | null>(null);
  const loading = ref(false);
  const fetchError = ref<string | null>(null);
  const refreshKey = ref(0); // incremented after rescheduling to force RescheduledVisitLink reload
  const cancelling = ref(false);
  const showCancelConfirm = ref(false);
  const alertMessage = ref('');
  const alertType = ref<'success' | 'danger' | 'warning' | 'info'>('danger');

  // ── State for resultado form ──────────────────────────────────────────────
  const resultadoForm = reactive({
    resultado: 'INTERESADO' as 'INTERESADO' | 'NO_INTERESADO' | 'PENDIENTE',
    observaciones: '',
  });
  const submittingResultado = ref(false);

  interface ApiErrorResponse {
    error?: string;
    message?: string;
    detail?: string;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMounted(loadVisit);

  async function loadVisit() {
    loading.value = true;
    fetchError.value = null;
    try {
      const response = await api.get(`/visits/${visitId}`);
      visit.value = response.data.data ?? response.data;
    } catch (e: unknown) {
      const axiosError = e as AxiosError<ApiErrorResponse>;
      fetchError.value = axiosError.response?.data?.error ?? t('visitDetail.loadError');
    } finally {
      loading.value = false;
    }
  }

  // ── Cancel Visit ──────────────────────────────────────────────────────────
  async function executeCancel() {
    if (!visit.value) return;
    showCancelConfirm.value = false;
    cancelling.value = true;
    try {
      await cancelVisit(visit.value.id, myAgentId.value);
      // Reload visit to get updated status
      await loadVisit();
      showAlertToast(t('visitDetail.cancelSuccess'), 'success');
    } catch {
      showAlertToast(t('visitDetail.cancelError'), 'danger');
    } finally {
      cancelling.value = false;
    }
  }

  // ── RESCHEDULE HU — handler called when rescheduling succeeds ────────────
  function onRescheduled(_response: RescheduleResponse) {
    // Increment refreshKey to force RescheduledVisitLink to re-query the API
    refreshKey.value++;
  }
  // ── END RESCHEDULE HU ─────────────────────────────────────────────────────

  // ── Reassignment handler ──────────────────────────────────────────────────
  function handleReassignmentSent() {
    loadVisit();
  }

  // ── Submit resultado ──────────────────────────────────────────────────────
  async function submitResultado() {
    if (!visit.value) return;
    submittingResultado.value = true;
    try {
      const updated = await registerVisitResult(
        visit.value.id,
        resultadoForm as RegisterResultadoPayload,
        myAgentId.value
      );
      // Actualizar la visita con los nuevos datos
      visit.value = { ...visit.value, ...updated };
      // Limpiar formulario
      resultadoForm.resultado = 'INTERESADO';
      resultadoForm.observaciones = '';
      showAlertToast(t('visitResult.success'), 'success');
    } catch (e) {
      console.error('Error registering resultado:', e);
      showAlertToast(t('visitResult.error'), 'danger');
    } finally {
      submittingResultado.value = false;
    }
  }

  // ── Helper para mostrar etiqueta del resultado ───────────────────────────
  function getResultadoLabel(resultado: string): string {
    const map: Record<string, string> = {
      INTERESADO: t('visitResult.interesado'),
      NO_INTERESADO: t('visitResult.noInteresado'),
      PENDIENTE: t('visitResult.pendiente'),
    };
    return map[resultado] || resultado;
  }

  // ── Alert toast ───────────────────────────────────────────────────────────
  function showAlertToast(msg: string, type: 'success' | 'danger' | 'warning' | 'info' = 'danger') {
    alertMessage.value = msg;
    alertType.value = type;
    setTimeout(() => {
      alertMessage.value = '';
    }, 4000);
  }

  // ── Computed — display helpers ────────────────────────────────────────────
  const statusLabel = computed(() => {
    const map: Record<EventStatus, string> = {
      SCHEDULED: t('rescheduleVisit.scheduledVisit'),
      CANCELLED: t('rescheduleVisit.cancelledVisit'),
      CONFIRMED: t('rescheduleVisit.confirmedVisit'),
      COMPLETED: t('rescheduleVisit.completedVisit'),
    };
    return visit.value ? (map[visit.value.status] ?? visit.value.status) : '';
  });

  const statusBadgeClass = computed(() => getStatusBadgeClass(visit.value?.status || ''));
</script>
