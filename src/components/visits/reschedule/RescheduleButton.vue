<template>
  <!--
    RescheduleButton.vue
    Botón "Reprogramar" visible únicamente cuando la visita está en estado CANCELADA.
    Al hacer clic abre el RescheduleModal.

    Mostrar botón "Reprogramar" en la vista de detalle
    de visitas con estado `cancelada`.

    USO en VisitDetailView.vue:
      <RescheduleButton
        :visit="visit"
        @rescheduled="onRescheduled"
      />
  -->
  <div v-if="isCancelled">
    <!-- Reschedule button -->
    <FwbButton
      @click="openModal"
      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-indigo-400 bg-indigo-50 text-white text-sm font-medium hover:bg-indigo-100 hover:border-indigo-500 transition-all group"
    >
      <svg
        class="w-4 h-4 group-hover:scale-110 transition-transform"
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
      {{ t('rescheduleVisit.submit') }}
    </FwbButton>

    <!-- Modal -->
    <RescheduleModal v-model="modalVisible" :visit="visit" @rescheduled="handleRescheduled" />

    <!-- Success toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toastVisible"
          class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium"
        >
          <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          {{ t('rescheduleVisit.successMessage') }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import RescheduleModal from './RescheduleModal.vue';
  import type { Visit, RescheduleResponse } from '@/types/reschedule';
  import { FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  // ── Props & Emits ─────────────────────────────────────────────────────────
  const props = defineProps<{
    visit: Visit;
  }>();

  const emit = defineEmits<{
    (e: 'rescheduled', response: RescheduleResponse): void;
  }>();

  // ── Computed ──────────────────────────────────────────────────────────────
  /** Only render the button when the visit is CANCELLED (PA3 compliance) */
  const isCancelled = computed(() => props.visit.status === 'CANCELLED');

  // ── State ─────────────────────────────────────────────────────────────────
  const modalVisible = ref(false);
  const toastVisible = ref(false);

  // ── Methods ───────────────────────────────────────────────────────────────
  function openModal() {
    modalVisible.value = true;
  }

  function handleRescheduled(response: RescheduleResponse) {
    showToast();
    emit('rescheduled', response);
  }

  function showToast() {
    toastVisible.value = true;
    setTimeout(() => (toastVisible.value = false), 4000);
  }
</script>

<style scoped>
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }
  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateY(12px);
  }
</style>
