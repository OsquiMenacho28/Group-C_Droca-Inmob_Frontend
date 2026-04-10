<template>
  <!--
    OperationReceiptsSection.vue
    Main "Reservation Receipts" section that lives inside the operation
    detail view. Composes ReceiptUploader + ReceiptList into a single
    self-contained block that an agent can drop into any existing detail page.

    USAGE in OperationDetailView.vue (or similar):
      <OperationReceiptsSection :operation-id="operation.id" />
  -->
  <section class="space-y-6">
    <!-- Section header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center"
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">Reservation Receipts</h2>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ receipts.length }} receipt{{ receipts.length !== 1 ? "s" : "" }}
            attached
          </p>
        </div>
      </div>

      <!-- Toggle uploader button -->
      <button
        @click="showUploader = !showUploader"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
        :class="
          showUploader
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        "
      >
        <svg
          class="w-4 h-4 transition-transform duration-200"
          :class="showUploader ? 'rotate-45' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        {{ showUploader ? "Cancel" : "Add Receipt" }}
      </button>
    </div>

    <!-- Error banner (list load error) -->
    <div
      v-if="error"
      class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700"
    >
      <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      {{ error }}
    </div>

    <!-- Uploader (collapsible) -->
    <Transition name="slide-down">
      <ReceiptUploader
        v-if="showUploader"
        :operation-id="operationId"
        @uploaded="onUploaded"
      />
    </Transition>

    <!-- Success toast after upload -->
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
          Receipt attached successfully!
        </div>
      </Transition>
    </Teleport>

    <!-- Receipt list -->
    <ReceiptList
      :receipts="receipts"
      :loading="loading"
      @delete="handleDelete"
    />

    <!-- Summary footer — shown only when there are receipts -->
    <div
      v-if="receipts.length > 0"
      class="bg-gray-50 rounded-2xl border border-gray-200 px-5 py-4"
    >
      <div class="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Total Attached
          </p>
          <p class="text-lg font-bold text-gray-800 mt-0.5">
            {{ receipts.length }} receipt{{ receipts.length !== 1 ? "s" : "" }}
          </p>
        </div>

        <!-- Group totals by currency -->
        <div class="flex flex-wrap gap-4">
          <div
            v-for="(total, currency) in totalsByCurrency"
            :key="currency"
            class="text-right"
          >
            <p
              class="text-xs text-gray-500 uppercase tracking-wide font-medium"
            >
              {{ currency }}
            </p>
            <p class="text-lg font-bold text-blue-700 mt-0.5">
              {{ formatAmount(total, currency) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useReceipts } from "../../../composables/useReceipts";
import ReceiptUploader from "./ReceiptUploader.vue";
import ReceiptList from "./ReceiptList.vue";

// ── Props ─────────────────────────────────────────────────────────────────
const props = defineProps<{ operationId: string }>();

// ── Composable ────────────────────────────────────────────────────────────
const { receipts, loading, error, loadReceipts, deleteReceipt } = useReceipts(
  props.operationId,
);

// ── Local state ───────────────────────────────────────────────────────────
const showUploader = ref(false);
const toastVisible = ref(false);

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(loadReceipts);

// ── Computed — totals grouped by currency ─────────────────────────────────
const totalsByCurrency = computed(() => {
  return receipts.value.reduce<Record<string, number>>((acc, r) => {
    acc[r.currency] = (acc[r.currency] ?? 0) + Number(r.amount);
    return acc;
  }, {});
});

// ── Methods ───────────────────────────────────────────────────────────────
function onUploaded() {
  showUploader.value = false;
  showToast();
}

async function handleDelete(receiptId: string) {
  await deleteReceipt(receiptId);
}

function showToast() {
  toastVisible.value = true;
  setTimeout(() => (toastVisible.value = false), 4000);
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
