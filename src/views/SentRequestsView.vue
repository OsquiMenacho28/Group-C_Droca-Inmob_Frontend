<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <router-link
              to="/dashboard"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <IconLucideArrowLeft class="h-5 w-5" />
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">
              Mis Solicitudes de Reasignación
            </h1>
          </div>
          <p class="text-gray-500 text-sm mt-1">
            Estado de las solicitudes que has enviado a tus colegas
          </p>
        </div>
        <button
          @click="load"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
        >
          <IconLucideRefreshCw
            class="w-4 h-4"
            :class="loading ? 'animate-spin' : ''"
          />
          Refrescar
        </button>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div
          class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm"
        >
          <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          <p class="text-xs text-gray-500 uppercase font-medium">
            Total enviadas
          </p>
        </div>
        <div
          class="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-center shadow-sm"
        >
          <p class="text-2xl font-bold text-yellow-700">{{ stats.pending }}</p>
          <p class="text-xs text-yellow-600 uppercase font-medium">
            Pendientes
          </p>
        </div>
        <div
          class="bg-green-50 rounded-xl border border-green-200 p-4 text-center shadow-sm"
        >
          <p class="text-2xl font-bold text-green-700">{{ stats.accepted }}</p>
          <p class="text-xs text-green-600 uppercase font-medium">Aceptadas</p>
        </div>
      </div>

      <div v-if="loading" class="space-y-3">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white rounded-2xl p-5 animate-pulse"
        >
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-700"
      >
        <IconLucideAlertCircle class="w-5 h-5 shrink-0" />
        <p class="text-sm">{{ error }}</p>
      </div>

      <div
        v-else-if="sentRequests.length === 0"
        class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
      >
        <div
          class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <IconLucideArrowLeftRight class="w-8 h-8 text-blue-500" />
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-1">
          No has enviado solicitudes
        </h3>
        <p class="text-gray-500 text-sm">
          Cuando solicites una reasignación desde el calendario, aparecerá aquí.
        </p>
        <router-link
          to="/calendar"
          class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          Ir al Calendario
        </router-link>
      </div>

      <TransitionGroup name="list" tag="div" class="space-y-4" v-else>
        <div
          v-for="r in sentRequests"
          :key="r.id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div
            class="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3"
            :class="{
              'bg-yellow-50/30': r.status === 'PENDING',
              'bg-green-50/30': r.status === 'ACCEPTED',
              'bg-red-50/30': r.status === 'REJECTED',
            }"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                :class="{
                  'bg-yellow-100': r.status === 'PENDING',
                  'bg-green-100': r.status === 'ACCEPTED',
                  'bg-red-100': r.status === 'REJECTED',
                }"
              >
                <IconLucideUser
                  class="w-5 h-5"
                  :class="{
                    'text-yellow-600': r.status === 'PENDING',
                    'text-green-600': r.status === 'ACCEPTED',
                    'text-red-600': r.status === 'REJECTED',
                  }"
                />
              </div>
              <div>
                <p class="font-semibold text-gray-800 text-sm">
                  Para:
                  <span class="font-mono text-xs">{{
                    r.destinationAgentId
                  }}</span>
                </p>
                <p class="text-xs text-gray-500">
                  Enviada el {{ formatDate(r.requestedAt) }}
                </p>
              </div>
            </div>
            <span
              :class="statusBadgeClass(r.status)"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
            >
              <span
                v-if="r.status === 'PENDING'"
                class="flex items-center gap-1"
              >
                <span
                  class="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-pulse"
                ></span>
                Pendiente
              </span>
              <span
                v-else-if="r.status === 'ACCEPTED'"
                class="flex items-center gap-1"
              >
                <IconLucideCheck class="w-3 h-3" />
                Aceptada
              </span>
              <span v-else class="flex items-center gap-1">
                <IconLucideX class="w-3 h-3" />
                Rechazada
              </span>
            </span>
          </div>

          <div class="px-5 py-4 space-y-3">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <IconLucideCalendar class="w-4 h-4 text-gray-400 shrink-0" />
              <span class="text-gray-500">Cita ID:</span>
              <span class="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{{
                r.visitId
              }}</span>
            </div>

            <div
              class="rounded-xl px-4 py-3"
              :class="{
                'bg-yellow-50': r.status === 'PENDING',
                'bg-gray-50': r.status !== 'PENDING',
              }"
            >
              <p
                class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide"
              >
                Motivo de la solicitud
              </p>
              <p class="text-sm text-gray-700">{{ r.reason }}</p>
            </div>

            <div
              v-if="r.commentReply"
              class="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100"
            >
              <div class="flex items-center gap-2 mb-1">
                <IconLucideMessageCircle class="w-3.5 h-3.5 text-blue-500" />
                <p
                  class="text-xs font-medium text-blue-600 uppercase tracking-wide"
                >
                  Respuesta de tu colega
                </p>
              </div>
              <p class="text-sm text-gray-700">{{ r.commentReply }}</p>
              <p v-if="r.repliedAt" class="text-[10px] text-gray-400 mt-2">
                Respondido el {{ formatDate(r.repliedAt) }}
              </p>
            </div>

            <div
              v-if="r.status === 'PENDING'"
              class="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2"
            >
              <IconLucideClock class="w-4 h-4 animate-pulse" />
              Esperando respuesta de tu colega...
            </div>

            <div
              v-if="r.status === 'ACCEPTED'"
              class="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2"
            >
              <IconLucideCircleCheck class="w-4 h-4" />
              ¡Tu colega ha aceptado la reasignación! La cita ahora está en su
              agenda.
            </div>

            <div
              v-if="r.status === 'REJECTED'"
              class="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2"
            >
              <IconLucideAlertCircle class="w-4 h-4" />
              Tu colega ha rechazado la solicitud. La cita sigue siendo tuya.
            </div>
          </div>

          <div v-if="r.status === 'PENDING'" class="px-5 pb-5">
            <div class="flex gap-3 pt-2 border-t border-gray-100">
              <button
                @click="cancelRequest(r.id)"
                :disabled="cancellingId === r.id"
                class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition"
              >
                <IconLucideLoader
                  v-if="cancellingId === r.id"
                  class="w-4 h-4 animate-spin"
                />
                <span v-else>Cancelar solicitud</span>
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="sentRequests.length > 0 && !loading" class="text-center">
        <p class="text-[10px] text-gray-400">
          Actualizando automáticamente cada 30 segundos
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { api } from '@/services/api';
import type { ReassignmentSolicitation } from '@/types/reassignment';
import Swal from 'sweetalert2';
import IconLucideArrowLeft from '~icons/lucide/arrow-left';
import IconLucideRefreshCw from '~icons/lucide/refresh-cw';
import IconLucideAlertCircle from '~icons/lucide/alert-circle';
import IconLucideArrowLeftRight from '~icons/lucide/arrow-left-right';
import IconLucideUser from '~icons/lucide/user';
import IconLucideCheck from '~icons/lucide/check';
import IconLucideX from '~icons/lucide/x';
import IconLucideCalendar from '~icons/lucide/calendar';
import IconLucideMessageCircle from '~icons/lucide/message-circle';
import IconLucideClock from '~icons/lucide/clock';
import IconLucideCircleCheck from '~icons/lucide/circle-check';
import IconLucideLoader from '~icons/lucide/loader';

