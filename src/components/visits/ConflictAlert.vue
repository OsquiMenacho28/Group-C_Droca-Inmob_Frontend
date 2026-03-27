<template>
  <!-- 
    ConflictAlert.vue
    Componente reutilizable que muestra la alerta de conflicto de horario.
    HU1 PA2: alerta cuando se intenta programar una visita en horario ocupado.
    HU2 PA2: impide la creación y sugiere un horario alternativo.
  -->
  <div
    v-if="conflict.hasConflict"
    class="rounded-lg border border-red-300 bg-red-50 p-4 mb-4"
    role="alert"
  >
    <!-- Cabecera de alerta -->
    <div class="flex items-start gap-3">
      <svg class="mt-0.5 h-5 w-5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clip-rule="evenodd" />
      </svg>
      <div class="flex-1">
        <h3 class="text-sm font-semibold text-red-800">Conflicto de horario detectado</h3>
        <p class="mt-1 text-sm text-red-700">{{ conflict.message }}</p>
      </div>
    </div>

    <!-- Eventos conflictivos -->
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
          <svg class="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            <strong>{{ ev.agentName }}</strong> —
            {{ formatTime(ev.startTime) }} a {{ formatTime(ev.endTime) }}
          </span>
        </li>
      </ul>
    </div>

    <!-- Sugerencia de horario alternativo -->
    <div
      v-if="conflict.suggestedStartTime"
      class="mt-3 ml-8 rounded bg-amber-50 border border-amber-200 px-3 py-2"
    >
      <p class="text-xs font-medium text-amber-700 uppercase tracking-wide">
        Horario sugerido disponible:
      </p>
      <p class="text-sm text-amber-800 mt-1">
        🕐 {{ formatTime(conflict.suggestedStartTime) }} — {{ formatTime(conflict.suggestedEndTime!) }}
      </p>
      <button
        v-if="showUseSuggestion"
        @click="$emit('use-suggestion', conflict.suggestedStartTime, conflict.suggestedEndTime)"
        type="button"
        class="mt-2 text-xs font-medium text-amber-700 underline hover:text-amber-900"
      >
        Usar este horario
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConflictResponse } from '../../types/visitCalendar'

const props = defineProps<{
  conflict: ConflictResponse
  showUseSuggestion?: boolean
}>()

defineEmits<{
  (e: 'use-suggestion', start?: string, end?: string): void
}>()

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
