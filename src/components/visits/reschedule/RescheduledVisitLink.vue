<template>
  <!--
    RescheduledVisitLink.vue
    Muestra un enlace a la nueva visita creada a partir de una visita cancelada.
    Se carga automáticamente al montar consultando /visits/{id}/rescheduled.

    Una vez reprogramada, mostrar enlace a la nueva visita
    creada desde el registro de la visita cancelada original.

    USO en VisitDetailView.vue (sección inferior, solo si visit.status === 'CANCELLED'):
      <RescheduledVisitLink :visit-id="visit.id" />
  -->
  <div v-if="hasRescheduled" class="mt-4">
    <!-- Banner with link(s) -->
    <div class="bg-indigo-50 border border-indigo-200 rounded-2xl px-5 py-4 space-y-3">
      <!-- Header -->
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
        <p class="text-sm font-semibold text-indigo-700">
          {{ t('rescheduleVisit.visitWasRescheduled') }}
        </p>
      </div>

      <!-- One card per rescheduled visit (usually just one, but supports chain) -->
      <div
        v-for="visit in rescheduledVisits"
        :key="visit.id"
        class="flex items-center justify-between bg-white rounded-xl border border-indigo-100 px-4 py-3"
      >
        <div class="flex items-center gap-3">
          <!-- Status dot -->
          <span
            class="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            :class="statusDotClass(visit.status)"
          ></span>
          <div>
            <p class="text-sm font-medium text-gray-800">
              {{ formatDate(visit.dateTime) }}
            </p>
            <p class="text-xs text-gray-500">
              {{ statusLabel(visit.status) }}
            </p>
          </div>
        </div>

        <!-- Link to new visit detail -->
        <RouterLink
          :to="`/visits/${visit.id}`"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition shrink-0"
        >
          {{ t('rescheduleVisit.viewVisit') }}
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useReschedule } from '@/composables/useReschedule';
  import type { VisitStatus } from '@/types/reschedule';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';

  const { t } = useI18n();

  // ── Props ─────────────────────────────────────────────────────────────────
  const props = defineProps<{
    visitId: string; // ID of the original cancelled visit
  }>();

  // ── Composable ────────────────────────────────────────────────────────────
  const { rescheduledVisits, loadRescheduledVisits } = useReschedule();

  // ── Computed ──────────────────────────────────────────────────────────────
  const hasRescheduled = computed(() => rescheduledVisits.value.length > 0);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMounted(() => loadRescheduledVisits(props.visitId));

  // ── Helpers ───────────────────────────────────────────────────────────────
  function formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(getLocaleString(), {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function statusLabel(status: VisitStatus): string {
    const map: Record<VisitStatus, string> = {
      SCHEDULED: t('rescheduleVisit.scheduledVisit'),
      CANCELLED: t('rescheduleVisit.cancelledVisit'),
      COMPLETED: t('rescheduleVisit.completedVisit'),
    };
    return map[status] ?? status;
  }

  function statusDotClass(status: VisitStatus): string {
    const map: Record<VisitStatus, string> = {
      SCHEDULED: 'bg-green-500',
      CANCELLED: 'bg-red-400',
      COMPLETED: 'bg-gray-400',
    };
    return map[status] ?? 'bg-gray-300';
  }
</script>
