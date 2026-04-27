<template>
  <div class="space-y-4">
    <div v-if="loading" class="space-y-4">
      <FwbCard
        v-for="i in 3"
        :key="i"
        class="!max-w-full w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 animate-pulse"
      >
        <div class="p-8 flex items-center gap-6">
          <div class="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl shrink-0" />
          <div class="flex-1 space-y-4">
            <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
          <div class="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </FwbCard>
    </div>

    <FwbCard
      v-else-if="receipts.length === 0"
      class="!max-w-full w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        class="w-20 h-20 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-6 shadow-inner"
      >
        <IconLucideClipboardList class="w-10 h-10 text-gray-300 dark:text-gray-600" />
      </div>
      <p class="text-xl font-bold text-gray-900 dark:text-white">{{ t('receipts.emptyTitle') }}</p>
      <p class="text-base text-gray-500 dark:text-gray-400 mt-2 max-w-sm leading-relaxed">
        {{ t('receipts.emptySubtext') }}
      </p>
    </FwbCard>

    <div v-else class="space-y-4">
      <FwbCard
        v-for="receipt in receipts"
        :key="receipt.id"
        class="!max-w-full w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg transition-all duration-300 group overflow-hidden"
      >
        <div
          class="p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center gap-6 md:gap-8"
        >
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-xl transform group-hover:scale-110 transition-transform duration-300"
            :class="
              isPdf(receipt)
                ? 'bg-red-500 shadow-red-500/20'
                : 'bg-emerald-500 shadow-emerald-500/20'
            "
          >
            <IconLucideFileText v-if="isPdf(receipt)" class="w-7 h-7" />
            <IconLucideImage v-else class="w-7 h-7" />
          </div>

          <div class="flex-1 min-w-0">
            <h4
              class="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              :title="receipt.originalFileName"
            >
              {{ receipt.originalFileName }}
            </h4>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
              <span
                class="text-xs font-black px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg uppercase tracking-wider"
              >
                {{ receipt.concept }}
              </span>
              <span class="text-gray-300 dark:text-gray-700 hidden xs:inline">|</span>
              <div
                class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium"
              >
                <IconLucideCalendar class="w-3.5 h-3.5 opacity-70" />
                {{ formatDate(receipt.paymentDate) }}
              </div>
              <span class="text-gray-300 dark:text-gray-700 hidden xs:inline">|</span>
              <span class="text-xs text-gray-400 dark:text-gray-500 font-mono">
                {{ formatSize(receipt.fileSizeBytes) }}
              </span>
            </div>
          </div>

          <div
            class="text-left lg:text-right shrink-0 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-700 flex flex-row lg:flex-col justify-between items-center lg:items-end gap-2"
          >
            <p class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {{ formatAmount(receipt.amount, receipt.currency) }}
            </p>
            <p
              class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded"
            >
              {{ t('common.date') }}: {{ formatDate(receipt.uploadedAt) }}
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0 w-full lg:w-auto pt-2 lg:pt-0">
            <FwbButton
              v-if="receipt.downloadUrl"
              :href="receipt.downloadUrl"
              target="_blank"
              rel="noopener noreferrer"
              color="light"
              size="sm"
              class="flex-1 lg:flex-none dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600 font-bold"
            >
              <div class="flex items-center justify-center gap-2">
                <IconLucideDownload class="w-4 h-4" />
                <span>{{ t('receipts.download') }}</span>
              </div>
            </FwbButton>

            <FwbButton
              @click="confirmDelete(receipt)"
              :disabled="deletingId === receipt.id"
              color="red"
              outline
              size="sm"
              class="flex-1 lg:flex-none font-bold"
            >
              <div class="flex items-center justify-center gap-2">
                <IconLucideLoader v-if="deletingId === receipt.id" class="animate-spin w-4 h-4" />
                <IconLucideTrash v-else class="w-4 h-4" />
                <span>{{ t('receipts.delete') }}</span>
              </div>
            </FwbButton>
          </div>
        </div>
      </FwbCard>
    </div>

    <FwbModal v-if="showDeleteModal" @close="showDeleteModal = false" size="md">
      <template #header>
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center shadow-sm"
          >
            <IconLucideTrash class="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 class="font-black text-xl text-gray-900 dark:text-white leading-tight">
              {{ t('receipts.deleteTitle') }}
            </h3>
            <p
              class="text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest mt-0.5"
            >
              {{ t('receipts.deleteWarning') }}
            </p>
          </div>
        </div>
      </template>

      <template #body>
        <div class="p-2 space-y-4">
          <p class="text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
            {{ t('receipts.deleteConfirm') }}
          </p>
          <div
            class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center"
              >
                <IconLucideFileText class="w-5 h-5 text-gray-500" />
              </div>
              <p class="text-sm font-bold text-gray-900 dark:text-white truncate">
                {{ receiptToDelete?.originalFileName }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex gap-4 justify-end w-full">
          <FwbButton
            @click="showDeleteModal = false"
            color="light"
            class="dark:bg-gray-700 dark:text-white font-bold px-6"
          >
            {{ t('receipts.cancel') }}
          </FwbButton>
          <FwbButton
            @click="handleDelete"
            color="red"
            :disabled="!receiptToDelete"
            class="font-bold px-6 shadow-lg shadow-red-500/20"
          >
            {{ t('receipts.delete') }}
          </FwbButton>
        </div>
      </template>
    </FwbModal>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  import IconLucideClipboardList from '~icons/lucide/clipboard-list';
  import IconLucideFileText from '~icons/lucide/file-text';
  import IconLucideImage from '~icons/lucide/image';
  import IconLucideDownload from '~icons/lucide/download';
  import IconLucideTrash from '~icons/lucide/trash';
  import IconLucideLoader from '~icons/lucide/loader';
  import IconLucideCalendar from '~icons/lucide/calendar';
  import { ref } from 'vue';
  import { FwbCard, FwbButton, FwbModal } from 'flowbite-vue';
  import type { Receipt } from '@/types/receipt';
  import { getLocaleString } from '@/locales/i18n';

  const { t } = useI18n();

  defineProps<{
    receipts: Receipt[];
    loading: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'delete', receiptId: string): void;
  }>();

  const receiptToDelete = ref<Receipt | null>(null);
  const deletingId = ref<string | null>(null);
  const showDeleteModal = ref(false);

  function confirmDelete(receipt: Receipt) {
    receiptToDelete.value = receipt;
    showDeleteModal.value = true;
  }

  function handleDelete() {
    if (!receiptToDelete.value) return;
    deletingId.value = receiptToDelete.value.id;
    emit('delete', receiptToDelete.value.id);
    showDeleteModal.value = false;
    receiptToDelete.value = null;
    setTimeout(() => {
      deletingId.value = null;
    }, 1500);
  }

  function isPdf(receipt: Receipt): boolean {
    return receipt.contentType === 'application/pdf';
  }

  function formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString(getLocaleString(), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat(getLocaleString(), {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' ' + t('common.units.bytes');
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' ' + t('common.units.kb');
    return (bytes / (1024 * 1024)).toFixed(1) + ' ' + t('common.units.mb');
  }
</script>
