<template>
  <!--
    RescheduleModal.vue
    Modal para reprogramar una visita cancelada.
    Muestra un selector de fecha/hora con validación de disponibilidad.

    Formulario modal para seleccionar nueva fecha y hora
    con validación de disponibilidad del agente y del inmueble.

    USO:
      <RescheduleModal
        v-model="showModal"
        :visit-id="visit.id"
        :visit-info="visit.dateTime"
        @rescheduled="onRescheduled"
      />
  -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div
            class="bg-linear-to-r from-indigo-600 to-indigo-800 px-6 py-5 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="bg-white/20 rounded-full p-2">
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-white font-semibold text-lg">{{ t('rescheduleVisit.title') }}</h3>
                <p class="text-indigo-200 text-sm">
                  {{ t('rescheduleVisit.visitCancelledAt') }} {{ formatDate(visitInfo) }}
                </p>
              </div>
            </div>
            <FwbButton @click="close" class="text-white/70 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </FwbButton>
          </div>

          <!-- Body -->
          <div class="px-6 py-6 space-y-5">
            <!-- Info banner -->
            <div
              class="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3"
            >
              <svg
                class="w-5 h-5 text-indigo-500 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-sm text-indigo-700">
                {{ t('rescheduleVisit.referenceInfo') }}
              </p>
            </div>

            <!-- Error banner -->
            <div
              v-if="error"
              class="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
            >
              <svg class="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ error }}
            </div>

            <!-- New date/time picker -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('rescheduleVisit.newDateTime') }}
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="newDateTime"
                type="datetime-local"
                :min="minDateTime"
                class="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                :class="dateError ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="dateError" class="text-red-500 text-xs mt-1">{{ dateError }}</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ t('rescheduleVisit.agentAndPropertyAvailability') }}
              </p>
            </div>

            <!-- Optional notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('rescheduleVisit.notes') }}
                <span class="text-gray-400 font-normal">
                  {{ t('rescheduleVisit.optionalLabel') }}
                </span>
              </label>
              <textarea
                v-model="notes"
                rows="2"
                maxlength="500"
                :placeholder="t('rescheduleVisit.notesPlaceholder')"
                class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
              />
              <p class="text-xs text-gray-400 text-right mt-1">{{ notes.length }}/500</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 pb-6 flex gap-3 justify-end">
            <FwbButton
              @click="close"
              class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
            >
              {{ t('common.cancel') }}
            </FwbButton>
            <FwbButton
              @click="handleSubmit"
              :disabled="loading"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {{ loading ? t('common.rescheduling') : t('rescheduleVisit.confirmReschedule') }}
            </FwbButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useReschedule } from '@/composables/useReschedule';
  import type { RescheduleResponse } from '@/types/reschedule';
  import { FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';

  const { t } = useI18n();

  // ── Props & Emits ─────────────────────────────────────────────────────────
  const props = defineProps<{
    modelValue: boolean; // v-model: controls visibility
    visitId: string; // ID of the cancelled visit to reschedule
    visitInfo?: string; // ISO datetime of the original visit (for display)
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', val: boolean): void;
    (e: 'rescheduled', response: RescheduleResponse): void;
  }>();

  // ── Composable ────────────────────────────────────────────────────────────
  const { loading, error, reschedule } = useReschedule();

  // ── Local state ───────────────────────────────────────────────────────────
  const newDateTime = ref('');
  const notes = ref('');
  const dateError = ref('');

  // Minimum selectable datetime = now + 30 minutes (rounded to next hour)
  const minDateTime = computed(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    return now.toISOString().slice(0, 16);
  });

  // Reset form when modal opens
  watch(
    () => props.modelValue,
    (open) => {
      if (open) {
        newDateTime.value = '';
        notes.value = '';
        dateError.value = '';
        error.value = null;
      }
    }
  );

  // ── Methods ───────────────────────────────────────────────────────────────
  function close() {
    emit('update:modelValue', false);
  }

  function validate(): boolean {
    dateError.value = '';
    if (!newDateTime.value) {
      dateError.value = t('rescheduleVisit.newDateTimeRequired');
      return false;
    }
    const selected = new Date(newDateTime.value);
    if (selected <= new Date()) {
      dateError.value = t('rescheduleVisit.newDateTimeFuture');
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;

    // Convert datetime-local string to ISO-8601 (backend expects LocalDateTime format)
    const isoDateTime = new Date(newDateTime.value).toISOString().slice(0, 19);

    const result = await reschedule(props.visitId, isoDateTime, notes.value.trim() || undefined);

    if (result) {
      emit('rescheduled', result);
      close();
    }
  }

  function formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(getLocaleString(), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
