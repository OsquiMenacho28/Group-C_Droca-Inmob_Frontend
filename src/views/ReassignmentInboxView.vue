<template>
  <div class="app-page py-8 px-4">
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-primary">
            {{ t('reassignmentInbox.title') }}
          </h1>
          <p class="text-secondary text-sm mt-1">
            {{ t('reassignmentInbox.subtitle') }}
          </p>
        </div>
        <button
          @click="load"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 app-card text-sm text-gray-600 dark:text-gray-300 hover-row"
        >
          <IconLucideRefreshCw class="w-4 h-4" :class="loading ? 'animate-spin' : ''" />
          {{ t('reassignmentInbox.refresh') }}
        </button>
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="app-card p-5 animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-center gap-3 text-red-700 dark:text-red-400"
      >
        <IconLucideAlertCircle class="w-5 h-5 shrink-0" />
        <p class="text-sm">{{ error }}</p>
      </div>

      <div v-else-if="requests.length === 0" class="app-card p-12 text-center">
        <div
          class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <IconLucideCheckCircle class="w-8 h-8 text-green-500" />
        </div>
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
          {{ t('reassignmentInbox.emptyTitle') }}
        </h3>
        <p class="text-secondary text-sm">
          {{ t('reassignmentInbox.emptyText') }}
        </p>
      </div>

      <TransitionGroup name="list" tag="div" class="space-y-4" v-else>
        <div v-for="r in requests" :key="r.id" class="app-card overflow-hidden">
          <div
            class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0"
              >
                <IconLucideUser class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="font-semibold text-gray-800 dark:text-white text-sm">
                  {{ t('reassignmentInbox.agentId') }} {{ r.requestingAgentId }}
                </p>
                <p class="text-xs text-secondary">
                  {{ t('reassignmentInbox.requestedLabel') }} · {{ formatDate(r.requestedAt) }}
                </p>
              </div>
            </div>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 shrink-0"
            >
              {{ t('reassignmentInbox.pending') }}
            </span>
          </div>

          <div class="px-5 py-4 space-y-3">
            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <IconLucideCalendar class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span class="text-secondary">
                {{ t('reassignmentInbox.visitIdLabel') }}
              </span>
              <span class="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                {{ r.visitId }}
              </span>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
              <p
                class="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1 uppercase tracking-wide"
              >
                {{ t('reassignmentInbox.reason') }}
              </p>
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ r.reason }}</p>
            </div>
          </div>

          <div class="px-5 pb-5 flex gap-3">
            <button
              @click="openResponseModal(r, 'ACCEPTED')"
              :disabled="processingId === r.id"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
            >
              <IconLucideCheck class="w-4 h-4" />
              {{ t('reassignmentInbox.accept') }}
            </button>
            <button
              @click="openResponseModal(r, 'REJECTED')"
              :disabled="processingId === r.id"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 transition"
            >
              <IconLucideX class="w-4 h-4" />
              {{ t('reassignmentInbox.reject') }}
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

    <AppToast
      :show="toastVisible"
      :message="toastMsg"
      type="success"
      @close="toastVisible = false"
    />
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
  import { ref, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { useReassignment } from '@/composables/useReassignment';
  import ConfirmResponseModal from '@/components/visits/reassignment/ConfirmResponseModal.vue';
  import AppToast from '@/components/ui/AppToast.vue';
  import { formatDate } from '@/utils/dateTime';
  import type { ReassignmentSolicitation } from '@/types/reassignment';

  const { t } = useI18n();

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

  function openResponseModal(r: ReassignmentSolicitation, decision: 'ACCEPTED' | 'REJECTED') {
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
          ? t('reassignmentInbox.toastAccepted')
          : t('reassignmentInbox.toastRejected')
      );
    }
    processingId.value = null;
  }

  function showToast(msg: string) {
    toastMsg.value = msg;
    toastVisible.value = true;
    setTimeout(() => (toastVisible.value = false), 4000);
  }
</script>
