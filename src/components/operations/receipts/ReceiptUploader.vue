<template>
  <!--
    ReceiptUploader.vue
    Drag-and-drop file uploader with form fields for amount, currency,
    payment date, and concept. Emits 'uploaded' on success.

    USAGE inside OperationReceiptsSection:
      <ReceiptUploader :operation-id="operationId" @uploaded="onUploaded" />
  -->
  <div class="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
    <h3 class="text-base font-semibold text-gray-800 flex items-center gap-2">
      <svg
        class="w-5 h-5 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
      Attach Payment Receipt
    </h3>

    <!-- ── Drop Zone ──────────────────────────────────────────────────────── -->
    <div
      class="relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer"
      :class="[
        isDragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50',
        selectedFile ? 'py-4 px-5' : 'py-10 px-5',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="triggerFilePicker"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        class="sr-only"
        @change="onFileChange"
      />

      <!-- No file selected -->
      <div
        v-if="!selectedFile"
        class="flex flex-col items-center gap-3 text-center pointer-events-none"
      >
        <div
          class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-700">
            Drag & drop your file here, or
            <span class="text-blue-600 underline">browse</span>
          </p>
          <p class="text-xs text-gray-400 mt-1">
            PDF, JPEG, PNG, WebP — max 10 MB
          </p>
        </div>
      </div>

      <!-- File selected — preview row -->
      <div v-else class="flex items-center gap-4 pointer-events-none">
        <!-- File type icon -->
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          :class="isPdf ? 'bg-red-100' : 'bg-green-100'"
        >
          <svg
            v-if="isPdf"
            class="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <svg
            v-else
            class="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">
            {{ selectedFile.name }}
          </p>
          <p class="text-xs text-gray-400">
            {{ formatSize(selectedFile.size) }} · {{ selectedFile.type }}
          </p>
        </div>
        <button
          class="text-gray-400 hover:text-red-500 transition pointer-events-auto"
          @click.stop="clearFile"
          title="Remove file"
        >
          <svg
            class="w-5 h-5"
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
        </button>
      </div>
    </div>

    <!-- File validation error (PA2) -->
    <div
      v-if="fileError"
      class="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
    >
      <svg
        class="w-4 h-4 shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      {{ fileError }}
    </div>

    <!-- ── Payment Metadata Form ───────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Amount -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          Amount <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          class="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          :class="formErrors.amount ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="formErrors.amount" class="text-red-500 text-xs mt-1">
          {{ formErrors.amount }}
        </p>
      </div>

      <!-- Currency -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          Currency <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.currency"
          class="w-full rounded-xl border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          :class="formErrors.currency ? 'border-red-400' : 'border-gray-300'"
        >
          <option value="" disabled>Select currency</option>
          <option value="BOB">BOB — Boliviano</option>
          <option value="USD">USD — US Dollar</option>
          <option value="EUR">EUR — Euro</option>
        </select>
        <p v-if="formErrors.currency" class="text-red-500 text-xs mt-1">
          {{ formErrors.currency }}
        </p>
      </div>

      <!-- Payment Date -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          Payment Date <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.paymentDate"
          type="datetime-local"
          class="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          :class="formErrors.paymentDate ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="formErrors.paymentDate" class="text-red-500 text-xs mt-1">
          {{ formErrors.paymentDate }}
        </p>
      </div>

      <!-- Concept -->
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">
          Concept <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.concept"
          type="text"
          maxlength="255"
          placeholder="e.g. Initial reservation payment"
          class="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          :class="formErrors.concept ? 'border-red-400' : 'border-gray-300'"
        />
        <p v-if="formErrors.concept" class="text-red-500 text-xs mt-1">
          {{ formErrors.concept }}
        </p>
      </div>
    </div>

    <!-- Upload error from the server -->
    <div
      v-if="uploadError"
      class="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
    >
      <svg
        class="w-4 h-4 shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      {{ uploadError }}
    </div>

    <!-- Upload progress bar -->
    <div v-if="uploading" class="space-y-1">
      <div class="flex justify-between text-xs text-gray-500">
        <span>Uploading...</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Submit button -->
    <div class="flex justify-end">
      <button
        @click="handleSubmit"
        :disabled="uploading"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <svg
          v-if="uploading"
          class="animate-spin w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <svg
          v-else
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        {{ uploading ? "Uploading..." : "Attach Receipt" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useReceipts } from "../../../composables/useReceipts";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_TYPE_LABELS,
} from "../../../types/receipt";

// ── Props & Emits ─────────────────────────────────────────────────────────
const props = defineProps<{ operationId: string }>();

const emit = defineEmits<{
  (e: "uploaded"): void;
}>();

// ── Composable ────────────────────────────────────────────────────────────
const { attachReceipt, uploading, uploadProgress, uploadError } = useReceipts(
  props.operationId,
);

// ── Local state ───────────────────────────────────────────────────────────
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const fileError = ref<string | null>(null);

const form = reactive({
  amount: "",
  currency: "BOB",
  paymentDate: "",
  concept: "",
});

const formErrors = reactive({
  amount: "",
  currency: "",
  paymentDate: "",
  concept: "",
});

// ── Computed ──────────────────────────────────────────────────────────────
const isPdf = computed(() => selectedFile.value?.type === "application/pdf");

// ── File handling ─────────────────────────────────────────────────────────
function triggerFilePicker() {
  fileInputRef.value?.click();
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) applyFile(input.files[0]);
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) applyFile(file);
}

function applyFile(file: File) {
  fileError.value = null;
  // Client-side validation (PA2: show format error immediately)
  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    fileError.value = `Invalid file format. Only ${ALLOWED_TYPE_LABELS} files are accepted.`;
    selectedFile.value = null;
    return;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    fileError.value = `File is too large (${mb} MB). Maximum allowed size is 10 MB.`;
    selectedFile.value = null;
    return;
  }
  selectedFile.value = file;
}

function clearFile() {
  selectedFile.value = null;
  fileError.value = null;
  if (fileInputRef.value) fileInputRef.value.value = "";
}

// ── Form validation ───────────────────────────────────────────────────────
function validateForm(): boolean {
  formErrors.amount = "";
  formErrors.currency = "";
  formErrors.paymentDate = "";
  formErrors.concept = "";
  let valid = true;

  if (!form.amount || Number(form.amount) <= 0) {
    formErrors.amount = "A valid amount greater than zero is required.";
    valid = false;
  }
  if (!form.currency) {
    formErrors.currency = "Please select a currency.";
    valid = false;
  }
  if (!form.paymentDate) {
    formErrors.paymentDate = "Payment date is required.";
    valid = false;
  }
  if (!form.concept.trim()) {
    formErrors.concept = "Concept is required.";
    valid = false;
  }
  return valid;
}

// ── Submit ────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!selectedFile.value) {
    fileError.value = "Please select a file to upload.";
    return;
  }
  if (!validateForm()) return;

  const success = await attachReceipt(selectedFile.value, {
    amount: Number(form.amount),
    currency: form.currency,
    paymentDate: new Date(form.paymentDate).toISOString(),
    concept: form.concept.trim(),
  });

  if (success) {
    // Reset form
    clearFile();
    form.amount = "";
    form.currency = "BOB";
    form.paymentDate = "";
    form.concept = "";
    emit("uploaded");
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
</script>
