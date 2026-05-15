<template>
  <FwbModal v-if="modelValue" @close="$emit('update:modelValue', false)" size="lg">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
          <IconLucideUsers class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 class="font-semibold text-lg dark:text-white">{{ t('reassignment.title') }}</h3>
          <p class="text-secondary text-sm">{{ t('reassignment.visitLabel') }} {{ visitInfo }}</p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="space-y-5">
        <FwbAlert v-if="errorMsg" type="danger">
          {{ errorMsg }}
        </FwbAlert>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('reassignment.selectColleague') }}
            <span class="text-red-500">*</span>
          </label>

          <div v-if="loadingAgents" class="flex items-center gap-2 text-secondary text-sm py-2">
            <IconLucideLoader class="animate-spin w-4 h-4" />
            {{ t('reassignment.loadingAgents') }}
          </div>

          <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div
              v-for="agent in agents"
              :key="agent.id"
              @click="form.destinationAgentId = agent.id"
              class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
              :class="
                form.destinationAgentId === agent.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              "
            >
              <input
                type="radio"
                :value="agent.id"
                v-model="form.destinationAgentId"
                class="sr-only"
              />
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                :class="
                  form.destinationAgentId === agent.id
                    ? 'bg-blue-600'
                    : 'bg-gray-400 dark:bg-gray-600'
                "
              >
                {{ agent.firstName.charAt(0).toUpperCase()
                }}{{ agent.lastName.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800 dark:text-white text-sm truncate">
                  {{ agent.firstName }} {{ agent.lastName }}
                </p>
                <p class="text-xs text-secondary truncate">
                  {{ agent.email }}
                </p>
              </div>
              <div
                v-if="form.destinationAgentId === agent.id"
                class="text-blue-500 dark:text-blue-400"
              >
                <IconLucideCircleCheck class="w-5 h-5" />
              </div>
            </div>

            <p
              v-if="!loadingAgents && agents.length === 0"
              class="text-sm text-secondary text-center py-4"
            >
              {{ t('reassignment.noAgents') }}
            </p>
          </div>

          <p v-if="errors.destinationAgentId" class="text-red-500 text-xs mt-1">
            {{ errors.destinationAgentId }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('reassignment.reasonLabel') }}
            <span class="text-red-500">*</span>
          </label>
          <FwbTextarea
            v-model="form.reason"
            :error="errors.reason"
            :placeholder="t('reassignment.reasonPlaceholder')"
            :rows="3"
            required
            class="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <div class="flex justify-end mt-1">
            <p class="text-xs text-gray-400 dark:text-gray-500">{{ form.reason.length }}/300</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-3 justify-end w-full">
        <FwbButton @click="$emit('update:modelValue', false)" color="alternative">
          {{ t('common.cancel') }}
        </FwbButton>
        <FwbButton @click="handleSubmit" :disabled="loading" gradient="blue">
          <IconLucideLoader v-if="loading" class="animate-spin w-4 h-4" />
          <span>{{ loading ? t('reassignment.sending') : t('reassignment.sendRequest') }}</span>
        </FwbButton>
      </div>
    </template>
  </FwbModal>
</template>

<script setup lang="ts">
  import { ref, watch, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { FwbModal, FwbButton, FwbAlert, FwbTextarea } from 'flowbite-vue';
  import type { AvailableAgent } from '@/types/reassignment';
  import reassignmentService from '@/services/reassignmentService';
  import { useAuthStore } from '@/modules/auth/stores/authStore';
  import IconLucideUsers from '~icons/lucide/users';
  import IconLucideCircleCheck from '~icons/lucide/circle-check';
  import IconLucideLoader from '~icons/lucide/loader';
  import { handleApiError } from '@/api/errorHandler';

  const { t } = useI18n();
  const authStore = useAuthStore();

  const props = defineProps<{
    modelValue: boolean;
    visitId: string;
    visitInfo?: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', val: boolean): void;
    (e: 'requestSent'): void;
  }>();

  const agents = ref<AvailableAgent[]>([]);
  const loadingAgents = ref(false);
  const loading = ref(false);
  const errorMsg = ref<string | null>(null);

  const form = reactive({
    destinationAgentId: '',
    reason: '',
  });

  const errors = reactive({
    destinationAgentId: '',
    reason: '',
  });

  watch(
    () => props.modelValue,
    async (open) => {
      if (open) {
        resetForm();
        await fetchAgents();
      }
    }
  );

  async function fetchAgents() {
    loadingAgents.value = true;
    errorMsg.value = null;
    try {
      const allAgents = await reassignmentService.getAvailableAgents();
      const currentUserId = authStore.user?.sub || authStore.user?.userId || authStore.user?.id;
      agents.value = allAgents.filter((a) => a.id !== currentUserId);
    } catch (e) {
      errorMsg.value = handleApiError(e).message;
    } finally {
      loadingAgents.value = false;
    }
  }

  function validate(): boolean {
    errors.destinationAgentId = '';
    errors.reason = '';
    let valid = true;

    if (!form.destinationAgentId) {
      errors.destinationAgentId = t('reassignment.validationSelect');
      valid = false;
    }
    if (!form.reason.trim() || form.reason.trim().length < 10) {
      errors.reason = t('reassignment.validationReasonMin');
      valid = false;
    }
    if (form.reason.length > 300) {
      errors.reason = t('reassignment.validationReasonMax');
      valid = false;
    }
    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;
    loading.value = true;
    errorMsg.value = null;
    try {
      await reassignmentService.requestReassignment(props.visitId, {
        destinationAgentId: form.destinationAgentId,
        reason: form.reason.trim(),
      });
      emit('requestSent');
      emit('update:modelValue', false);
    } catch (e: unknown) {
      errorMsg.value = handleApiError(e).message;
    } finally {
      loading.value = false;
    }
  }

  function resetForm() {
    form.destinationAgentId = '';
    form.reason = '';
    errors.destinationAgentId = '';
    errors.reason = '';
    errorMsg.value = null;
    agents.value = [];
  }
</script>
