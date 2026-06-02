<template>
  <fwb-modal v-if="show" @close="$emit('close')">
    <template #header>
      <div class="text-lg font-bold">{{ t('assignAgent.title') }}</div>
    </template>
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          {{ t('assignAgent.propertyLabel') }}
          <span class="font-bold">{{ property?.title }}</span>
        </p>
        <select
          v-model="selectedId"
          class="w-full border rounded-lg p-2.5 dark:bg-gray-700 dark:text-white"
        >
          <option :value="null" disabled>
            {{ t('assignAgent.placeholder') }}
          </option>
          <option v-for="a in agents" :key="a.id" :value="a.id">
            {{ a.fullName }} ({{ a.userType }})
          </option>
        </select>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <fwb-button color="alternative" @click="$emit('close')">
          {{ t('assignAgent.cancel') }}
        </fwb-button>
        <fwb-button :disabled="!selectedId" gradient="blue" @click="confirm">
          {{ t('assignAgent.confirm') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FwbModal, FwbButton } from 'flowbite-vue';
import type { Property } from '@/types/property';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Agent {
  id: string;
  fullName: string;
  userType: string;
  [key: string]: unknown;
}

defineProps<{ show: boolean; property: Property | null; agents: Agent[] }>();
const emit = defineEmits<{
  close: [];
  confirm: [agentId: string];
}>();
const selectedId = ref<string | null>(null);

const confirm = () => {
  if (selectedId.value) {
    emit('confirm', selectedId.value);
    selectedId.value = null;
  }
};
</script>
