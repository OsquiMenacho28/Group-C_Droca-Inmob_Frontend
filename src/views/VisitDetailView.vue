<template>
  <!--
    VisitDetailView.vue
    Vista de detalle de una visita individual.

    Integrar todos los componentes de reprogramación.
    Muestra RescheduleButton (solo si CANCELADA) y RescheduledVisitLink.

    Ruta: /visits/:id
  -->
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Back link -->
      <RouterLink
        to="/calendar"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Volver a visitas
      </RouterLink>

      <!-- Loading skeleton -->
      <div v-if="loading" class="bg-white rounded-2xl p-8 animate-pulse space-y-4">
        <div class="h-6 bg-gray-200 rounded w-1/3"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>

      <!-- Error -->
      <div
        v-else-if="fetchError"
        class="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 text-sm"
      >
        {{ fetchError }}
      </div>

      <template v-else-if="visit">
        <!-- ── Main visit card ─────────────────────────────────────────── -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <!-- Status badge + title -->
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2"
                :class="statusBadgeClass"
              >
                {{ statusLabel }}
              </span>
              <h1 class="text-2xl font-bold text-gray-900">Detalle de visita</h1>
              <p class="text-gray-400 text-xs mt-1 font-mono">ID: {{ visit.id }}</p>
            </div>
          </div>

          <!-- Visit details grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Fecha programada
              </p>
              <p class="text-sm font-semibold text-gray-800 mt-1">
                {{ formatDate(visit.startTime) }} - {{ formatDate(visit.endTime) }}
              </p>
            </div>

            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide font-medium">Propiedad</p>
              <p class="text-sm font-semibold text-gray-800 mt-1">
                {{ visit.propertyId }}
              </p>
            </div>

            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide font-medium">Cliente</p>
              <p class="text-sm font-semibold text-gray-800 mt-1">
                {{ visit.clientId }}
              </p>
            </div>

            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide font-medium">Agente</p>
              <p class="text-sm font-semibold text-gray-800 mt-1">
                {{ visit.agentId }}
              </p>
            </div>

            <div v-if="visit.notes" class="sm:col-span-2">
              <p class="text-xs text-gray-400 uppercase tracking-wide font-medium">Notas</p>
              <p class="text-sm text-gray-700 mt-1">{{ visit.notes }}</p>
            </div>
          </div>
          <RescheduledVisitLink
            v-if="visit.status === 'CANCELLED'"
            :visit-id="visit.id"
            :key="refreshKey"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { apiClient as api } from '@/api';
  import type { Visit, EventStatus } from '@/types/reschedule';
  // import type { RescheduleResponse } from '@/types/reschedule';

  // ── RESCHEDULE HU — import the new components ─────────────────────────────
  // import RescheduleButton from '@/components/visits/reschedule/RescheduleButton.vue';
  import RescheduledVisitLink from '@/components/visits/reschedule/RescheduledVisitLink.vue';
  // ── END RESCHEDULE HU ─────────────────────────────────────────────────────

  // ── Route ─────────────────────────────────────────────────────────────────
  const route = useRoute();
  const visitId = route.params.id as string;

  // ── State ─────────────────────────────────────────────────────────────────
  const visit = ref<Visit | null>(null);
  const loading = ref(false);
  const fetchError = ref<string | null>(null);
  const refreshKey = ref(0); // incremented after rescheduling to force RescheduledVisitLink reload

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMounted(loadVisit);

  async function loadVisit() {
    loading.value = true;
    fetchError.value = null;
    try {
      const { data } = await api.get<Visit>(`/visits/${visitId}`);
      visit.value = data;
    } catch (e: any) {
      fetchError.value = e?.response?.data?.error ?? 'No se pudo cargar la visita.';
    } finally {
      loading.value = false;
    }
  }

  // ── RESCHEDULE HU — handler called when rescheduling succeeds ────────────
  // function onRescheduled(response: RescheduleResponse) {
  // Increment refreshKey to force RescheduledVisitLink to re-query the API
  // refreshKey.value++;
  // }
  // ── END RESCHEDULE HU ─────────────────────────────────────────────────────

  // ── Computed — display helpers ────────────────────────────────────────────
  const statusLabel = computed(() => {
    const map: Record<EventStatus, string> = {
      SCHEDULED: 'Programada',
      CANCELLED: 'Cancelada',
      CONFIRMED: 'Confirmada',
      COMPLETED: 'Realizada',
    };
    return visit.value ? (map[visit.value.status] ?? visit.value.status) : '';
  });

  const statusBadgeClass = computed(() => {
    const map: Record<EventStatus, string> = {
      SCHEDULED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-700',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-gray-100 text-gray-700',
    };
    return visit.value ? (map[visit.value.status] ?? 'bg-gray-100 text-gray-600') : '';
  });

  function formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-BO', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>
