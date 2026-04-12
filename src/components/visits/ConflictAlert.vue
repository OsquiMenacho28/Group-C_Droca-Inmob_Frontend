<template>
  <div
    v-if="conflict.hasConflict"
    class="rounded-lg border border-red-300 bg-red-50 p-4 mb-4"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <IconLucideAlertTriangle class="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      <div class="flex-1">
        <h3 class="text-sm font-semibold text-red-800">
          Conflicto de horario detectado
        </h3>
        <p class="mt-1 text-sm text-red-700">{{ conflict.message }}</p>
      </div>
    </div>

    <div class="mt-3 ml-8">
      <p class="text-xs font-medium text-red-700 uppercase tracking-wide mb-2">
        Visitas ya programadas en ese horario:
      </p>
      <ul class="space-y-2">
        <li
          v-for="ev in conflict.conflictingEvents"
          :key="ev.id"
          class="flex items-center gap-2 text-sm text-red-800 bg-red-100 rounded px-3 py-2"
        >
          <IconLucideCalendar class="h-4 w-4 text-red-500" />
          <span>
            <strong>{{ ev.agentName }}</strong> —
            {{ formatTime(ev.startTime) }} a {{ formatTime(ev.endTime) }}
          </span>
        </li>
      </ul>
    </div>

    <div
      v-if="conflict.suggestedStartTime"
      class="mt-3 ml-8 rounded bg-amber-50 border border-amber-200 px-3 py-2"
    >
      <p class="text-xs font-medium text-amber-700 uppercase tracking-wide">
        Horario sugerido disponible:
      </p>
      <p class="text-sm text-amber-800 mt-1">
        🕐 {{ formatTime(conflict.suggestedStartTime) }} —
        {{ formatTime(conflict.suggestedEndTime!) }}
      </p>
      <button
        v-if="showUseSuggestion"
        @click="
          $emit(
            'use-suggestion',
            conflict.suggestedStartTime,
            conflict.suggestedEndTime
          )
        "
        type="button"
        class="mt-2 text-xs font-medium text-amber-700 underline hover:text-amber-900"
      >
        Usar este horario
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConflictResponse } from '@/types/visitCalendar';
import IconLucideAlertTriangle from '~icons/lucide/alert-triangle';
import IconLucideCalendar from '~icons/lucide/calendar';

defineProps<{
  conflict: ConflictResponse;
  showUseSuggestion?: boolean;
}>();

defineEmits<{
  (e: 'use-suggestion', start?: string, end?: string): void;
}>();

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>
