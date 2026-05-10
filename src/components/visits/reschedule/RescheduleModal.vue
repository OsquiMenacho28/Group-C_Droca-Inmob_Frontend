<template>
  <!--
    RescheduleModal.vue
    Modal para reprogramar una visita cancelada.
    Muestra un selector de fecha/hora con validación de disponibilidad.

    Formulario modal para seleccionar nueva fecha y hora
    con validación de disponibilidad del agente y del inmueble.

    USO:
      <RescheduleModal v-model="modalVisible" :visit="visit" @rescheduled="handleRescheduled" />
  -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        @click.self="close"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <!-- Header -->
          <div
            class="bg-linear-to-r from-indigo-600 to-indigo-800 px-6 py-5 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="bg-white/20 rounded-full p-2">
                <IconLucideCalendar class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-white font-semibold text-lg">{{ t('rescheduleVisit.title') }}</h3>
                <p class="text-indigo-200 text-sm">
                  {{ t('rescheduleVisit.visitCancelledAt') }} {{ formatDate(visit?.startTime) }}
                </p>
              </div>
            </div>
            <FwbButton @click="close" class="text-white/70 hover:text-white transition-colors">
              <IconLucideX class="w-6 h-6" />
            </FwbButton>
          </div>

          <!-- Body -->
          <div class="px-6 py-6 space-y-5">
            <!-- Info banner -->
            <div
              class="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl px-4 py-3"
            >
              <IconLucideInfo
                class="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5"
              />
              <p class="text-sm text-indigo-700 dark:text-indigo-300">
                {{ t('rescheduleVisit.referenceInfo') }}
              </p>
            </div>

            <!-- Error banner -->
            <div
              v-if="error"
              class="flex items-start gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-sm"
            >
              <IconLucideCircleX class="w-4 h-4 shrink-0 mt-0.5" />
              {{ error }}
            </div>

            <!-- New date/time picker -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('rescheduleVisit.newStartTime') }}
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="newStartTime"
                type="datetime-local"
                :min="minDateTime"
                class="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition dark:bg-gray-700 dark:text-white"
                :class="dateError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'"
              />
              <p v-if="dateError" class="text-red-500 text-xs mt-1">{{ dateError }}</p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {{ t('rescheduleVisit.agentAndPropertyAvailability') }}
              </p>
            </div>

            <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p class="text-sm text-amber-800">
                {{ t('rescheduleVisit.editingVehicleNotAvailable') }}
              </p>
            </div>

            <!-- Optional notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                class="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-800 dark:text-white dark:bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
              />
              <p class="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">
                {{ notes.length }}/500
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 pb-6 flex gap-3 justify-end">
            <FwbButton
              @click="close"
              class="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover-row"
            >
              {{ t('common.cancel') }}
            </FwbButton>
            <FwbButton
              @click="handleSubmit"
              :disabled="loading"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <IconLucideLoader2 v-if="loading" class="animate-spin w-4 h-4" />
              <IconLucideCalendar v-else class="w-4 h-4" />
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
  import type { RescheduleResponse, Visit } from '@/types/reschedule';
  import { FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';
  import IconLucideCalendar from '~icons/lucide/calendar';
  import IconLucideX from '~icons/lucide/x';
  import IconLucideInfo from '~icons/lucide/info';
  import IconLucideCircleX from '~icons/lucide/circle-x';
  import IconLucideLoader2 from '~icons/lucide/loader-2';

  const { t } = useI18n();

  // ── Props & Emits ─────────────────────────────────────────────────────────
  const props = defineProps<{
    modelValue: boolean; // v-model: controls visibility
    visit: Visit; // The cancelled visit to reschedule
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', val: boolean): void;
    (e: 'rescheduled', response: RescheduleResponse): void;
  }>();

  // ── Composable ────────────────────────────────────────────────────────────
  const { loading, error, reschedule } = useReschedule();

  // ── Local state ───────────────────────────────────────────────────────────
  const newStartTime = ref('');
  const notes = ref('');
  const dateError = ref('');

  // Minimum selectable datetime = now + 30 minutes (rounded to next hour)
  const minDateTime = computed(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    return now.toISOString().slice(0, 16);
  });

  // Calculate the duration of the original visit
  const visitDuration = computed(() => {
    if (!props.visit?.startTime || !props.visit?.endTime) return 0;
    const start = new Date(props.visit.startTime).getTime();
    const end = new Date(props.visit.endTime).getTime();
    return end - start; // in milliseconds
  });

  // Reset form when modal opens
  watch(
    () => props.modelValue,
    (open) => {
      if (open) {
        newStartTime.value = '';
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
    if (!newStartTime.value) {
      dateError.value = t('rescheduleVisit.newDateTimeRequired');
      return false;
    }
    const selected = new Date(newStartTime.value);
    if (selected <= new Date()) {
      dateError.value = t('rescheduleVisit.newDateTimeFuture');
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;

    // Convert datetime-local strings to ISO-8601 (backend expects LocalDateTime format)
    const newStartTimeISO = new Date(newStartTime.value).toISOString().slice(0, 19);
    const newEndTimeDate = new Date(new Date(newStartTime.value).getTime() + visitDuration.value);
    const newEndTimeISO = newEndTimeDate.toISOString().slice(0, 19);

    const result = await reschedule(
      props.visit.id,
      props.visit.agentId,
      newStartTimeISO,
      newEndTimeISO,
      notes.value.trim() || undefined
    );

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
