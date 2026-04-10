<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <router-link
              to="/dashboard"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">Mis Solicitudes de Reasignación</h1>
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
          <svg
            :class="loading ? 'animate-spin' : ''"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refrescar
        </button>
      </div>

      <!-- Stats summary -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          <p class="text-xs text-gray-500 uppercase font-medium">Total enviadas</p>
        </div>
        <div class="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-yellow-700">{{ stats.pending }}</p>
          <p class="text-xs text-yellow-600 uppercase font-medium">Pendientes</p>
        </div>
        <div class="bg-green-50 rounded-xl border border-green-200 p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-green-700">{{ stats.accepted }}</p>
          <p class="text-xs text-green-600 uppercase font-medium">Aceptadas</p>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-5 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-700"
      >
        <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <p class="text-sm">{{ error }}</p>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="sentRequests.length === 0"
        class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
      >
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-1">No has enviado solicitudes</h3>
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

      <!-- Request cards -->
      <TransitionGroup name="list" tag="div" class="space-y-4" v-else>
        <div
          v-for="r in sentRequests"
          :key="r.id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- Card header -->
          <div
            class="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3"
            :class="{
              'bg-yellow-50/30': r.status === 'PENDING',
              'bg-green-50/30': r.status === 'ACCEPTED',
              'bg-red-50/30': r.status === 'REJECTED'
            }"
          >
            <div class="flex items-center gap-3">
              <!-- Avatar -->
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                :class="{
                  'bg-yellow-100': r.status === 'PENDING',
                  'bg-green-100': r.status === 'ACCEPTED',
                  'bg-red-100': r.status === 'REJECTED'
                }"
              >
                <svg
                  class="w-5 h-5"
                  :class="{
                    'text-yellow-600': r.status === 'PENDING',
                    'text-green-600': r.status === 'ACCEPTED',
                    'text-red-600': r.status === 'REJECTED'
                  }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-800 text-sm">
                  Para: <span class="font-mono text-xs">{{ r.destinationAgentId }}</span>
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
              <span v-if="r.status === 'PENDING'" class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-pulse"></span>
                Pendiente
              </span>
              <span v-else-if="r.status === 'ACCEPTED'" class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Aceptada
              </span>
              <span v-else class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                Rechazada
              </span>
            </span>
          </div>

          <!-- Card body -->
          <div class="px-5 py-4 space-y-3">
            <!-- Visit ID -->
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-gray-500">Cita ID:</span>
              <span class="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{{ r.visitId }}</span>
            </div>

            <!-- Reason -->
            <div
              class="rounded-xl px-4 py-3"
              :class="{
                'bg-yellow-50': r.status === 'PENDING',
                'bg-gray-50': r.status !== 'PENDING'
              }"
            >
              <p class="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                Motivo de la solicitud
              </p>
              <p class="text-sm text-gray-700">{{ r.reason }}</p>
            </div>

            <!-- Reply comment (if any) -->
            <div
              v-if="r.commentReply"
              class="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100"
            >
              <div class="flex items-center gap-2 mb-1">
                <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p class="text-xs font-medium text-blue-600 uppercase tracking-wide">
                  Respuesta de tu colega
                </p>
              </div>
              <p class="text-sm text-gray-700">{{ r.commentReply }}</p>
              <p v-if="r.repliedAt" class="text-[10px] text-gray-400 mt-2">
                Respondido el {{ formatDate(r.repliedAt) }}
              </p>
            </div>

            <!-- Waiting message for pending requests -->
            <div
              v-if="r.status === 'PENDING'"
              class="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2"
            >
              <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Esperando respuesta de tu colega...
            </div>

            <!-- Success message for accepted requests -->
            <div
              v-if="r.status === 'ACCEPTED'"
              class="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              ¡Tu colega ha aceptado la reasignación! La cita ahora está en su agenda.
            </div>

            <!-- Info message for rejected requests -->
            <div
              v-if="r.status === 'REJECTED'"
              class="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              Tu colega ha rechazado la solicitud. La cita sigue siendo tuya.
            </div>
          </div>

          <!-- Footer with action buttons (only for pending) -->
          <div v-if="r.status === 'PENDING'" class="px-5 pb-5">
            <div class="flex gap-3 pt-2 border-t border-gray-100">
              <button
                @click="cancelRequest(r.id)"
                :disabled="cancellingId === r.id"
                class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition"
              >
                <svg
                  v-if="cancellingId === r.id"
                  class="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span v-else>Cancelar solicitud</span>
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- Auto-refresh indicator -->
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
import { api } from '../services/api';
import type { ReassignmentSolicitation } from '../types/reassignment';
import Swal from 'sweetalert2';

// ── State ─────────────────────────────────────────────────────────────────
const sentRequests = ref<ReassignmentSolicitation[]>([]);
const loading = ref(false);
const error = ref('');
const cancellingId = ref<string | null>(null);
let intervalId: ReturnType<typeof setInterval> | null = null;

// ── Computed stats ────────────────────────────────────────────────────────
const stats = computed(() => {
  const total = sentRequests.value.length;
  const pending = sentRequests.value.filter(r => r.status === 'PENDING').length;
  const accepted = sentRequests.value.filter(r => r.status === 'ACCEPTED').length;
  const rejected = sentRequests.value.filter(r => r.status === 'REJECTED').length;
  return { total, pending, accepted, rejected };
});

// ── Methods ───────────────────────────────────────────────────────────────
async function load() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.get<ReassignmentSolicitation[]>('/api/reassignments/sent');
    sentRequests.value = data;
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Error al cargar tus solicitudes';
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
    cancelButtonText: 'No, mantener'
  });

  if (!result.isConfirmed) return;

  cancellingId.value = requestId;
  try {
    // Endpoint para cancelar solicitud pendiente (si existe)
    await api.delete(`/api/reassignments/${requestId}`);
    await load();
    Swal.fire({
      title: 'Cancelada',
      text: 'La solicitud ha sido cancelada',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (e: any) {
    Swal.fire({
      title: 'Error',
      text: e?.response?.data?.error || 'No se pudo cancelar la solicitud',
      icon: 'error',
      confirmButtonColor: '#dc2626'
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
    minute: '2-digit'
  });
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  load();
  // Auto-refresh every 30 seconds
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