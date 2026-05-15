<template>
  <BaseModal
    :model-value="modelValue && !!request"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center gap-4">
        <div
          class="rounded-full p-2.5"
          :class="
            isAccepting ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'
          "
        >
          <IconLucideCheck v-if="isAccepting" class="w-5 h-5 text-green-600 dark:text-green-400" />
          <IconLucideX v-else class="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 class="text-primary font-bold text-lg">
            {{
              isAccepting
                ? t('confirmResponseModal.acceptTitle')
                : t('confirmResponseModal.rejectTitle')
            }}
          </h3>
          <p class="text-secondary text-sm">
            {{
              isAccepting
                ? t('confirmResponseModal.acceptSubtitle')
                : t('confirmResponseModal.rejectSubtitle')
            }}
          </p>
        </div>
      </div>
    </template>

    <!-- Body -->
    <div class="space-y-4">
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
          class="app-input resize-none py-3"
        />
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex gap-3 justify-end w-full">
        <button
          @click="$emit('update:modelValue', false)"
          class="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover-row"
        >
          {{ t('confirmResponseModal.cancel') }}
        </button>
        <button
          @click="confirm"
          class="px-5 py-2.5 rounded-xl text-white text-sm font-medium transition"
          :class="isAccepting ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'"
        >
          {{
            isAccepting
              ? t('confirmResponseModal.confirmAccept')
              : t('confirmResponseModal.confirmReject')
          }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import IconLucideCheck from '~icons/lucide/check';
  import IconLucideX from '~icons/lucide/x';
  import BaseModal from '@/components/ui/BaseModal.vue';
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
