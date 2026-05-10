<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-300">
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <router-link
              to="/dashboard"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <IconLucideArrowLeft class="h-5 w-5" />
            </router-link>
            <h1 class="text-2xl font-bold text-primary">
              {{ t('sentRequests.title') }}
            </h1>
          </div>
          <p class="text-secondary text-sm mt-1">
            {{ t('sentRequests.subtitle') }}
          </p>
        </div>
        <button
          @click="load"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover-row shadow-sm disabled:opacity-50"
        >
          <IconLucideRefreshCw class="w-4 h-4" :class="loading ? 'animate-spin' : ''" />
          {{ t('common.refresh') }}
        </button>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center shadow-sm"
        >
          <p class="text-2xl font-bold text-primary">{{ stats.total }}</p>
          <p class="text-xs text-secondary uppercase font-medium">
            {{ t('sentRequests.totalSent') }}
          </p>
        </div>
        <div
          class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center shadow-sm"
        >
          <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{{ stats.pending }}</p>
          <p class="text-xs text-yellow-600 dark:text-yellow-500 uppercase font-medium">
            {{ t('sentRequests.pending') }}
          </p>
        </div>
        <div
          class="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 text-center shadow-sm"
        >
          <p class="text-2xl font-bold text-green-700 dark:text-green-400">{{ stats.accepted }}</p>
          <p class="text-xs text-green-600 dark:text-green-500 uppercase font-medium">
            {{ t('sentRequests.accepted') }}
          </p>
        </div>
      </div>

      <div v-if="loading" class="space-y-3">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-2xl p-5 animate-pulse border border-gray-100 dark:border-gray-700"
        >
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

      <div
        v-else-if="sentRequests.length === 0"
        class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-700"
      >
        <div
          class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <IconLucideArrowLeftRight class="w-8 h-8 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
          {{ t('sentRequests.emptyTitle') }}
        </h3>
        <p class="text-secondary text-sm">
          {{ t('sentRequests.emptyText') }}
        </p>
        <router-link
          to="/calendar"
          class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          {{ t('sentRequests.goToCalendar') }}
        </router-link>
      </div>

      <TransitionGroup name="list" tag="div" class="space-y-4" v-else>
        <div
          v-for="r in sentRequests"
          :key="r.id"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div
            class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-3"
            :class="{
              'bg-yellow-50/30 dark:bg-yellow-900/10': r.status === 'PENDING',
              'bg-green-50/30 dark:bg-green-900/10': r.status === 'ACCEPTED',
              'bg-red-50/30 dark:bg-red-900/10': r.status === 'REJECTED',
            }"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                :class="{
                  'bg-yellow-100 dark:bg-yellow-900/30': r.status === 'PENDING',
                  'bg-green-100 dark:bg-green-900/30': r.status === 'ACCEPTED',
                  'bg-red-100 dark:bg-red-900/30': r.status === 'REJECTED',
                }"
              >
                <IconLucideUser
                  class="w-5 h-5"
                  :class="{
                    'text-yellow-600 dark:text-yellow-400': r.status === 'PENDING',
                    'text-green-600 dark:text-green-400': r.status === 'ACCEPTED',
                    'text-red-600 dark:text-red-400': r.status === 'REJECTED',
                  }"
                />
              </div>
              <div>
                <p class="font-semibold text-gray-800 dark:text-white text-sm">
                  {{ t('sentRequests.to') }}
                  <span class="font-mono text-xs">{{ r.destinationAgentId }}</span>
                </p>
                <p class="text-xs text-secondary">
                  {{ t('sentRequests.sentOn') }} {{ formatDate(r.requestedAt) }}
                </p>
              </div>
            </div>
            <span
              :class="statusBadgeClass(r.status)"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
            >
              <span v-if="r.status === 'PENDING'" class="flex items-center gap-1">
                <span
                  class="w-1.5 h-1.5 bg-yellow-600 dark:bg-yellow-400 rounded-full animate-pulse"
                ></span>
                {{ t('status.pending') }}
              </span>
              <span v-else-if="r.status === 'ACCEPTED'" class="flex items-center gap-1">
                <IconLucideCheck class="w-3 h-3" />
                {{ t('status.accepted') }}
              </span>
              <span v-else class="flex items-center gap-1">
                <IconLucideX class="w-3 h-3" />
                {{ t('status.rejected') }}
              </span>
            </span>
          </div>

          <div class="px-5 py-4 space-y-3">
            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <IconLucideCalendar class="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span class="text-secondary">{{ t('reassignment.visitIdLabel') }}:</span>
              <span
                class="font-mono text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded"
              >
                {{ r.visitId }}
              </span>
            </div>

            <div
              class="rounded-xl px-4 py-3"
              :class="{
                'bg-yellow-50 dark:bg-yellow-900/20': r.status === 'PENDING',
                'bg-gray-50 dark:bg-gray-700/50': r.status !== 'PENDING',
              }"
            >
              <p class="text-xs font-medium text-secondary mb-1 uppercase tracking-wide">
                {{ t('sentRequests.reasonTitle') }}
              </p>
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ r.reason }}</p>
            </div>

            <div
              v-if="r.commentReply"
              class="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 border border-blue-100 dark:border-blue-800"
            >
              <div class="flex items-center gap-2 mb-1">
                <IconLucideMessageCircle class="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <p
                  class="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide"
                >
                  {{ t('sentRequests.colleagueReply') }}
                </p>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ r.commentReply }}</p>
              <p v-if="r.repliedAt" class="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                {{ t('sentRequests.repliedOn') }} {{ formatDate(r.repliedAt) }}
              </p>
            </div>

            <div
              v-if="r.status === 'PENDING'"
              class="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2"
            >
              <IconLucideClock class="w-4 h-4 animate-pulse" />
              {{ t('sentRequests.waitingReply') }}
            </div>

            <div
              v-if="r.status === 'ACCEPTED'"
              class="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2"
            >
              <IconLucideCircleCheck class="w-4 h-4" />
              {{ t('sentRequests.acceptedInfo') }}
            </div>

            <div
              v-if="r.status === 'REJECTED'"
              class="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2"
            >
              <IconLucideAlertCircle class="w-4 h-4" />
              {{ t('sentRequests.rejectedInfo') }}
            </div>
          </div>

          <div v-if="r.status === 'PENDING'" class="px-5 pb-5">
            <div class="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                @click="cancelRequest(r.id)"
                :disabled="cancellingId === r.id"
                class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 transition"
              >
                <IconLucideLoader v-if="cancellingId === r.id" class="w-4 h-4 animate-spin" />
                <span v-else>{{ t('sentRequests.cancelRequest') }}</span>
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="sentRequests.length > 0 && !loading" class="text-center">
        <p class="text-[10px] text-gray-400 dark:text-gray-500">
          {{ t('sentRequests.autoRefreshNote') }}
        </p>
      </div>

      <FwbAlert v-if="successMessage" type="success" class="mt-4">
        {{ successMessage }}
      </FwbAlert>
      <FwbAlert v-if="errorMessage" type="danger" class="mt-4">
        {{ errorMessage }}
      </FwbAlert>

      <FwbModal v-if="showCancelModal" @close="dismissCancel">
        <template #header>
          <span class="text-red-600 dark:text-red-500 font-bold">
            {{ t('sentRequests.cancelModalTitle') }}
          </span>
        </template>
        <template #body>
          <p class="text-gray-600 dark:text-gray-300">
            {{ t('sentRequests.cancelModalText') }}
          </p>
        </template>
        <template #footer>
          <div class="flex gap-2 justify-end">
            <FwbButton @click="dismissCancel" color="alternative">
              {{ t('calendar.noKeep') }}
            </FwbButton>
            <FwbButton @click="confirmCancel" color="red">
              {{ t('common.yes') }}, {{ t('sentRequests.cancelRequest').toLowerCase() }}
            </FwbButton>
          </div>
        </template>
      </FwbModal>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { FwbAlert, FwbButton, FwbModal } from 'flowbite-vue';
  import { useI18n } from 'vue-i18n';
  import { getLocaleString } from '@/locales/i18n';

  const { t } = useI18n();

  import { apiClient as api } from '@/api';
  import type { ReassignmentSolicitation } from '@/types/reassignment';
  import IconLucideArrowLeft from '~icons/lucide/arrow-left';
  import IconLucideRefreshCw from '~icons/lucide/refresh-cw';
  import IconLucideAlertCircle from '~icons/lucide/alert-circle';
  import IconLucideArrowLeftRight from '~icons/lucide/arrow-left-right';
  import IconLucideUser from '~icons/lucide/user';
  import IconLucideCheck from '~icons/lucide/check';
  import IconLucideX from '~icons/lucide/x';
  import IconLucideCalendar from '~icons/lucide/calendar';
  import IconLucideMessageCircle from '~icons/lucide/message-circle';
  import IconLucideClock from '~icons/lucide/clock';
  import IconLucideCircleCheck from '~icons/lucide/circle-check';
  import IconLucideLoader from '~icons/lucide/loader';

  const sentRequests = ref<ReassignmentSolicitation[]>([]);
  const loading = ref(false);
  const error = ref('');
  const cancellingId = ref<string | null>(null);
  const showCancelModal = ref(false);
  const pendingCancelId = ref<string | null>(null);
  const successMessage = ref('');
  const errorMessage = ref('');
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const stats = computed(() => {
    const total = sentRequests.value.length;
    const pending = sentRequests.value.filter((r) => r.status === 'PENDING').length;
    const accepted = sentRequests.value.filter((r) => r.status === 'ACCEPTED').length;
    const rejected = sentRequests.value.filter((r) => r.status === 'REJECTED').length;
    return { total, pending, accepted, rejected };
  });

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      const response = await api.get('/reassignments/sent');
      sentRequests.value = response.data.data;
    } catch {
      error.value = t('sentRequests.loadError');
    } finally {
      loading.value = false;
    }
  }

  async function cancelRequest(requestId: string) {
    pendingCancelId.value = requestId;
    showCancelModal.value = true;
  }

  async function confirmCancel() {
    if (!pendingCancelId.value) return;
    showCancelModal.value = false;
    cancellingId.value = pendingCancelId.value;
    successMessage.value = '';
    errorMessage.value = '';
    try {
      await api.delete(`/reassignments/${pendingCancelId.value}`);
      await load();
      successMessage.value = t('sentRequests.cancelledSuccess');
    } catch {
      errorMessage.value = t('sentRequests.cancelledError');
    } finally {
      cancellingId.value = null;
      pendingCancelId.value = null;
    }
  }

  function dismissCancel() {
    showCancelModal.value = false;
    pendingCancelId.value = null;
  }

  function statusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString(getLocaleString(), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onMounted(() => {
    load();
    intervalId = setInterval(load, 30000);
  });

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
  });
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
</style>
