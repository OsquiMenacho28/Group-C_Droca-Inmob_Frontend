<template>
  <div>
    <button
      @click="openModal"
      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-amber-400 bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 hover:border-amber-500 transition-all group"
    >
      <IconLucideArrowLeftRight
        class="w-4 h-4 group-hover:rotate-180 transition-transform duration-300"
      />
      Solicitar Reasignación
    </button>

    <ReassignmentModal
      v-model="modalVisible"
      :visit-id="visitId"
      :visit-info="visitInfo"
      @request-sent="onRequestSent"
    />

    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toastVisible"
          class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium"
        >
          <IconLucideCircleCheck class="w-5 h-5 text-green-400" />
          Solicitud enviada! Tu colega será notificado.
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ReassignmentModal from '@/components/visits/reassignment/ReassignmentModal.vue';
import IconLucideArrowLeftRight from '~icons/lucide/arrow-left-right';
import IconLucideCircleCheck from '~icons/lucide/circle-check';

defineProps<{
  visitId: string;
  visitInfo?: string;
}>();

const emit = defineEmits<{
  (e: 'requestSent'): void;
}>();

const modalVisible = ref(false);
const toastVisible = ref(false);

function openModal() {
  modalVisible.value = true;
}

function onRequestSent() {
  showToast();
  emit('requestSent');
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
