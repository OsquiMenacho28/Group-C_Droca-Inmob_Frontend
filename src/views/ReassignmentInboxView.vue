<template>
  <!--
    ReassignmentInboxView.vue
    Inbox view showing all PENDING reassignment requests received by
    the authenticated agent, with Accept / Reject actions.
  -->
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Page header -->
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
          <svg
            :class="loading ? 'animate-spin' : ''"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      <!-- Loading skeleton -->
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

      <!-- Error state -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-700"
      >
        <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <p class="text-sm">{{ error }}</p>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="requests.length === 0"
        class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
      >
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-1">All caught up</h3>
        <p class="text-gray-500 text-sm">
          You have no pending reassignment requests.
        </p>
      </div>

      <!-- Request cards -->
      <TransitionGroup name="list" tag="div" class="space-y-4" v-else>
        <div
          v-for="r in requests"
          :key="r.id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <!-- Card header -->
          <div
            class="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <!-- Requesting agent avatar -->
              <div
                class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0"
              >
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
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

          <!-- Card body -->
          <div class="px-5 py-4 space-y-3">
            <!-- visit ID -->
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg
                class="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-gray-500">visit ID:</span>
              <span class="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{{
                r.visitId
              }}</span>
            </div>

            <!-- Reason -->
            <div class="bg-blue-50 rounded-xl px-4 py-3">
              <p
                class="text-xs font-medium text-blue-700 mb-1 uppercase tracking-wide"
              >
                Reason
              </p>
              <p class="text-sm text-gray-700">{{ r.reason }}</p>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="px-5 pb-5 flex gap-3">
            <button
              @click="openResponseModal(r, 'ACCEPTED')"
              :disabled="processingId === r.id"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Accept
            </button>
            <button
              @click="openResponseModal(r, 'REJECTED')"
              :disabled="processingId === r.id"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Reject
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Confirmation modal -->
    <ConfirmResponseModal
      v-model="responseModalVisible"
      :request="selectedRequest"
      :decision="selectedDecision"
      @confirmed="handleConfirmed"
    />

    <!-- Success toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toastVisible"
          class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium"
        >
          <svg
            class="w-5 h-5 text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          {{ toastMsg }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useReassignment } from "../composables/useReassignment";
import ConfirmResponseModal from "../components/visits/reassignment/ConfirmResponseModal.vue";
import type { ReassignmentSolicitation } from "../types/reassignment";

const {
  receivedRequests: requests,
  loading,
  error,
  loadReceivedRequests,
  respondToRequest,
} = useReassignment();

// ── Local state ───────────────────────────────────────────────────────────
const responseModalVisible = ref(false);
const selectedRequest = ref<ReassignmentSolicitation | null>(null);
const selectedDecision = ref<"ACCEPTED" | "REJECTED">("ACCEPTED");
const processingId = ref<string | null>(null);
const toastVisible = ref(false);
const toastMsg = ref("");

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(load);

async function load() {
  await loadReceivedRequests();
}

// ── Methods ───────────────────────────────────────────────────────────────
function openResponseModal(
  r: ReassignmentSolicitation,
  decision: "ACCEPTED" | "REJECTED",
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
      selectedDecision.value === "ACCEPTED"
        ? "Request accepted. The visit has been added to your schedule."
        : "Request rejected. The original agent keeps the visit.",
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
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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