const sentRequests = ref<ReassignmentSolicitation[]>([]);
const loading = ref(false);
const error = ref('');
const cancellingId = ref<string | null>(null);
let intervalId: ReturnType<typeof setInterval> | null = null;

const stats = computed(() => {
  const total = sentRequests.value.length;
  const pending = sentRequests.value.filter(
    (r) => r.status === 'PENDING'
  ).length;
  const accepted = sentRequests.value.filter(
    (r) => r.status === 'ACCEPTED'
  ).length;
  const rejected = sentRequests.value.filter(
    (r) => r.status === 'REJECTED'
  ).length;
  return { total, pending, accepted, rejected };
});

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get<ReassignmentSolicitation[]>(
      '/api/reassignments/sent'
    );
    sentRequests.value = data;
  } catch {
    error.value = 'Error al cargar tus solicitudes';
  } finally {
    loading.value = false;
  }
}

async function cancelRequest(requestId: string) {
  const result = await Swal.fire({
    title: '¿Cancelar solicitud?',
    text: '¿Estás seguro de que deseas cancelar esta solicitud de reasignación?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'No, mantener',
  });

  if (!result.isConfirmed) return;

  cancellingId.value = requestId;
  try {
    await api.delete(`/api/reassignments/${requestId}`);
    await load();
    Swal.fire({
      title: 'Cancelada',
      text: 'La solicitud ha sido cancelada',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    });
  } catch {
    Swal.fire({
      title: 'Error',
      text: 'No se pudo cancelar la solicitud',
      icon: 'error',
      confirmButtonColor: '#dc2626',
    });
  } finally {
    cancellingId.value = null;
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'ACCEPTED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(() => {
  load();
  intervalId = setInterval(load, 30000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
