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
      <div class="flex justify-end gap-3 w-full">
        <fwb-button color="alternative" @click="$emit('close')" :disabled="loading">
          {{ cancelText || t('common.cancel') }}
        </fwb-button>
        <fwb-button :color="confirmButtonColor" @click="$emit('confirm')" :disabled="loading">
          <div class="flex items-center gap-2">
            <fwb-spinner v-if="loading" size="4" />
            {{ confirmText || t('common.accept') }}
          </div>
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { FwbModal, FwbButton, FwbSpinner } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import IconLucideAlertTriangle from '~icons/lucide/alert-triangle';
  import IconLucideInfo from '~icons/lucide/info';
  import IconLucideHelpCircle from '~icons/lucide/help-circle';

  const { t } = useI18n();

  const props = defineProps<{
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info' | 'question';
    loading?: boolean;
  }>();

  defineEmits<{
    (e: 'close'): void;
    (e: 'confirm'): void;
  }>();

  const icon = computed(() => {
    switch (props.type) {
      case 'danger':
      case 'warning':
        return IconLucideAlertTriangle;
      case 'info':
        return IconLucideInfo;
      case 'question':
        return IconLucideHelpCircle;
      default:
        return IconLucideAlertTriangle;
    }
  });

  const iconBgClass = computed(() => {
    switch (props.type) {
      case 'danger':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'question':
        return 'bg-purple-100 dark:bg-purple-900/30';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30';
    }
  });

  const iconColorClass = computed(() => {
    switch (props.type) {
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'question':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  });

  const confirmButtonColor = computed(() => {
    switch (props.type) {
      case 'danger':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'info':
        return 'blue';
      case 'question':
        return 'purple';
      default:
        return 'blue';
    }
  });
</script>
