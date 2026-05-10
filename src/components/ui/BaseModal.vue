<!-- components/ui/BaseModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
        @click.self="closeOnBackdrop ? $emit('update:modelValue', false) : null"
      >
        <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-6">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/80 transition-opacity" />

          <!-- Modal Panel - Flowbite standard sizing -->
          <div
            class="relative inline-block w-full transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all"
            :class="sizeClasses[size]"
          >
            <!-- Header -->
            <div
              class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-4 py-3 sm:px-6 sm:py-4"
            >
              <div class="flex items-center gap-3">
                <slot name="header-icon"></slot>
                <h3 class="text-lg font-semibold text-primary" id="modal-title">
                  <slot name="header">{{ title }}</slot>
                </h3>
              </div>
              <button
                v-if="showCloseButton"
                @click="$emit('update:modelValue', false)"
                class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
              >
                <IconLucideX class="h-5 w-5" />
              </button>
            </div>

            <!-- Body - Standardized spacing -->
            <div class="px-4 py-4 sm:px-6 sm:py-5">
              <slot name="body">
                <p class="text-secondary">{{ message }}</p>
              </slot>
            </div>

            <!-- Footer - Standardized button spacing -->
            <div
              v-if="$slots.footer"
              class="border-t border-gray-100 dark:border-gray-700 px-4 py-3 sm:px-6 sm:py-4"
            >
              <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <slot name="footer"></slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import IconLucideX from '~icons/lucide/x';

  withDefaults(
    defineProps<{
      modelValue: boolean;
      title?: string;
      message?: string;
      size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
      showCloseButton?: boolean;
      closeOnBackdrop?: boolean;
    }>(),
    {
      size: 'md',
      title: '',
      message: '',
      showCloseButton: true,
      closeOnBackdrop: true,
    }
  );

  defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    full: 'max-w-[90vw]',
  };
</script>
