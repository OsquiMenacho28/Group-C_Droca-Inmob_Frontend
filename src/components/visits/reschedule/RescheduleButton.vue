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
    <FwbButton @click="openModal" color="blue" class="inline-flex items-center gap-2">
      <IconLucideCalendar class="w-4 h-4 group-hover:scale-110 transition-transform" />
      {{ t('rescheduleVisit.submit') }}
    </FwbButton>

    <!-- Modal -->
    <RescheduleModal v-model="modalVisible" :visit="visit" @rescheduled="handleRescheduled" />

    <!-- Success toast -->
    <AppToast
      :show="toastVisible"
      :message="t('rescheduleVisit.successMessage')"
      type="success"
      @close="toastVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import RescheduleModal from './RescheduleModal.vue';
  import type { Visit, RescheduleResponse } from '@/types/reschedule';
  import { FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import IconLucideCalendar from '~icons/lucide/calendar';
  import AppToast from '@/components/ui/AppToast.vue';

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

<style scoped></style>
