<template>
  <div>
    <FwbButton @click="openModal" color="alternative" size="sm">
      <div class="inline-flex items-center gap-2">
        <IconLucideArrowLeftRight
          class="w-4 h-4 group-hover:rotate-180 transition-transform duration-300"
        />
        {{ t('reassignment.buttonLabel') }}
      </div>
    </FwbButton>

    <ReassignmentModal
      v-model="modalVisible"
      :visit-id="visitId"
      :visit-info="visitInfo"
      @request-sent="onRequestSent"
    />

    <FwbAlert
      v-if="toastVisible"
      type="success"
      class="fixed bottom-6 right-6 z-50 max-w-sm"
    >
      <div class="flex items-center gap-2">
        <IconLucideCircleCheck class="w-5 h-5" />
        {{ t('reassignment.toastSuccess') }}
      </div>
    </FwbAlert>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { FwbButton, FwbAlert } from 'flowbite-vue';
import ReassignmentModal from '@/components/visits/reassignment/ReassignmentModal.vue';
import IconLucideArrowLeftRight from '~icons/lucide/arrow-left-right';
import IconLucideCircleCheck from '~icons/lucide/circle-check';

const { t } = useI18n();

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
