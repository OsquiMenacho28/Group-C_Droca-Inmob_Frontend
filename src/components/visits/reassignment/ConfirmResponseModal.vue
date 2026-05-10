<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue && request"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-gray-700"
        >
          <div
            class="px-6 py-5 flex items-center gap-4"
            :class="
              isAccepting
                ? 'bg-linear-to-r from-green-500 to-green-700 dark:from-green-600 dark:to-green-800'
                : 'bg-linear-to-r from-red-500 to-red-700 dark:from-red-600 dark:to-red-800'
            "
          >
            <div class="bg-white/20 rounded-full p-2.5">
              <IconLucideCheck v-if="isAccepting" class="w-5 h-5 text-white" />
              <IconLucideX v-else class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-white font-semibold text-lg">
                {{
                  isAccepting
                    ? t('confirmResponseModal.acceptTitle')
                    : t('confirmResponseModal.rejectTitle')
                }}
              </h3>
              <p class="text-white/80 text-sm">
                {{
                  isAccepting
                    ? t('confirmResponseModal.acceptSubtitle')
                    : t('confirmResponseModal.rejectSubtitle')
                }}
              </p>
            </div>
          </div>

          <div class="px-6 py-5 space-y-4">
            <div
              class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <div class="flex gap-2">
                <span class="text-gray-400 dark:text-gray-500 w-28 shrink-0">
                  {{ t('confirmResponseModal.visitLabel') }}
                </span>
                <span
                  class="font-mono text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded"
                >
                  {{ request?.visitId }}
                </span>
              </div>
              <div class="flex gap-2">
                <span class="text-gray-400 dark:text-gray-500 w-28 shrink-0">
                  {{ t('confirmResponseModal.reasonLabel') }}
                </span>
                <span class="text-gray-700 dark:text-gray-300">{{ request?.reason }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ t('confirmResponseModal.commentLabel') }}
                <span class="text-gray-400 dark:text-gray-500 font-normal">
                  {{ t('confirmResponseModal.optionalLabel') }}
                </span>
              </label>
              <textarea
                v-model="comment"
                rows="2"
                :placeholder="
                  isAccepting
                    ? t('confirmResponseModal.acceptPlaceholder')
                    : t('confirmResponseModal.rejectPlaceholder')
                "
                class="w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
              />
            </div>
          </div>

          <div class="px-6 pb-6 flex gap-3 justify-end">
            <button
              @click="$emit('update:modelValue', false)"
              class="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover-row"
            >
              {{ t('confirmResponseModal.cancel') }}
            </button>
            <button
              @click="confirm"
              class="px-5 py-2.5 rounded-xl text-white text-sm font-medium transition"
              :class="
                isAccepting ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              "
            >
              {{
                isAccepting
                  ? t('confirmResponseModal.confirmAccept')
                  : t('confirmResponseModal.confirmReject')
              }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import IconLucideCheck from '~icons/lucide/check';
  import IconLucideX from '~icons/lucide/x';
  import type { ReassignmentSolicitation } from '@/types/reassignment';

  const { t } = useI18n();

  const props = defineProps<{
    modelValue: boolean;
    request: ReassignmentSolicitation | null;
    decision: 'ACCEPTED' | 'REJECTED';
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', val: boolean): void;
    (e: 'confirmed', payload: { comment?: string }): void;
  }>();

  const comment = ref('');
  const isAccepting = computed(() => props.decision === 'ACCEPTED');

  watch(
    () => props.modelValue,
    (open) => {
      if (open) comment.value = '';
    }
  );

  function confirm() {
    emit('confirmed', { comment: comment.value.trim() || undefined });
    emit('update:modelValue', false);
  }
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
