<template>
  <fwb-modal v-if="show" @close="$emit('close')" size="md">
    <template #header>
      <div class="flex items-center gap-3">
        <div :class="iconBgClass" class="p-2 rounded-full">
          <component :is="icon" :class="iconColorClass" class="w-5 h-5" />
        </div>
        <h3 class="text-xl font-bold dark:text-white">{{ title }}</h3>
      </div>
    </template>
    <template #body>
      <p class="text-gray-500 dark:text-gray-400">
        {{ message }}
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <fwb-button :color="buttonColor" @click="$emit('close')">
          {{ buttonText || t('common.ok') }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { FwbModal, FwbButton } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import IconLucideCheckCircle from '~icons/lucide/check-circle';
  import IconLucideXCircle from '~icons/lucide/x-circle';
  import IconLucideInfo from '~icons/lucide/info';

  const { t } = useI18n();

  const props = defineProps<{
    show: boolean;
    title: string;
    message: string;
    buttonText?: string;
    type?: 'success' | 'error' | 'info';
  }>();

  defineEmits<{
    (e: 'close'): void;
  }>();

  const icon = computed(() => {
    switch (props.type) {
      case 'success':
        return IconLucideCheckCircle;
      case 'error':
        return IconLucideXCircle;
      case 'info':
        return IconLucideInfo;
      default:
        return IconLucideInfo;
    }
  });

  const iconBgClass = computed(() => {
    switch (props.type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30';
    }
  });

  const iconColorClass = computed(() => {
    switch (props.type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  });

  const buttonColor = computed(() => {
    switch (props.type) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'info':
        return 'blue';
      default:
        return 'blue';
    }
  });
</script>
