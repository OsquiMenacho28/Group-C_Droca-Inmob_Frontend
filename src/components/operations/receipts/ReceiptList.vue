<template>
  <div>
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 animate-pulse"
      >
        <div class="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div class="h-8 w-20 bg-gray-200 rounded-lg"></div>
      </div>
    </div>

    <div
      v-else-if="receipts.length === 0"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <div
        class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3"
      >
        <IconLucideClipboardList class="w-7 h-7 text-gray-400" />
      </div>
      <p class="text-sm font-medium text-gray-600">No receipts attached yet</p>
      <p class="text-xs text-gray-400 mt-1">
        Upload a payment receipt using the form above.
      </p>
    </div>

    <TransitionGroup v-else name="receipt-list" tag="div" class="space-y-3">
      <div
        v-for="receipt in receipts"
        :key="receipt.id"
        class="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
      >
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
          :class="isPdf(receipt) ? 'bg-red-500' : 'bg-emerald-500'"
        >
          <IconLucideFileText v-if="isPdf(receipt)" class="w-5 h-5" />
          <IconLucideImage v-else class="w-5 h-5" />
        </div>

        <div class="flex-1 min-w-0">
          <p
            class="text-sm font-medium text-gray-800 truncate"
            :title="receipt.originalFileName"
          >
            {{ receipt.originalFileName }}
          </p>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            <span class="text-xs text-gray-500">{{ receipt.concept }}</span>
            <span class="text-gray-300 text-xs">·</span>
            <span class="text-xs text-gray-500">{{
              formatDate(receipt.paymentDate)
            }}</span>
            <span class="text-gray-300 text-xs">·</span>
            <span class="text-xs text-gray-400">{{
              formatSize(receipt.fileSizeBytes)
            }}</span>
          </div>
        </div>

        <div class="text-right shrink-0 hidden sm:block">
          <p class="text-sm font-bold text-gray-800">
            {{ formatAmount(receipt.amount, receipt.currency) }}
          </p>
          <p class="text-xs text-gray-400">
            {{ formatDate(receipt.uploadedAt) }}
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <a
            v-if="receipt.downloadUrl"
            :href="receipt.downloadUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition"
            :title="`Download ${receipt.originalFileName}`"
          >
            <IconLucideDownload class="w-3.5 h-3.5" />
            Download
          </a>

          <button
            @click="confirmDelete(receipt)"
            :disabled="deletingId === receipt.id"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition"
            title="Delete receipt"
          >
            <IconLucideLoader
              v-if="deletingId === receipt.id"
              class="animate-spin w-3.5 h-3.5"
            />
            <IconLucideTrash v-else class="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </TransitionGroup>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="receiptToDelete"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          @click.self="receiptToDelete = null"
        >
          <div
            class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div
              class="bg-linear-to-r from-red-500 to-red-700 px-6 py-5 flex items-center gap-3"
            >
              <div class="bg-white/20 rounded-full p-2">
                <IconLucideTrash class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-white font-semibold">Delete Receipt</h3>
                <p class="text-red-200 text-sm">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div class="px-6 py-5">
              <p class="text-sm text-gray-700">
                Are you sure you want to delete
                <span class="font-medium">{{
                  receiptToDelete.originalFileName
                }}</span
                >? The file will be permanently removed from storage.
              </p>
            </div>
            <div class="px-6 pb-6 flex gap-3 justify-end">
              <button
                @click="receiptToDelete = null"
                class="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                @click="handleDelete"
                class="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import IconLucideClipboardList from '~icons/lucide/clipboard-list';
import IconLucideFileText from '~icons/lucide/file-text';
import IconLucideImage from '~icons/lucide/image';
import IconLucideDownload from '~icons/lucide/download';
import IconLucideTrash from '~icons/lucide/trash';
import IconLucideLoader from '~icons/lucide/loader';
import { ref } from 'vue';
import type { Receipt } from '@/types/receipt';

defineProps<{
  receipts: Receipt[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'delete', receiptId: string): void;
}>();

const receiptToDelete = ref<Receipt | null>(null);
const deletingId = ref<string | null>(null);

function confirmDelete(receipt: Receipt) {
  receiptToDelete.value = receipt;
}

function handleDelete() {
  if (!receiptToDelete.value) return;
  deletingId.value = receiptToDelete.value.id;
  emit('delete', receiptToDelete.value.id);
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
  return new Date(iso).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
</script>

<style scoped>
.receipt-list-enter-active,
.receipt-list-leave-active {
  transition: all 0.3s ease;
}
.receipt-list-enter-from,
.receipt-list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
