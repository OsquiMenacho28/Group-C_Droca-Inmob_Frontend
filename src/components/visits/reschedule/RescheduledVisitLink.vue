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
    <div
      class="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-2xl px-5 py-4 space-y-3 transition-colors"
    >
      <!-- Header -->
      <div class="flex items-center gap-2">
        <IconLucideArrowRight class="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        <p class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          {{ t('rescheduleVisit.visitWasRescheduled') }}
        </p>
      </div>

      <!-- One card per rescheduled visit (usually just one, but supports chain) -->
      <div
        v-for="visit in rescheduledVisits"
        :key="visit.id"
        class="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-800 px-4 py-3 transition-colors"
      >
        <div class="flex items-center gap-3">
          <!-- Status dot -->
          <span
            class="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            :class="statusDotClass(visit.status)"
          ></span>
          <div>
            <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
              {{ formatDate(visit.startTime) }} - {{ formatDate(visit.endTime) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
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
          <IconLucideChevronRight class="w-3.5 h-3.5" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useReschedule } from '@/composables/useReschedule';
  import type { EventStatus } from '@/types/reschedule';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';
  import IconLucideArrowRight from '~icons/lucide/arrow-right';
  import IconLucideChevronRight from '~icons/lucide/chevron-right';

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

  function statusLabel(status: EventStatus): string {
    const map: Record<EventStatus, string> = {
      SCHEDULED: t('rescheduleVisit.scheduledVisit'),
      CANCELLED: t('rescheduleVisit.cancelledVisit'),
      CONFIRMED: t('rescheduleVisit.confirmedVisit'),
      COMPLETED: t('rescheduleVisit.completedVisit'),
    };
    return map[status] ?? status;
  }

  function statusDotClass(status: EventStatus): string {
    const map: Record<EventStatus, string> = {
      SCHEDULED: 'bg-green-500',
      CANCELLED: 'bg-red-400',
      CONFIRMED: 'bg-blue-500',
      COMPLETED: 'bg-gray-400',
    };
    return map[status] ?? 'bg-gray-300';
  }
</script>
