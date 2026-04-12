<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Reassignment Requests
          </h1>
          <p class="text-gray-500 text-sm mt-1">
            Requests waiting for your response
          </p>
        </div>
        <button
          @click="load"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm"
        >
          <IconLucideRefreshCw
            class="w-4 h-4"
            :class="loading ? 'animate-spin' : ''"
          />
          Refresh
        </button>
      </div>

      <div v-if="loading" class="space-y-3">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white rounded-2xl p-5 animate-pulse"
        >
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-700"
      >
        <IconLucideAlertCircle class="w-5 h-5 shrink-0" />
        <p class="text-sm">{{ error }}</p>
      </div>

      <div
        v-else-if="requests.length === 0"
        class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
      >
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <IconLucideCheckCircle class="w-8 h-8 text-green-500" />
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-1">All caught up</h3>
        <p class="text-gray-500 text-sm">
          You have no pending reassignment requests.
        </p>
      </div>

      <TransitionGroup name="list" tag="div" class="space-y-4" v-else>
        <div
          v-for="r in requests"
          :key="r.id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div
            class="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0"
              >
                <IconLucideUser class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="font-semibold text-gray-800 text-sm">
                  Agent ID: {{ r.requestingAgentId }}
                </p>
                <p class="text-xs text-gray-500">
                  Requested reassignment · {{ formatDate(r.requestedAt) }}
                </p>
              </div>
            </div>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 shrink-0"
            >
              Pending
            </span>
          </div>

          <div class="px-5 py-4 space-y-3">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <IconLucideCalendar class="w-4 h-4 text-gray-400 shrink-0" />
              <span class="text-gray-500">visit ID:</span>
              <span class="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{{
                r.visitId
              }}</span>
            </div>

            <div class="bg-blue-50 rounded-xl px-4 py-3">
              <p
                class="text-xs font-medium text-blue-700 mb-1 uppercase tracking-wide"
              >
                Reason
              </p>
              <p class="text-sm text-gray-700">{{ r.reason }}</p>
            </div>
          </div>

          <div class="px-5 pb-5 flex gap-3">
            <button
              @click="openResponseModal(r, 'ACCEPTED')"
              :disabled="processingId === r.id"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
            >
              <IconLucideCheck class="w-4 h-4" />
              Accept
            </button>
            <button
              @click="openResponseModal(r, 'REJECTED')"
              :disabled="processingId === r.id"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition"
            >
              <IconLucideX class="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <ConfirmResponseModal
      v-model="responseModalVisible"
      :request="selectedRequest"
      :decision="selectedDecision"
      @confirmed="handleConfirmed"
    />

    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toastVisible"
          class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium"
        >
          <IconLucideCircleCheck class="w-5 h-5 text-green-400" />
          {{ toastMsg }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import IconLucideRefreshCw from '~icons/lucide/refresh-cw';
import IconLucideAlertCircle from '~icons/lucide/alert-circle';
import IconLucideCheckCircle from '~icons/lucide/check-circle';
import IconLucideUser from '~icons/lucide/user';
import IconLucideCalendar from '~icons/lucide/calendar';
import IconLucideCheck from '~icons/lucide/check';
import IconLucideX from '~icons/lucide/x';
import IconLucideCircleCheck from '~icons/lucide/circle-check';
import { ref, onMounted } from 'vue';
import { useReassignment } from '@/composables/useReassignment';
import ConfirmResponseModal from '@/components/visits/reassignment/ConfirmResponseModal.vue';
import type { ReassignmentSolicitation } from '@/types/reassignment';

const {
  receivedRequests: requests,
  loading,
  error,
  loadReceivedRequests,
  respondToRequest,
} = useReassignment();

const responseModalVisible = ref(false);
const selectedRequest = ref<ReassignmentSolicitation | null>(null);
const selectedDecision = ref<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
const processingId = ref<string | null>(null);
const toastVisible = ref(false);
const toastMsg = ref('');

onMounted(load);

async function load() {
  await loadReceivedRequests();
}

function openResponseModal(
  r: ReassignmentSolicitation,
  decision: 'ACCEPTED' | 'REJECTED'
) {
  selectedRequest.value = r;
  selectedDecision.value = decision;
  responseModalVisible.value = true;
}

async function handleConfirmed(payload: { comment?: string }) {
  if (!selectedRequest.value) return;
  processingId.value = selectedRequest.value.id;

  const success = await respondToRequest(selectedRequest.value.id, {
    decision: selectedDecision.value,
    comment: payload.comment,
  });

  if (success) {
    showToast(
      selectedDecision.value === 'ACCEPTED'
        ? 'Request accepted. The visit has been added to your schedule.'
        : 'Request rejected. The original agent keeps the visit.'
    );
  }
  processingId.value = null;
}

function showToast(msg: string) {
  toastMsg.value = msg;
  toastVisible.value = true;
  setTimeout(() => (toastVisible.value = false), 4000);
}

function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
