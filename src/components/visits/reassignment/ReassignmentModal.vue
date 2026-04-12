<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div
            class="bg-linear-to-r from-blue-600 to-blue-800 px-6 py-5 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="bg-white/20 rounded-full p-2">
                <IconLucideUsers class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-white font-semibold text-lg">
                  Request Reassignment
                </h3>
                <p class="text-blue-200 text-sm">visit: {{ visitInfo }}</p>
              </div>
            </div>
            <button
              @click="$emit('update:modelValue', false)"
              class="text-white/70 hover:text-white transition-colors"
            >
              <IconLucideX class="w-6 h-6" />
            </button>
          </div>

          <div class="px-6 py-6 space-y-5">
            <div
              v-if="errorMsg"
              class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
            >
              <IconLucideAlertCircle class="w-4 h-4 shrink-0" />
              {{ errorMsg }}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select target colleague <span class="text-red-500">*</span>
              </label>

              <div
                v-if="loadingAgents"
                class="flex items-center gap-2 text-gray-500 text-sm py-2"
              >
                <IconLucideLoader class="animate-spin w-4 h-4" />
                Loading agents...
              </div>

              <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-1">
                <label
                  v-for="agent in agents"
                  :key="agent.id"
                  class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                  :class="
                    form.destinationAgentId === agent.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
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
                        : 'bg-gray-400'
                    "
                  >
                    {{ agent.firstName.charAt(0).toUpperCase()
                    }}{{ agent.lastName.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-800 text-sm truncate">
                      {{ agent.firstName }} {{ agent.lastName }}
                    </p>
                    <p class="text-xs text-gray-500 truncate">
                      {{ agent.email }}
                    </p>
                  </div>
                  <div
                    v-if="form.destinationAgentId === agent.id"
                    class="text-blue-500"
                  >
                    <IconLucideCircleCheck class="w-5 h-5" />
                  </div>
                </label>

                <p
                  v-if="!loadingAgents && agents.length === 0"
                  class="text-sm text-gray-500 text-center py-4"
                >
                  No other agents available.
                </p>
              </div>

              <p
                v-if="errors.destinationAgentId"
                class="text-red-500 text-xs mt-1"
              >
                {{ errors.destinationAgentId }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Reason for reassignment <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.reason"
                rows="3"
                placeholder="E.g.: I have a family emergency and will not be able to attend this visit..."
                class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                :class="
                  errors.reason ? 'border-red-400 focus:ring-red-400' : ''
                "
              />
              <div class="flex justify-between mt-1">
                <p v-if="errors.reason" class="text-red-500 text-xs">
                  {{ errors.reason }}
                </p>
                <p class="text-xs text-gray-400 ml-auto">
                  {{ form.reason.length }}/300
                </p>
              </div>
            </div>
          </div>

          <div class="px-6 pb-6 flex gap-3 justify-end">
            <button
              @click="$emit('update:modelValue', false)"
              class="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              @click="handleSubmit"
              :disabled="loading"
              class="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <IconLucideLoader v-if="loading" class="animate-spin w-4 h-4" />
              <span>{{ loading ? 'Sending...' : 'Send request' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import type { AvailableAgent } from '@/types/reassignment';
import reassignmentService from '@/services/reassignmentService';
import IconLucideUsers from '~icons/lucide/users';
import IconLucideX from '~icons/lucide/x';
import IconLucideAlertCircle from '~icons/lucide/alert-circle';
import IconLucideCircleCheck from '~icons/lucide/circle-check';
import IconLucideLoader from '~icons/lucide/loader';

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
  try {
    agents.value = await reassignmentService.getAvailableAgents();
  } catch {
    errorMsg.value = 'Could not load the list of agents.';
  } finally {
    loadingAgents.value = false;
  }
}

function validate(): boolean {
  errors.destinationAgentId = '';
  errors.reason = '';
  let valid = true;

  if (!form.destinationAgentId) {
    errors.destinationAgentId = 'You must select a target colleague.';
    valid = false;
  }
  if (!form.reason.trim() || form.reason.trim().length < 10) {
    errors.reason = 'The reason must be at least 10 characters long.';
    valid = false;
  }
  if (form.reason.length > 300) {
    errors.reason = 'The reason cannot exceed 300 characters.';
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
    const err = e as Record<string, { data?: { error?: string } } | undefined>;
    errorMsg.value =
      err?.response?.data?.error ??
      'Failed to send the request. Please try again.';
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
