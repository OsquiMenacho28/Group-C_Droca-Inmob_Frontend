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
      <IconLucideCalendar class="w-4 h-4 group-hover:scale-110 transition-transform" />
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
          <IconLucideCircleCheck class="w-5 h-5 text-green-400" />
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
  import IconLucideCalendar from '~icons/lucide/calendar';
  import IconLucideCircleCheck from '~icons/lucide/circle-check';

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
