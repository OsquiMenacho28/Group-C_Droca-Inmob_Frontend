<template>
  <Transition name="fade-slide">
    <div
      v-if="show"
      class="fixed bottom-5 right-5 z-100 flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-xl dark:text-gray-400 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
      role="alert"
    >
      <div
        :class="[
          'inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg',
          typeClasses[type],
        ]"
      >
        <component :is="typeIcons[type]" class="w-5 h-5" />
        <span class="sr-only">{{ type }} icon</span>
      </div>
      <div class="ms-3 text-sm font-normal">{{ message }}</div>
      <button
        type="button"
        class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        aria-label="Close"
        @click="$emit('close')"
      >
        <span class="sr-only">Close</span>
        <IconLucideX class="w-3 h-3" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import IconLucideCheck from '~icons/lucide/check';
  import IconLucideInfo from '~icons/lucide/info';
  import IconLucideAlertTriangle from '~icons/lucide/alert-triangle';
  import IconLucideX from '~icons/lucide/x';
  import { onMounted } from 'vue';

  const props = defineProps({
    show: Boolean,
    message: {
      type: String,
      default: '',
    },
    type: {
      type: String as () => 'success' | 'info' | 'warning' | 'error',
      default: 'success',
    },
    duration: {
      type: Number,
      default: 3000,
    },
  });

  const emit = defineEmits(['close']);

  const typeClasses = {
    success: 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200',
    info: 'text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200',
    warning: 'text-orange-500 bg-orange-100 dark:bg-orange-800 dark:text-orange-200',
    error: 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200',
  };

  const typeIcons = {
    success: IconLucideCheck,
    info: IconLucideInfo,
    warning: IconLucideAlertTriangle,
    error: IconLucideX,
  };

  onMounted(() => {
    if (props.show && props.duration > 0) {
      setTimeout(() => {
        emit('close');
      }, props.duration);
    }
  });
</script>

<style scoped>
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.3s ease;
  }
  .fade-slide-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
</style>
